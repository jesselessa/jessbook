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
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const loggedInUserId = req.userInfo.id;
  const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

  const q =
    "INSERT INTO comments (`desc`, `userId`, `postId`, `createdAt`) VALUES (?)";

  const values = [
    req.body.desc,
    loggedInUserId,
    req.body.postId,
    currentDateTime,
  ];

  db.query(q, [values], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("New comment created.");
  });
};

export const updateComment = (req, res) => {
  const commentId = req.params.commentId;
  const loggedInUserId = req.userInfo.id;
  const { desc } = req.body;

  if (!desc) return res.status(400).json("No field to update.");

  const q = "UPDATE comments SET `desc` = ? WHERE id = ? AND userId = ?";

  db.query(q, [desc, commentId, loggedInUserId], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Comment updated.");
  });
};

export const deleteComment = (req, res) => {
  const commentId = req.params.commentId;
  const loggedInUserId = req.userInfo.id;

  const q = "DELETE FROM comments WHERE id = ? AND userId = ?";

  db.query(q, [commentId, loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.affectedRows > 0) return res.status(200).json("Comment deleted.");

    return res.status(403).json("Only user can delete their own comment.");
  });
};
