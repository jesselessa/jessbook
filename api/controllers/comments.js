import { db } from "../utils/connect.js";
import moment from "moment";

export const getComments = (req, res) => {
  const postId = req.query.postId;

  const q = `SELECT c.*, u.id AS userId, firstName, lastName, profilePic 
  FROM comments AS c 
  JOIN users AS u ON (u.id = c.userId)
  WHERE c.postId = ? 
  ORDER BY c.createdAt DESC`;

  db.query(q, [postId], (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error fetching comments", error: error });

    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const { desc, postId } = req.body;
  const loggedInUserId = req.user.id;
  const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

  if (desc?.trim()?.length === 0) {
    return res.status(400).json({ message: "Description cannot be empty." });
  }

  if (desc?.trim()?.length > 500)
    return res
      .status(400)
      .json("Description cannot exceed 500\u00A0characters.");

  const q =
    "INSERT INTO comments (`desc`, `userId`, `postId`, `createdAt`) VALUES (?)";
  const values = [desc.trim(), loggedInUserId, postId, currentDateTime];

  db.query(q, [values], (error, _data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error creating comment", error: error });

    return res.status(200).json({ message: "Comment created" });
  });
};

export const updateComment = (req, res) => {
  const commentId = req.params.commentId;
  const loggedInUserId = req.user.id;
  const { desc } = req.body;

  if (desc?.trim()?.length === 0)
    return res.status(400).json({ message: "No description to update" });

  if (desc?.trim()?.length > 500) {
    return res
      .status(400)
      .json({ message: "Description cannot exceed 500\u00A0characters." });
  }

  const q = "UPDATE comments SET `desc` = ? WHERE id = ? AND userId = ?";

  db.query(q, [desc, commentId, loggedInUserId], (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error updating comment.", error: error });

    if (data.affectedRows > 0) return res.status(200).json("Comment updated.");
  });
};

export const deleteComment = (req, res) => {
  const commentId = req.params.commentId;
  const loggedInUserId = req.user.id;

  const q = "DELETE FROM comments WHERE id = ? AND userId = ?";

  db.query(q, [commentId, loggedInUserId], (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error deleting comment.", error: error });

    if (data.affectedRows > 0) return res.status(200).json("Comment deleted.");
  });
};
