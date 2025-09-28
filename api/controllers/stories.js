import { db, executeQuery } from "../db/connect.js";
import { isImage, isVideo } from "../utils/isFile.js";
import moment from "moment";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";

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
  const loggedInUserId = req.user.id; // Determine if we are fetching stories for a specific profile (where targetUserId is set and not the string "undefined")

  const isFetchingProfileStories = targetUserId && targetUserId !== "undefined";

  try {
    // Delete former stories even non expired before getting new ones
    // In large-scale projects, better use a cron job to reduce loading time of SQL query
    const deleteQuery = "DELETE FROM stories WHERE expiresAt <= NOW()";
    await executeQuery(deleteQuery); // Get stories: either for a specific user profile (if isFetchingProfileStories is true) // or for the current user's feed (user's own story + followed users stories)

    const selectQuery = isFetchingProfileStories
      ? `SELECT s.*, u.id AS userId, firstName, lastName
               FROM stories AS s 
               JOIN users AS u ON (u.id = s.userId) 
               WHERE s.userId = ? 
               ORDER BY s.createdAt DESC`
      : `
               SELECT s.*, u.id as userId, firstName, lastName
               FROM stories AS s
               JOIN users AS u ON (u.id = s.userId)
               WHERE s.userId = ? 
               OR s.userId IN (SELECT followedId 
               FROM relationships WHERE followerId = ?)
               AND s.expiresAt > NOW()
               ORDER BY
                 CASE WHEN s.userId = ? THEN 0 ELSE 1 END,
                 s.createdAt DESC`; // Logged-in user story displayed first, then most recent friends' stories

    // Use the correct values based on the query type
    const values = isFetchingProfileStories
      ? [targetUserId]
      : [loggedInUserId, loggedInUserId, loggedInUserId]; // Fixed the logic to prevent 'undefined' bind error

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
  if (!file || file?.trim()?.length === 0)
    return res
      .status(400)
      .json({ message: "You must provide either an image or a video file." });

  // Validate file format
  if (file && !isImage(file) && !isVideo(file))
    return res
      .status(400)
      .json({ message: "You must provide a valid image or video format." });

  // Validate description
  if (text?.trim()?.length > 45)
    return res.status(400).json({
      message: "Description can't contain more than 45\u00A0characters.",
    });

  try {
    // START: SERVER-SIDE VIDEO DURATION VALIDATION (Fallback for client-side failure)
    if (isVideo(file)) {
      // 1 - Determine the full path of the uploaded file
      // FIX: Using the predefined UPLOADS_PATH based on our 'client/public/uploads' structure
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

    // END : SERVER-SIDE VIDEO DURATION VALIDATION

    // Delete the current story if non expired before creating a new one
    const deleteQuery = `
          DELETE FROM stories WHERE userId = ? AND expiresAt > NOW()
        `;
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

    await executeQuery(insertQuery, values);

    return res.status(201).json({ message: "New story created" });
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
      try {
        // Deleting story from server in "uploads" folder
        fs.unlinkSync(path.join(UPLOADS_PATH, storyData[0].file));
        console.log(`Story file ${storyData[0].file} deleted.`);
      } catch (err) {
        console.error(`Error deleting story file ${storyData[0].file}:`, err);
      }
    }

    // Delete story from database
    const q = "DELETE FROM stories WHERE id = ? AND userId = ?";
    const data = await executeQuery(q, [storyId, loggedInUserId]);

    if (data.affectedRows > 0)
      return res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    console.error("Error deleting story:", error);
    return res.status(500).json({
      message: "An unknown error occurred while deleting story.",
      error: error.message,
    });
  }
};
