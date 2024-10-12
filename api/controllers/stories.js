import { db } from "../utils/connect.js";
import { isImage, isVideo } from "../utils/isFile.js";
import moment from "moment";

export const getStories = (req, res) => {
  const userId = req.query.userId;
  const loggedInUserId = req.userInfo.id;

  // Delete former stories even non expired before getting new ones //! In large-scale projects, better use a cron job to reduce loading time of SQL query
  const deleteQuery = "DELETE FROM stories WHERE expiresAt <= NOW()";

  db.query(deleteQuery, (deleteErr, _data) => {
    if (deleteErr)
      return res.json({
        message: "Error deleting former stories.",
        error: deleteErr,
      });
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

  db.query(selectQuery, values, (selectErr, data) => {
    if (selectErr)
      return res
        .status(500)
        .json({ message: "Error fetching stories.", error: selectErr });

    return res.status(200).json(data);
  });
};

export const addStory = (req, res) => {
  const { file, desc } = req.body;
  const loggedInUserId = req.userInfo.id;

  // 1 - Check if a file (image or video) is provided
  if (!file)
    return res.status(400).json("You must provide either an image or a video.");

  // 2 - Check file format
  if (file) {
    // Image
    if (!isImage(file)) {
      return res.status(400).json("Provide a valid image format.");
    }
    // Video
    else if (!isVideo(file)) {
      return res.status(400).json("Provide a valid video format.");
    } else {
      return res.status(400).json("Invalid request.");
    }
  }

  // 3 - Validate description (optional&)
  if (desc?.trim()?.length > 45) {
    return res
      .status(400)
      .json("Description can't contain more than 45\u00A0characters.");
  }

  // 4 - Delete current story if non expired before creating new one
  const deleteQuery = `
  DELETE FROM stories WHERE userId = ? AND expiresAt > NOW()
`;

  db.query(deleteQuery, [loggedInUserId], (deleteErr) => {
    if (deleteErr)
      return res
        .status(500)
        .json({ message: "Error deleting current story.", error: deleteErr });

    // 5 - Create a new story
    const currentDateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const expirationDate = moment(Date.now())
      .add(24, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    const insertQuery =
      "INSERT INTO stories(`file`, `desc`, `userId`,`createdAt`, `expiresAt`) VALUES (?)";

    const values = [
      file,
      desc?.trim(),
      loggedInUserId,
      currentDateTime,
      expirationDate,
    ];

    db.query(insertQuery, [values], (insertErr, _data) => {
      if (insertErr)
        return res
          .status(500)
          .json({ message: "Error creating new story.", error: insertErr });

      return res.status(200).json("New story created.");
    });
  });
};

export const deleteStory = (req, res) => {
  const storyId = req.params.storyId;
  const loggedInUserId = req.userInfo.id;

  const q = "DELETE FROM stories WHERE id = ? AND userId = ?";

  db.query(q, [storyId, loggedInUserId], (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error deleting story.", error: error });

    if (data.affectedRows > 0) return res.status(200).json("Story deleted.");
  });
};
