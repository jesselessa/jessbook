import { db } from "../utils/connect.js";
import moment from "moment";

export const getPosts = (req, res) => {
  const userId = req.query.userId;
  const loggedInUserId = req.userInfo.id;

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
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  });
};

export const addPost = (req, res) => {
  const loggedInUserId = req.userInfo.id;
  const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

  const q =
    "INSERT INTO posts (`desc`, `img`, `userId`, `createdAt`) VALUES (?)";
  const values = [req.body.desc, req.body.img, loggedInUserId, currentDateTime];

  db.query(q, [values], (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("New post created.");
  });
};

export const updatePost = (req, res) => {
  const postId = req.params.postId;
  const loggedInUserId = req.userInfo.id;
  const { desc, img } = req.body;

  if (!desc && !img) return res.status(400).json("No field to update.");

  const updatedFields = [];
  const values = [];

  if (desc) {
    updatedFields.push("`desc` = ?");
    values.push(desc);
  }

  if (img) {
    updatedFields.push("`img` = ?");
    values.push(img);
  }

  values.push(postId, loggedInUserId);

  const q = `UPDATE posts SET ${updatedFields.join(
    ", "
  )} WHERE id = ? AND userId = ?`;

  db.query(q, values, (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.affectedRows > 0) return res.status(200).json("Post updated.");

    return res.status(403).json("Only user can update their own post.");
  });
};

export const deletePost = (req, res) => {
  const postId = req.params.postId;
  const loggedInUserId = req.userInfo.id;

  const q = "DELETE FROM posts WHERE id = ? AND userId = ?";

  db.query(q, [postId, loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.affectedRows > 0) return res.status(200).json("Post deleted.");

    return res.status(403).json("Only user can delete their own post.");
  });
};
