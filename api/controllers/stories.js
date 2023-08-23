import { db } from "../utils/connect.js";
import moment from "moment";

export const getStories = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q = `SELECT s.*, name FROM stories AS s JOIN users AS u ON (u.id = s.userId)
    LEFT JOIN relationships AS r ON (s.userId = r.followedUserId AND r.followerUserId= ?) LIMIT 5`;

  // All info except password
  // const user = {
  //     id: data[0]?.id,
  //     firstName: data[0]?.firstName,
  //     lastName: data[0]?.lastName,
  //     email: data[0]?.email,
  //     profilePic: data[0]?.profilePic,
  //     coverPic: data[0]?.coverPic,
  //     country: data[0]?.country,
  //   };

  db.query(q, [loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
    // return res.status(200).json(user);
  });
};

export const addStory = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q = "INSERT INTO stories(`img`, `creationDate`, `userId`) VALUES (?)";
  const values = [
    req.body.img,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    loggedInUserId,
  ];

  db.query(q, [values], (err, _data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("New story created.");
  });
};

export const deleteStory = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q = "DELETE FROM stories WHERE `id`=? AND `userId` = ?";

  db.query(q, [req.params.id, loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);
    if (data.affectedRows > 0) return res.status(200).json("Story deleted.");
    return res.status(403).json("User can only delete their own post.");
  });
};
