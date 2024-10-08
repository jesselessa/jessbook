import { db } from "../utils/connect.js";
import moment from "moment";

export const getStories = (req, res) => {
  const userId = req.query.userId;
  const loggedInUserId = req.userInfo.id;

  // Delete expired stories before getting new ones //! In large-scale projects, better use a cron job to reduce loading time of SQL query
  const deleteQuery = "DELETE FROM stories WHERE expiresAt <= NOW()";

  db.query(deleteQuery, (error, _data) => {
    if (error) return res.json(error);
  });

  // Get user story + followed users stories
  const selectQuery =
    userId !== "undefined"
      ? `SELECT s.*, u.id AS userId, firstName, lastName
    FROM stories AS s 
    JOIN users AS u ON (u.id = s.userId) 
    WHERE s.userId = ? 
    ORDER BY s.createdAt DESC`
      : `
    SELECT s.*, u.id as userId, firstName, lastName
    FROM stories AS s
    JOIN users AS u ON (u.id = s.userId)
    WHERE s.userId = ? 
    OR s.userId IN (SELECT followedId 
    FROM relationships WHERE followerId = ?)
    AND s.expiresAt > NOW()
    ORDER BY
          CASE WHEN s.userId = ? THEN 0 ELSE 1 END,
          s.createdAt DESC`;
  // Logged-in user story displayed first, then most recent stories

  const values =
    userId !== "undefined"
      ? [userId]
      : [loggedInUserId, loggedInUserId, loggedInUserId];

  db.query(selectQuery, values, (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  });
};

export const addStory = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  // 1 - Check video duration doesn't exceed 60 seconds
  if (req.body.videoDuration > 60)
    return res.status(400).json("Video duration can't exceed 60 seconds.");

  // 2 - Delete previous story if non expired
  const deleteQuery = `
  DELETE FROM stories WHERE userId = ? AND expiresAt > NOW()
`;

  db.query(deleteQuery, [loggedInUserId], (deleteErr) => {
    if (deleteErr) return res.status(500).json(error);

    // 3 - Create a new story
    const currentDateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const expirationDate = moment(Date.now())
      .add(24, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    const insertQuery =
      "INSERT INTO stories(`img`, `desc`, `userId`,`createdAt`, `expiresAt`) VALUES (?)";

    const values = [
      req.body.img,
      req.body.desc,
      loggedInUserId,
      currentDateTime,
      expirationDate,
    ];

    db.query(insertQuery, [values], (insertErr) => {
      if (insertErr) return res.status(500).json(error);
      return res.status(200).json("New story created.");
    });
  });
};

export const deleteStory = (req, res) => {
  const storyId = req.params.storyId;
  const loggedInUserId = req.userInfo.id;

  const q = "DELETE FROM stories WHERE id = ? AND userId = ?";

  db.query(q, [storyId, loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.affectedRows > 0) return res.status(200).json("Story deleted.");

    return res.status(403).json("Only user can delete their own story.");
  });
};
