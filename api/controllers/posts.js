import { db, executeQuery } from "../db/connect.js";
import { isImage } from "../utils/isFile.js";
import moment from "moment";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPosts = async (req, res) => {
  const userId = req.query.userId;
  const loggedInUserId = req.user.id;

  // Get user posts + followed users posts
  const q =
    userId !== "undefined"
      ? `SELECT p.*, u.id AS userId, firstName, lastName, profilePic 
             FROM posts AS p 
             JOIN users AS u ON (u.id = p.userId) 
             WHERE p.userId = ? 
             ORDER BY p.createdAt DESC`
      : `
             SELECT p.*, u.id AS userId, firstName, lastName, profilePic 
             FROM posts AS p
             JOIN users AS u ON (u.id = p.userId)
             WHERE p.userId = ? 
             OR p.userId IN (SELECT followedId 
             FROM relationships WHERE followerId = ?)
             ORDER BY p.createdAt DESC`;
  // DESC = most recent posts displayed first
  //! `p.userId IN (...)` checks whether the user who created a post (p.userId) is in a list of specific IDs (result from subquery)

  const values =
    userId !== "undefined" ? [userId] : [loggedInUserId, loggedInUserId];

  try {
    const data = await executeQuery(q, values);
    return res.status(200).json(data);
  } catch (error) {
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

  if (text?.trim()?.length > 1000)
    return res
      .status(400)
      .json("Description cannot exceed 1000\u00A0characters.");

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
    return res.status(400).json("Description cannot exceed 1000 characters.");
  } else {
    updatedFields.push("`text` = ?");
    values.push(text.trim());
  }

  // Validate image (optional)
  if (img && !isImage(img)) {
    return res.status(400).json("Provide a valid image format.");
  } else if (img) {
    // Retrieve old image name
    const oldPostData = await executeQuery(
      "SELECT img FROM posts WHERE id = ? AND userId = ?",
      [postId, loggedInUserId]
    );

    // Check if an old image exists and is different from the new one
    if (
      oldPostData.length > 0 &&
      oldPostData[0].img &&
      oldPostData[0].img !== img
    ) {
      try {
        // Delete old image from server in "uploads" folder
        fs.unlinkSync(
          path.join(
            __dirname,
            "../../client/public/uploads",
            oldPostData[0].img
          )
        );
        console.log("Old post image deleted");
      } catch (err) {
        console.error("Error deleting old post image:", err);
      }
    }

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
        // Deleting post image from server in "uploads" folder
        fs.unlinkSync(
          path.join(__dirname, "../../client/public/uploads", postData[0].img)
        );
        console.log("Post image deleted.");
      } catch (err) {
        console.error("Error deleting post image:", err);
      }
    }

    // Delete post from database
    const q = "DELETE FROM posts WHERE id = ? AND userId = ?";
    const data = await executeQuery(q, [postId, loggedInUserId]);

    if (data.affectedRows > 0) return res.status(200).json("Post deleted");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting post.",
      error: error.message,
    });
  }
};
