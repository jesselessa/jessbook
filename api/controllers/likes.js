import { db } from "../utils/connect.js";
import jwt from "jsonwebtoken";

export const getLikes = (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId = ?";

  db.query(q, [req.query.postId], (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data.map((like) => like.userId));
  });
};

export const addLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in.");

  jwt.verify(token, process.env.REACT_APP_SECRET, (error, userInfo) => {
    if (error) return res.status(403).json("Invalid token.");

    const q = "INSERT INTO likes (`userId`,`postId`) VALUES (?)";
    const values = [userInfo.id, req.body.postId];

    db.query(q, [values], (error, _data) => {
      if (error) return res.status(500).json(error);
      return res.status(200).json("Post liked.");
    });
  });
};

export const deleteLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in.");

  jwt.verify(token, process.env.REACT_APP_SECRET, (error, userInfo) => {
    if (error) return res.status(403).json("Invalid token.");

    const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";

    db.query(q, [userInfo.id, req.query.postId], (error, _data) => {
      if (error) return res.status(500).json(error);
      return res.status(200).json("Post unliked.");
    });
  });
};
