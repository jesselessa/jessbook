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
  const userId = req.params.userId;

  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [userId], (error, data) => {
    if (error) return res.status(500).json(error);

    // TODO - Check later "can't destructure property of undefined 'password' "
    // const { password, ...others } = data[0];
    return res.status(200).json(data[0]);
    // return res.status(200).json(others);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("User not logged in.");

  jwt.verify(token, process.env.REACT_APP_SECRET, (error, userInfo) => {
    if (error) return res.status(403).json("Invalid token.");

    const userId = userInfo.id; // User ID from token

    const updateFields = [];
    const values = [];

    if (req.body.firstName !== undefined) {
      updateFields.push("`firstName` = ?");
      values.push(req.body.firstName);
    }

    if (req.body.lastName !== undefined) {
      updateFields.push("`lastName` = ?");
      values.push(req.body.lastName);
    }

    if (req.body.profilePic !== undefined) {
      updateFields.push("`profilePic` = ?");
      values.push(req.body.profilePic);
    }

    if (req.body.coverPic !== undefined) {
      updateFields.push("`coverPic` = ?");
      values.push(req.body.coverPic);
    }

    if (req.body.country !== undefined) {
      updateFields.push("`country` = ?");
      values.push(req.body.country);
    }

    if (updateFields.length === 0) {
      return res.status(400).json("No valid fields to update.");
    }

    values.push(userId);

    const q = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    db.query(q, values, (error, data) => {
      if (error) return res.status(500).json(error);
      if (data.affectedRows > 0) {
        return res.status(200).json("User's information updated.");
      }
      return res
        .status(403)
        .json("User can only update their own information.");
    });
  });
};
