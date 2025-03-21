import { db, executeQuery } from "../utils/connect.js";
import { isImage, isVideo } from "../utils/isFile.js";
import moment from "moment";

export const getStories = async (req, res) => {
  const userId = req.query.userId;
  const loggedInUserId = req.user.id;

  try {
    // Delete former stories even non expired before getting new ones //! In large-scale projects, better use a cron job to reduce loading time of SQL query
    const deleteQuery = "DELETE FROM stories WHERE expiresAt <= NOW()";
    await executeQuery(deleteQuery);

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

    const data = await executeQuery(selectQuery, values);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching stories.",
      error: error.message,
    });
  }
};

export const addStory = async (req, res) => {
  const { file, text } = req.body;
  const loggedInUserId = req.user.id;

  // Check if a file (image or video) is provided
  if (!file || file?.trim()?.length === 0) {
    return res
      .status(400)
      .json("You must provide either an image or a video file.");
  }

  // Validate file format
  if (file && !isImage(file) && !isVideo(file)) {
    return res
      .status(400)
      .json("You must provide a valid image or video format.");
  }

  // Validate description
  if (text?.trim()?.length > 45) {
    return res
      .status(400)
      .json("Description can't contain more than 45\u00A0characters.");
  }

  try {
    // Delete current story if non expired before creating new one
    const deleteQuery = `
          DELETE FROM stories WHERE userId = ? AND expiresAt > NOW()
        `;
    await executeQuery(deleteQuery, [loggedInUserId]);

    // Create a new story
    const currentDateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const expirationDate = moment(Date.now())
      .add(24, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    const insertQuery =
      "INSERT INTO stories(`file`, `text`, `userId`,`createdAt`, `expiresAt`) VALUES (?, ?, ?, ?, ?)";

    const values = [
      file,
      text?.trim(),
      loggedInUserId,
      currentDateTime,
      expirationDate,
    ];

    await executeQuery(insertQuery, values);
    return res.status(201).json("New story created");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while creating new story.",
      error: error.message,
    });
  }
};

export const deleteStory = async (req, res) => {
  const storyId = req.params.storyId;
  const loggedInUserId = req.user.id;

  const q = "DELETE FROM stories WHERE id = ? AND userId = ?";

  try {
    const data = await executeQuery(q, [storyId, loggedInUserId]);
    if (data.affectedRows > 0) {
      return res.status(200).json("Story deleted");
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting story.",
      error: error.message,
    });
  }
};
