import { db, executeQuery } from "../db/connect.js";
import { isImage, isVideo } from "../utils/isFile.js";
import { generateThumbnail } from "../utils/generateThumbnail.js";
import moment from "moment";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg"; //! ⚠️ ffmpeg must also be installed on our VPS !!!
//? FFmpeg is a powerful, open-source software framework used for handling, converting, streaming, and playing multimedia files and streams

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_PATH = path.join(__dirname, "../../client/public/uploads");

// Get video story duration in seconds (Promise-based)
const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);

      // Duration is stored in metadata.format.duration
      resolve(metadata.format.duration);
    });
  });
};

export const getStories = async (req, res) => {
  const targetUserId = req.query.userId;
  const loggedInUserId = req.user.id;

  // const isFetchingProfileStories = targetUserId && targetUserId !== "undefined";

  try {
    // 1 - Delete former stories even non expired before getting new ones
    // Note: In large-scale projects, better use a cron job to reduce the loading time of a SQL query
    const deleteQuery = "DELETE FROM stories WHERE expiresAt <= NOW()";
    await executeQuery(deleteQuery);

    // 2 - Prepare the SQL query

    // // Query for a specific user's profile
    // const profileQuery = `SELECT s.*, u.id AS userId, firstName, lastName
    //                       FROM stories AS s
    //                       JOIN users AS u ON (u.id = s.userId)
    //                       WHERE s.userId = ?
    //                       ORDER BY s.createdAt DESC`;

    // Query for the logged-in user's feed (user's own story + those of the people he follows)
    const feedQuery = `
        SELECT s.*, u.id as userId, firstName, lastName
        FROM stories AS s
        JOIN users AS u ON (u.id = s.userId)
        WHERE (s.userId = ? OR s.userId IN (SELECT followedId 
        FROM relationships WHERE followerId = ?))
        AND s.expiresAt > NOW()
        ORDER BY
          CASE WHEN s.userId = ? THEN 0 ELSE 1 END,
          s.createdAt DESC`; // Logged-in user story displayed first, then most recent followed users' stories

    // const cleanedProfileQuery = profileQuery.replace(/\s+/g, " ").trim();
    const cleanedFeedQuery = feedQuery.replace(/\s+/g, " ").trim();

    // const selectQuery = isFetchingProfileStories
    //   ? cleanedProfileQuery
    //   : cleanedFeedQuery;

    // const values = isFetchingProfileStories
    //   ? [targetUserId]
    //   : [loggedInUserId, loggedInUserId, loggedInUserId];

    const values = [loggedInUserId, loggedInUserId, loggedInUserId];

    // 3 - Execute the query
    const data = await executeQuery(cleanedFeedQuery, values);
    // const data = await executeQuery(selectQuery, values);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return res.status(500).json({
      message: "An unknown error occurred while fetching stories.",
      error: error.message,
    });
  }
};

