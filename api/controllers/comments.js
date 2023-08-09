import { db } from "../utils/connect.js";

export const getComments = (req, res) => {
  const postId = req.query.postId;

  const q = `SELECT c.*, u.id AS userId, firstName, lastName, profilePic FROM comments AS c JOIN users AS u ON (u.id = c.userId)
    WHERE c.postId = ? ORDER BY c.creationDate DESC
    `;

  // db.query(q, [req.query.postId], (error, data) => {
  db.query(q, [postId], (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const q =
    "INSERT INTO comments(`desc`, `creationDate`, `userId`, `postId`) VALUES (?)";
  const values = [
    req.body.desc,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    req.userInfo.id,
    req.body.postId,
  ];

  db.query(q, [values], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("New comment created.");
  });
};

export const updateComment = (req, res) => {
  const commentId = req.params.id;
  const userId = req.userInfo.id;
  const { desc } = req.body;

  if (desc === undefined)
    return res.status(400).json("No valid fields to update.");

  const q = "UPDATE posts SET `desc` = ? WHERE id = ? AND userId = ?";

  const values = [desc, commentId, userId];

  db.query(q, values, (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Comment updated.");
  });
};

export const deleteComment = (req, res) => {
  const commentId = req.params.id;
  const q = "DELETE FROM comments WHERE `id` = ? AND `userId` = ?";

  db.query(q, [commentId, req.userInfo.id], (error, data) => {
    if (error) return res.status(500).json(error);
    if (data.affectedRows > 0) return res.json("Comment deleted.");
    return res.status(403).json("Only owner can delete their comment.");
  });
};
