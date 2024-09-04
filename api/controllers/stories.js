import { db } from "../utils/connect.js";
import moment from "moment";

export const getStories = (req, res) => {
  const userId = req.query.userId;
  const loggedInUserId = req.userInfo.id;

  const q =
    userId !== "undefined"
      ? `SELECT s.*, u.id AS userId, u.firstName, u.lastName
      FROM stories AS s 
      JOIN users AS u ON (u.id = s.userId) 
      WHERE s.userId = ? 
      ORDER BY s.createdAt DESC`
      : `

      SELECT s.*, u.id as userId, u.firstName, u.lastName
      FROM stories AS s
      JOIN users AS u ON (u.id = s.userId)
      WHERE s.userId = ? OR s.userId IN (SELECT followedUserId 
      FROM relationships WHERE followerUserId = ?)
      AND s.expiresAt > NOW()
      ORDER BY
            CASE WHEN s.userId = ? THEN 0 ELSE 1 END,
            s.createdAt DESC;`;

  const values =
    userId !== "undefined"
      ? [userId]
      : [loggedInUserId, loggedInUserId, loggedInUserId];

  db.query(q, values, (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  });
};

export const addStory = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  // Check video length doesn't exceede 60 secondes
  if (req.body.videoDuration > 60) {
    return res.status(400).json("Video duration exceeds the 60-second limit.");
  }

  const currentDateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  const expirationDate = moment(Date.now())
    .add(24, "hours")
    .format("YYYY-MM-DD HH:mm:ss");

  const q =
    "INSERT INTO stories(`img`, `desc`, `userId`,`createdAt`, `expiresAt`) VALUES (?)";

  const values = [
    req.body.img,
    req.body.desc,
    loggedInUserId,
    currentDateTime,
    expirationDate,
  ];

  db.query(q, [values], (err, _data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("New story created.");
  });
};

export const deleteStory = (req, res) => {
  const loggedInUserId = req.userInfo.id;
  const storyId = req.params.storyId;

  const q = "DELETE FROM stories WHERE `id`= ? AND `userId` = ?";

  db.query(q, [storyId, loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);
    if (data.affectedRows > 0) return res.status(200).json("Story deleted.");
    return res.status(403).json("User can only delete their own story.");
  });
};
