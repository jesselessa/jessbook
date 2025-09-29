import { db, executeQuery } from "../db/connect.js";
import { isImage } from "../utils/isFile.js";
import moment from "moment";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES module mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a reliable path to the 'uploads' directory, based on our VPS structure (client/public/uploads)
const UPLOADS_PATH = path.join(__dirname, "../../client/public/uploads");

export const getPosts = async (req, res) => {
  // targetUserId is the ID from the query param (if fetching a profile)
  const targetUserId = req.query.userId;
  const loggedInUserId = req.user.id;

  // Determine if we are fetching posts for a specific profile (where targetUserId is set and not the string "undefined")
  const isFetchingProfilePosts = targetUserId && targetUserId !== "undefined";

  // 1 - PREPARE THE SQL QUERY

  // Query for a specific user's profile
  const profileQuery = `SELECT p.*, u.id AS userId, firstName, lastName, profilePic 
             FROM posts AS p 
             JOIN users AS u ON (u.id = p.userId) 
             WHERE p.userId = ? 
             ORDER BY p.createdAt DESC`;

  // Query for the logged-in user's feed (user's own posts + followed users' posts)
  const feedQuery = `
             SELECT p.*, u.id AS userId, firstName, lastName, profilePic 
             FROM posts AS p
             JOIN users AS u ON (u.id = p.userId)
             WHERE p.userId = ? 
             OR p.userId IN (SELECT followedId 
             FROM relationships WHERE followerId = ?)
             ORDER BY p.createdAt DESC`;
  // DESC = most recent posts displayed first
  //? `p.userId IN (...)` checks whether the user who created a post (p.userId) is in a list of specific IDs (result from subquery)

  //! FIX: ⚠️ Clean ALL multi-line queries to remove unwanted newlines, tabs, and spaces, in order to resolve the "SQL syntax error" caused by the use of template literals (often used when the query is long and complex)
  //! SQL recommendations to better use single/double quotes
  const cleanedProfileQuery = profileQuery.replace(/\s+/g, " ").trim();
  const cleanedFeedQuery = feedQuery.replace(/\s+/g, " ").trim();

  const selectQuery = isFetchingProfilePosts
    ? cleanedProfileQuery
    : cleanedFeedQuery;

  // Use the correct values array based on the query type
  // FIX: Ensures 'values' never contains 'undefined', which caused previous 500 error messages
  const values = isFetchingProfilePosts
    ? [targetUserId]
    : [loggedInUserId, loggedInUserId];

  // 2 - EXECUTE THE QUERY
  try {
    const data = await executeQuery(selectQuery, values);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      message: "An unknown error occurred while fetching posts.",
      error: error.message,
    });
  }
};

export const addPost = async (req, res) => {
  const { text, img } = req.body;
  const loggedInUserId = req.user.id;
  const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

  // Validate description
  if (text?.trim()?.length === 0)
    return res.status(400).json("Description cannot be empty.");

  if (text?.trim()?.length > 1000) {
    return res
      .status(400)
      .json("Description cannot exceed 1000\u00A0characters.");
  }

  // Validate image
  if (img && !isImage(img))
    return res.status(400).json("Provide a valid image format.");

  // Create a new post
  const q =
    "INSERT INTO posts (`text`, `img`, `userId`, `createdAt`) VALUES (?, ?, ?, ?)";
  const values = [text.trim(), img, loggedInUserId, currentDateTime];

  try {
    await executeQuery(q, values);
    return res.status(201).json("Post created");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while creating post.",
      error: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  const { text, img } = req.body;
  const postId = req.params.postId;
  const loggedInUserId = req.user.id;

  const updatedFields = [];
  const values = [];

  // Validate description
  if (text?.trim()?.length === 0)
    return res.status(400).json("No description to update");

  if (text?.trim()?.length > 1000) {
    return res
      .status(400)
      .json("Description cannot exceed 1000\u00A0characters.");
  } else {
    updatedFields.push("`text` = ?");
    values.push(text.trim());
  }

  // Validate image (optional)
  if (img && !isImage(img)) {
    return res.status(400).json("Provide a valid image format.");
  } else if (img) {
    // If "img" is provided, it means we are either replacing the image or setting one for the first time

    // Retrieve old image name
    const oldPostData = await executeQuery(
      "SELECT img FROM posts WHERE id = ? AND userId = ?",
      [postId, loggedInUserId]
    );

    // Check if an old image exists and is being replaced by a different one
    if (
      oldPostData.length > 0 &&
      oldPostData[0].img &&
      oldPostData[0].img !== img
    ) {
      try {
        // Delete old image from server in "uploads" folder
        fs.unlinkSync(path.join(UPLOADS_PATH, oldPostData[0].img));
        console.log("Old post image deleted");
      } catch (err) {
        console.error("Error deleting old post image:", err);
      }
    }

    // Update the database reference to the new image file
    updatedFields.push("`img` = ?");
    values.push(img);
  }

  // No field to update
  if (updatedFields.length === 0)
    return res.status(400).json("No field to update");

  const q = `UPDATE posts SET ${updatedFields.join(
    ", "
  )} WHERE id = ? AND userId = ?`;
  values.push(postId, loggedInUserId);

  try {
    const data = await executeQuery(q, values);
    if (data.affectedRows > 0) return res.status(200).json("Post updated");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while updating post.",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  const postId = req.params.postId;
  const loggedInUserId = req.user.id;

  try {
    // Retrieve post image name before deleting post
    const postData = await executeQuery(
      "SELECT img FROM posts WHERE id = ? AND userId = ?",
      [postId, loggedInUserId]
    );

    // Check if a post image exists
    if (postData.length > 0 && postData[0].img) {
      try {
        // Delete post image from server in "uploads" folder
        fs.unlinkSync(path.join(UPLOADS_PATH, postData[0].img));
        console.log("Post image deleted.");
      } catch (err) {
        console.error("Error deleting post image:", err);
      }
    }

    // Delete post from database
    const q = "DELETE FROM posts WHERE id = ? AND userId = ?";
    const data = await executeQuery(q, [postId, loggedInUserId]);

    if (data.affectedRows > 0) {
      return res.status(200).json("Post deleted");
    } else {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting post.",
      error: error.message,
    });
  }
};
