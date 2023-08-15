import { db } from "../utils/connect.js";

export const getLikes = (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId = ?";

  db.query(q, [req.query.postId], (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data.map((like) => like.userId));
  });
};

export const addLike = (req, res) => {
  const q = "INSERT INTO likes (`userId`,`postId`) VALUES (?)";
  const values = [req.userInfo.id, req.body.postId];

  db.query(q, [values], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Post liked.");
  });
};

export const deleteLike = (req, res) => {
  const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";

  db.query(q, [req.userInfo.id, req.query.postId], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Post unliked.");
  });
};
