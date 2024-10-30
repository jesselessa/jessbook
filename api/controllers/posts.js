import { db } from "../utils/connect.js";
import { isImage } from "../utils/isFile.js";
import moment from "moment";

export const getPosts = (req, res) => {
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

  // Define values for SQL parameters
  const values =
    userId !== "undefined" ? [userId] : [loggedInUserId, loggedInUserId];

  db.query(q, values, (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error fetching posts.", error: error });

    return res.status(200).json(data);
  });
};

export const addPost = (req, res) => {
  const { desc, img } = req.body;
  const loggedInUserId = req.user.id;
  const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

  // Validate description
  if (desc?.trim()?.length === 0)
    return res.status(400).json("Description cannot be empty.");

  if (desc?.trim()?.length > 1000)
    return res
      .status(400)
      .json("Description cannot exceed 1000\u00A0characters.");

  // 2 - Validate image (optional)
  if (img) {
    if (!isImage(img))
      return res.status(400).json("Provide a valid image format.");
  }

  // 3 - Create a new post
  const q =
    "INSERT INTO posts (`desc`, `img`, `userId`, `createdAt`) VALUES (?)";
  const values = [desc.trim(), img, loggedInUserId, currentDateTime];

  db.query(q, [values], (error, _data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error creating post.", error: error });

    return res.status(200).json("Post created.");
  });
};

export const updatePost = (req, res) => {
  const { desc, img } = req.body;
  const postId = req.params.postId;
  const loggedInUserId = req.user.id;

  const updatedFields = [];
  const values = [];

  // 1 - Validate description
  if (desc?.trim()?.length === 0)
    return res.status(400).json("No description to update.");

  if (desc?.trim()?.length > 1000) {
    return res
      .status(400)
      .json("Description cannot exceed 1000\u00A0characters.");
  } else {
    updatedFields.push("`desc` = ?");
    values.push(desc.trim());
  }

  // 2 - Validate image (optional)
  if (img) {
    if (!isImage(img)) {
      return res.status(400).json("Provide a valid image format.");
    } else {
      updatedFields.push("`img` = ?");
      values.push(img);
    }
  }

  // 3 - No field to update
  if (updatedFields.length === 0)
    return res.status(400).json("No field to update.");

  const q = `UPDATE posts SET ${updatedFields.join(
    ", "
  )} WHERE id = ? AND userId = ?`;

  values.push(postId, loggedInUserId);

  db.query(q, values, (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error updating post.", error: error });

    if (data.affectedRows > 0) return res.status(200).json("Post updated.");
  });
};

export const deletePost = (req, res) => {
  const postId = req.params.postId;
  const loggedInUserId = req.user.id;

  const q = "DELETE FROM posts WHERE id = ? AND userId = ?";

  db.query(q, [postId, loggedInUserId], (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error deleting post.", error: error });

    if (data.affectedRows > 0) return res.status(200).json("Post deleted.");
  });
};
