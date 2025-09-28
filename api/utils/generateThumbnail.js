import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES module mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to the "uploads" folder as mapped in Express
const UPLOADS_ABS_PATH = path.join(__dirname, "../../client/public/uploads");
// Subfolder name inside 'uploads'
const THUMBNAILS_DIR_NAME = "thumbnails";

/**
 * Generates a static thumbnail from a video file.
 * @param {string} videoFilename - The Multer filename (e.g., "1702476562095.mp4").
 * @param {number} storyId - The ID of the story, used for predictable thumbnail naming (e.g., 15).
 * @returns {Promise<string>} - The filename of the generated thumbnail (e.g., "15.jpg").
 */

export const generateThumbnail = (videoFilename, storyId) => {
  return new Promise((resolve, reject) => {
    const videoPath = path.join(UPLOADS_ABS_PATH, videoFilename);
    const thumbnailPath = path.join(UPLOADS_ABS_PATH, THUMBNAILS_DIR_NAME);
    const outputFilename = `${storyId}.jpg`;

    // Check if the file exists before proceeding
    if (!fs.existsSync(videoPath))
      return reject(new Error(`Video file not found at: ${videoPath}`));

    // 1 - Ensure the output directory exists
    if (!fs.existsSync(thumbnailPath))
      fs.mkdirSync(thumbnailPath, { recursive: true });

    // 2 - Use fluent-ffmpeg to capture the frame at 1 second mark
    ffmpeg(videoPath)
      .seekInput("00:00:01") // Seek to 1 second to avoid black frames
      .frames(1) // Capture only one frame
      .outputOptions(["-f image2"]) // Force output to be an image
      .save(path.join(thumbnailPath, outputFilename))
      .on("end", () => {
        // Resolve the Promise with the final filename (just the predictable name)
        resolve(outputFilename);
      })
      .on("error", (err) => {
        reject(
          new Error(`Thumbnail generation failed (FFmpeg): ${err.message}`)
        );
      });
  });
};