export const addStory = async (req, res) => {
  const { file, text } = req.body;
  const loggedInUserId = req.user.id;

  // 1 - CHECK STORY FORMAL REQUIREMENTS

  // Check if a file (image or video) is provided
  if (!file || file?.trim()?.length === 0) {
    return res
      .status(400)
      .json({ message: "You must provide either an image or a video file." });
  }

  // Validate file format
  if (file && !isImage(file) && !isVideo(file)) {
    return res
      .status(400)
      .json({ message: "You must provide a valid image or video format." });
  }

  // Validate description
  if (text?.trim()?.length > 45) {
    return res.status(400).json({
      message: "Description can't contain more than 45\u00A0characters.",
    });
  }

  try {
    // 2 - CHECK ADDITIONAL REQUIREMENTS FOR VIDEO FILE
    if (isVideo(file)) {
      // 2A - Check video duration requirements (Fallback for client-side failure)

      // Determine the full path of the uploaded file
      const videoPath = path.join(UPLOADS_PATH, file);

      // Check if the file exists on the server (for safety)
      if (!fs.existsSync(videoPath)) {
        return res
          .status(404)
          .json({ message: "Uploaded video file not found on server." });
      }

      // Get video duration using ffprobe
      const duration = await getVideoDuration(videoPath);

      // Apply the 60-second rule
      if (duration > 60) {
        // Delete the file to clean up the server storage
        fs.unlinkSync(videoPath);
        return res
          .status(400)
          .json({ message: "Video duration can't exceed 60\u00A0seconds." });
      }
    }
    //-----------------------------------------------------------------------

    // 3 - DELETE THE CURRENT STORY IF NON EXPIRED BEFORE CREATING A NEW ONE
    const deleteQuery =
      "DELETE FROM stories WHERE userId = ? AND expiresAt > NOW()";
    await executeQuery(deleteQuery, [loggedInUserId]);

    // 4 - PREPARE AND EXECUTE THE QUERY
    const currentDateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const expirationDate = moment(Date.now())
      .add(24, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    const insertQuery =
      "INSERT INTO stories(`file`, `text`, `userId`,`createdAt`, `expiresAt`) VALUES (?, ?, ?, ?, ?)";

    const values = [
      file,
      text?.trim(),
      loggedInUserId,
      currentDateTime,
      expirationDate,
    ];

    const result = await executeQuery(insertQuery, values);
    // Retrieve the ID of the newly inserted row
    const storyId = result?.insertId;

    // 5 - GENERATE A THUMBNAIL FOR EITHER IMAGE OR VIDEO FILE IF STORY ID IS AVAILABLE
    if (storyId) {
      try {
        // Reminder: Thumbnail stored as "/uploads/thumbnails/{storyId}.jpg"
        await generateThumbnail(file, storyId);
      } catch (thumbnailError) {
        // We log the error but don't stop the main process : the story is created, but the thumbnail might be missing
        console.warn(
          "Warning: Thumbnail generation failed for story ID:",
          storyId,
          thumbnailError.message
        );
      }
    }
    // --------------------------------------------------------------------

    // 6 - QUERY RESPONSE AS JSON
    return res.status(201).json({
      message: "New story created and processed",
      storyId: storyId, // Returning the ID can be useful for frontend caching
    });
  } catch (error) {
    // 7 - HANDLE GLOBAL ERRORS RELATED TO STORY CREATION
    console.error("Error creating a new story:", error);

    // 7A - Handle potential errors from ffprobe (e.g., corrupt file or unsupported format)
    if (error.message.includes("ffprobe")) {
      // Attempt to delete the file uploaded by Multer, if duration check failed
      try {
        fs.unlinkSync(path.join(UPLOADS_PATH, file));
      } catch (unlinkError) {
        console.error(
          "Failed to clean up file after ffprobe error:",
          unlinkError
        );
      }

      // The code that triggers the error below is the call to the getVideoDuration function (which uses ffprobe to read the video metadata)
      return res.status(400).json({
        message:
          "Could not process video file. It might be corrupt or in an unsupported format.",
      });
    }

    // Return error response as JSON
    return res.status(500).json({
      message: "An unknown error occurred while creating a new story.",
      error: error.message,
    });
  }
};

export const deleteStory = async (req, res) => {
  const storyId = req.params.storyId;
  const loggedInUserId = req.user.id;

  try {
    // 1 - Retrieve story file name before deleting story
    const storyData = await executeQuery(
      "SELECT file FROM stories WHERE id = ? AND userId = ?",
      [storyId, loggedInUserId]
    );

    // 2 - Check if a story file exists
    if (storyData.length > 0 && storyData[0].file) {
      const originalFileName = storyData[0].file;

      // 2A - Delete the main story file (image or video) from our server in "uploads" folder
      try {
        fs.unlinkSync(path.join(UPLOADS_PATH, originalFileName));
        console.log(`Story file ${originalFileName} deleted`);
      } catch (err) {
        console.error(`Error deleting story file ${originalFileName}:`, err);
      }

      // 2B - Delete the associated thumbnail for ALL stories (image or video)
      // Reminder : Thumbnail path is "/uploads/thumbnails/{storyId}.jpg"
      const thumbnailPath = path.join(
        UPLOADS_PATH,
        "thumbnails",
        `${storyId}.jpg`
      );

      try {
        // Check if the thumbnail file exists before attempting deletion
        if (fs.existsSync(thumbnailPath)) {
          // Delete thumbnail from server
          fs.unlinkSync(thumbnailPath);
          console.log(`Thumbnail file for story ${storyId} deleted`);
        }
      } catch (err) {
        console.error(`Error deleting thumbnail for story ${storyId}:`, err);
      }
    }

    // 3 - Delete story from database
    const q = "DELETE FROM stories WHERE id = ? AND userId = ?";
    const data = await executeQuery(q, [storyId, loggedInUserId]);

    if (data.affectedRows > 0)
      return res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    console.error("Error deleting story:", error);
    return res.status(500).json({
      message: "An unknown error occurred while deleting the story.",
      error: error.message,
    });
  }
};
