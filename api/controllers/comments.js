import { db } from "../utils/connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getComments = (req, res) => {
  const q = `SELECT c.*, u.id AS userId, firstName, lastName, profilePic FROM comments AS c JOIN users AS u ON (u.id = c.userId)
    WHERE c.postId = ? ORDER BY c.creationDate DESC
    `;

  db.query(q, [req.query.postId], (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in.");

  jwt.verify(token, process.env.REACT_APP_SECRET, (error, userInfo) => {
    if (error) return res.status(403).json("Invalid token.");

    const q =
      "INSERT INTO comments(`desc`, `creationDate`, `userId`, `postId`) VALUES (?)";
    const values = [
      req.body.desc,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.postId,
    ];

    db.query(q, [values], (error, _data) => {
      if (error) return res.status(500).json(error);
      return res.status(200).json("New comment created.");
    });
  });
};

export const updateComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in.");

  jwt.verify(token, process.env.REACT_APP_SECRET, (error, userInfo) => {
    if (error) return res.status(403).json("Invalid token.");

    const commentId = req.params.id; // Comment ID to update
    const userId = userInfo.id; // User ID from token

    if (req.body.desc === undefined) {
      return res.status(400).json("No valid fields to update.");
    }

    const updateFields = [];
    const values = [];
    if (desc !== undefined) {
      updateFields.push("`desc` = ?");
      values.push(desc);
    }
    const updateFieldsString = updateFields.join(", ");

    const q = `
        UPDATE posts 
        SET ${updateFieldsString} 
        WHERE id = ? AND userId = ?
      `;

    values.push(commentId, userId);

    db.query(q, values, (error, _data) => {
      if (error) return res.status(500).json(error);
      return res.status(200).json("Comment updated.");
    });
  });
};

export const deleteComment = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("User not logged in.");

  jwt.verify(token, process.env.REACT_APP_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const commentId = req.params.id;
    const q = "DELETE FROM comments WHERE `id` = ? AND `userId` = ?";

    db.query(q, [commentId, userInfo.id], (error, data) => {
      if (error) return res.status(500).json(error);
      if (data.affectedRows > 0) return res.json("Comment deleted.");
      return res.status(403).json("Only owner can delete his comment.");
    });
  });
};
