import { db, executeQuery } from "../db/connect.js";
import moment from "moment";

export const getComments = async (req, res) => {
  const postId = req.query.postId;

  const q = `SELECT c.*, u.id AS userId, firstName, lastName, profilePic 
                 FROM comments AS c 
                 JOIN users AS u ON (u.id = c.userId)
                 WHERE c.postId = ? 
                 ORDER BY c.createdAt DESC`;

  try {
    const data = await executeQuery(q, [postId]);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching post comments.",
      error: error.message,
    });
  }
};

export const addComment = async (req, res) => {
  const { text, postId } = req.body;
  const loggedInUserId = req.user.id;
  const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

  if (text?.trim()?.length === 0)
    return res.status(400).json({ message: "Description cannot be empty." });

  if (text?.trim()?.length > 500) {
    return res
      .status(400)
      .json("Description cannot exceed 500\u00A0characters.");
  }

  const q =
    "INSERT INTO comments (`text`, `userId`, `postId`, `createdAt`) VALUES (?, ?, ?, ?)";
  const values = [text.trim(), loggedInUserId, postId, currentDateTime];

  try {
    await executeQuery(q, values);

    return res.status(201).json({ message: "Comment created" });
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while creating comment.",
      error: error.message,
    });
  }
};

export const updateComment = async (req, res) => {
  const commentId = req.params.commentId;
  const loggedInUserId = req.user.id;
  const { text } = req.body;

  if (text?.trim()?.length === 0)
    return res.status(400).json({ message: "No description to update" });

  if (text?.trim()?.length > 500) {
    return res
      .status(400)
      .json({ message: "Description cannot exceed 500\u00A0characters." });
  }

  const q = "UPDATE comments SET `text` = ? WHERE id = ? AND userId = ?";

  try {
    const data = await executeQuery(q, [text, commentId, loggedInUserId]);
    if (data.affectedRows > 0) return res.status(200).json("Comment updated");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while updating comment.",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const loggedInUserId = req.user.id;

  const q = "DELETE FROM comments WHERE id = ? AND userId = ?";

  try {
    const data = await executeQuery(q, [commentId, loggedInUserId]);
    if (data.affectedRows > 0) return res.status(200).json("Comment deleted");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting comment.",
      error: error.message,
    });
  }
};
