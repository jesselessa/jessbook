import { db, executeQuery } from "../db/connect.js";
import { isImage, isVideo } from "../utils/isFile.js";
import { generateThumbnail } from "../utils/generateThumbnail.js";
import moment from "moment";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg"; //! ⚠️ ffmpeg must also be installed on our VPS !!!
//? FFmpeg is a powerful, open-source software framework used for handling, converting, streaming, and playing multimedia files and streams

// Get __dirname equivalent in ES module mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a reliable path to the 'uploads' directory, based on our VPS structure (client/public/uploads)
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
  // targetUserId is the ID from the query param (if fetching a profile)
  const targetUserId = req.query.userId;
  const loggedInUserId = req.user.id;

  // Determine if we are fetching stories for a specific profile (where targetUserId is set and not the string "undefined")
  const isFetchingProfileStories = targetUserId && targetUserId !== "undefined";

  try {
    // 1 - Delete former stories even non expired before getting new ones
    // Note : In large-scale projects, better use a cron job to reduce the loading time of a SQL query
    const deleteQuery = "DELETE FROM stories WHERE expiresAt <= NOW()";
    await executeQuery(deleteQuery);

    // 2 - Prepare the SQL query

    // Query for a specific user's profile
    const profileQuery = `SELECT s.*, u.id AS userId, firstName, lastName
                          FROM stories AS s 
                          JOIN users AS u ON (u.id = s.userId) 
                          WHERE s.userId = ? 
                          ORDER BY s.createdAt DESC`;

    // Query for the logged-in user's feed (user's own story + followed users' stories)
    const feedQuery = `
        SELECT s.*, u.id as userId, firstName, lastName
        FROM stories AS s
        JOIN users AS u ON (u.id = s.userId)
        WHERE s.userId = ? 
        OR s.userId IN (SELECT followedId 
        FROM relationships WHERE followerId = ?)
        AND s.expiresAt > NOW()
        ORDER BY
          CASE WHEN s.userId = ? THEN 0 ELSE 1 END,
          s.createdAt DESC`; // Logged-in user story displayed first, then most recent followed users' stories

    const cleanedProfileQuery = profileQuery.replace(/\s+/g, " ").trim();
    const cleanedFeedQuery = feedQuery.replace(/\s+/g, " ").trim();

    const selectQuery = isFetchingProfileStories
      ? cleanedProfileQuery
      : cleanedFeedQuery;

    const values = isFetchingProfileStories
      ? [targetUserId]
      : [loggedInUserId, loggedInUserId, loggedInUserId];

    // 3 - Execute the SQL query
    const data = await executeQuery(selectQuery, values);
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
    // START: SERVER-SIDE VIDEO DURATION VALIDATION (Fallback for client-side failure)
    if (isVideo(file)) {
      // 1 - Determine the full path of the uploaded file
      // We use the predefined UPLOADS_PATH based on our VPS structure (client/public/uploads)
      const videoPath = path.join(UPLOADS_PATH, file);

      // 2 - Check if the file exists on the server (for safety)
      if (!fs.existsSync(videoPath)) {
        return res
          .status(404)
          .json({ message: "Uploaded video file not found on server." });
      }

      // 3 - Get video duration using ffprobe
      const duration = await getVideoDuration(videoPath);

      // 4 - Apply the 60-second rule
      if (duration > 60) {
        // Delete the file to clean up the server storage
        fs.unlinkSync(videoPath);
        return res
          .status(400)
          .json({ message: "Video duration can't exceed 60\u00A0seconds." });
      }
    }
    //----- END: SERVER-SIDE VIDEO DURATION VALIDATION -----

    // Delete the current story if non expired before creating a new one
    const deleteQuery =
      "DELETE FROM stories WHERE userId = ? AND expiresAt > NOW()";
    await executeQuery(deleteQuery, [loggedInUserId]);

    // Create a new story
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

    // Execute insertion and get the new story ID
    const result = await executeQuery(insertQuery, values);
    // Retrieve the ID of the newly inserted row
    const storyId = result?.insertId;

    // ------------------------------------------------------------
    // START: THUMBNAIL GENERATION LOGIC
    // ------------------------------------------------------------
    if (isVideo(file) && storyId) {
      // If it's a video and we successfully got the new ID
      try {
        // 1 - Generate the thumbnail using the original filename and the new story ID (the thumbnail will be stored as "/uploads/thumbnails/{storyId}.jpg")
        await generateThumbnail(file, storyId);
        // Note: We don't need to update the DB ; the frontend constructs the thumbnail path predictably
      } catch (thumbnailError) {
        // Log the error but don't stop the main process
        // The story is created, but the thumbnail might be missing
        console.warn(
          "Warning: Thumbnail generation failed for story ID:",
          storyId,
          thumbnailError.message
        );
      }
    }
    // ------------------------------------------------------------
    // END: THUMBNAIL GENERATION LOGIC
    // ------------------------------------------------------------

    return res.status(201).json({
      message: "New story created and processed",
      storyId: storyId, // Returning the ID can be useful for frontend caching
    });
  } catch (error) {
    console.error("Error creating a new story:", error);

    // Handle potential errors from ffprobe (e.g., corrupt file or unsupported format)
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
    // Retrieve story file name before deleting story
    const storyData = await executeQuery(
      "SELECT file FROM stories WHERE id = ? AND userId = ?",
      [storyId, loggedInUserId]
    );

    // Check if a story file exists
    if (storyData.length > 0 && storyData[0].file) {
      const originalFileName = storyData[0].file;
      const isVideoFile = isVideo(originalFileName);

      try {
        // 1 - Delete the main story file (image or video) from our server in "uploads" folder
        fs.unlinkSync(path.join(UPLOADS_PATH, originalFileName));
        console.log(`Story file ${originalFileName} deleted`);
      } catch (err) {
        console.error(`Error deleting story file ${originalFileName}:`, err);
      }

      // 2 - If it was a video, delete the associated thumbnail
      if (isVideoFile) {
        // The thumbnail path is predictably constructed as "/uploads/thumbnails/{storyId}.jpg" (cf. generateThumbnail utility function)
        const thumbnailPath = path.join(
          UPLOADS_PATH,
          "thumbnails",
          `${storyId}.jpg`
        );

        try {
          // Check if the thumbnail file exists before attempting deletion
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
            console.log(`Thumbnail file for story ${storyId} deleted`);
          }
        } catch (err) {
          console.error(`Error deleting thumbnail for story ${storyId}:`, err);
        }
      }
    }

    // Delete story from database
    const q = "DELETE FROM stories WHERE id = ? AND userId = ?";
    const data = await executeQuery(q, [storyId, loggedInUserId]);

    if (data.affectedRows > 0) {
      return res.status(200).json({ message: "Story deleted" });
    } else {
      // Handle case where story wasn't found or user wasn't authorized
      return res
        .status(404)
        .json({ message: "Story not found or unauthorized" });
    }
  } catch (error) {
    console.error("Error deleting story:", error);
    return res.status(500).json({
      message: "An unknown error occurred while deleting the story.",
      error: error.message,
    });
  }
};
