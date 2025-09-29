import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES module mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define standard image extensions for internal check
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|bmp|svg|webp|tiff)$/i;
const isImageFile = (filename) => IMAGE_EXTENSIONS.test(path.extname(filename));

// Absolute path to the "uploads" folder as mapped in Express
const UPLOADS_ABS_PATH = path.join(__dirname, "../../client/public/uploads");
// Subfolder name inside 'uploads'
const THUMBNAILS_DIR_NAME = "thumbnails";

/**
 * Generates an optimized thumbnail (always .jpg) from either an image or video file
 * @param {string} filename - The Multer filename (e.g., "1702476562095.mp4").
 * @param {number} storyId - The ID of the story, used for predictable thumbnail naming (e.g., 15).
 * @returns {Promise<string>} - The filename of the generated thumbnail (e.g., "15.jpg")
 */

export const generateThumbnail = (filename, storyId) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(UPLOADS_ABS_PATH, filename);
    const thumbnailPath = path.join(UPLOADS_ABS_PATH, THUMBNAILS_DIR_NAME);
    const outputFilename = `${storyId}.jpg`;
    const outputFilePath = path.join(thumbnailPath, outputFilename);

    // Check if the file exists before proceeding
    if (!fs.existsSync(filePath))
      return reject(new Error(`File not found at: ${filePath}`));

    // 1 - Ensure the "thumbnails" directory exists (create it recursively if missing)
    if (!fs.existsSync(thumbnailPath))
      fs.mkdirSync(thumbnailPath, { recursive: true });

    // Detect if the file is an image (otherwise, assume it's a video)
    const isImage = isImageFile(filename);

    // Initialize ffmpeg command with the input file
    let ffmpegCommand = ffmpeg(filePath);

    if (isImage) {
      // 2A - IMAGE thumbnail logic:
      // - Resize if larger than 1080px wide
      // - Compress to JPEG with quality 2 (higher quality, less compression)
      ffmpegCommand.outputOptions([
        "-vf",
        "scale='min(1080,iw)':-1", // Keep aspect ratio, max width 1080px
        "-q:v",
        "2", // Image quality (lower = better, but bigger size)
        "-f",
        "image2", // Force output as image
      ]);
    } else {
      // 2B - VIDEO thumbnail logic:
      // - Seek to 2 seconds to avoid black frames
      // - Capture only 1 frame
      // - Save output as JPEG
      ffmpegCommand
        .seekInput("00:00:02")
        .frames(1)
        .outputOptions(["-f image2"]);
    }

    // Run FFmpeg command to generate thumbnail
    ffmpegCommand
      .save(outputFilePath)
      .on("end", () => {
        // If successful, resolve the Promise with the final thumbnail filename
        resolve(outputFilename);
      })
      .on("error", (err) => {
        // If FFmpeg fails, reject with an error message
        reject(
          new Error(
            `Thumbnail generation failed for ${
              isImage ? "image" : "video"
            } (FFmpeg): ${err.message}`
          )
        );
      });
  });
};
