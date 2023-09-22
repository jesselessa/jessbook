import { db } from "../utils/connect.js";
import moment from "moment";

export const getPosts = (req, res) => {
  const userId = req.query.userId;
  const loggedInUserId = req.userInfo.id;

  const q =
    userId !== "undefined"
      ? `SELECT p.*, u.id AS userId, firstName, lastName, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.creationDate DESC`
      // Using a subquery instead of LEFT JOIN prevents from getting connected user's posts with the same ID rendered multiple times - Still don't know why
      : `SELECT p.*, u.id AS userId, firstName, lastName, profilePic FROM posts AS p
      JOIN users AS u ON (u.id = p.userId)
      WHERE p.userId = ? OR p.userId IN (SELECT followedUserId FROM relationships WHERE followerUserId = ?)
      ORDER BY p.creationDate DESC`;
  //     `SELECT p.*, u.id AS userId, firstName, lastName, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
  // LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId = ? OR p.userId = ?
  // ORDER BY p.creationDate DESC`;
  // DESC = most recent posts shown first

   

  const values =
    userId !== "undefined" ? [userId] : [loggedInUserId, loggedInUserId];

  db.query(q, values, (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  });
};

export const addPost = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q =
    "INSERT INTO posts(`desc`, `img`, `creationDate`, `userId`) VALUES (?)";

  const values = [
    req.body.desc,
    req.body.img,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    // To tranform date in MySQL format
    loggedInUserId,
  ];

  db.query(q, [values], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("New post created.");
  });
};

export const updatePost = (req, res) => {
  const postId = req.params.postId;
  const loggedInUserId = req.userInfo.id;

  const { desc, img } = req.body;

  if (desc === undefined && img === undefined) {
    return res.status(400).json("No valid fields to update.");
  }

  const updateFields = [];
  const values = [];

  if (desc !== undefined) {
    updateFields.push("`desc` = ?");
    values.push(desc);
  }

  if (img !== undefined) {
    updateFields.push("`img` = ?");
    values.push(img);
  }

  const updateFieldsString = updateFields.join(", ");

  const q = `
      UPDATE posts
      SET ${updateFieldsString}
      WHERE id = ? AND userId = ?
    `;

  values.push(postId, loggedInUserId);

  db.query(q, values, (error, data) => {
    if (error) return res.status(500).json(error);
    if (data.affectedRows > 0) {
      return res.status(200).json("Post updated.");
    }
    return res.status(403).json("User can only update their post.");
  });
};

export const deletePost = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q = "DELETE FROM posts WHERE `id`= ? AND `userId` = ?";

  db.query(q, [req.params.postId, loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);
    if (data.affectedRows > 0) return res.status(200).json("Post deleted.");
    return res.status(403).json("User can only delete their post.");
  });
};
