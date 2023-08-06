import { db } from "../utils/connect.js";
import jwt from "jsonwebtoken";

export const getAllUsers = (_req, res) => {
  const q = "SELECT * FROM users";

  db.query(q, (error, data) => {
    if (error) return res.status(500).json(error);

    return res.status(200).json(data);
  });
};

export const getUser = (req, res) => {
  const userId = req.params.id;

  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [userId], (error, data) => {
    if (error) return res.status(500).json(error);
    // const { password, ...others } = data[0];
    // return res.json(others);
    return res.json(data[0]);
  });
};

export const updateUser = (req, res) => {
  //TODO - Check query if update of only a piece of info
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in.");

  jwt.verify(token, process.env.REACT_APP_SECRET, (error, userInfo) => {
    if (error) return res.status(403).json("Invalid token.");

    const q =
      "UPDATE users SET `firstName`= ?,`lastName`= ?, `profilePic`= ?,`coverPic`= ?, `country` = ? WHERE id = ? ";

    db.query(
      q,
      [
        req.body.firstName,
        req.body.lastName,
        req.body.profilePic,
        req.body.coverPic,
        req.body.country,
        userInfo.id,
      ],

      (error, data) => {
        if (error) res.status(500).json(error);
        if (data.affectedRows > 0)
          return res.json("User's information updated.");
        return res
          .status(403)
          .json("User can only can only update his own information.");
      }
    );
  });
};
