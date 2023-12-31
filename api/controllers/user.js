import { db } from "../utils/connect.js";
// import bcrypt from "bcryptjs";

export const getUser = (req, res) => {
  const userId = req.params.userId;

  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [userId], (error, data) => {
    if (error) return res.status(500).json(error);

    // All user info except password
    const { password, ...others } = data[0];

    return res.status(200).json(others);
  });
};

export const updateUser = (req, res) => {
  const loggedInUserId = req.userInfo.id; // User ID from token

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

  // if (req.body.email !== undefined) {
  //   updateFields.push("`email` = ?");
  //   values.push(req.body.email);
  // }

  // if (req.body.password !== undefined) {
  //   // Hash the password before updating
  //   const salt = bcrypt.genSaltSync(10);
  //   const hashedPassword = bcrypt.hashSync(req.body.password, salt);

  //   updateFields.push("`password` = ?");
  //   values.push(hashedPassword);
  // }

  if (req.body.profilePic !== undefined) {
    updateFields.push("`profilePic` = ?");
    values.push(req.body.profilePic);
  }

  if (req.body.coverPic !== undefined) {
    updateFields.push("`coverPic` = ?");
    values.push(req.body.coverPic);
  }

  if (req.body.city !== undefined) {
    updateFields.push("`city` = ?");
    values.push(req.body.city);
  }

  if (updateFields.length === 0) {
    return res.status(400).json("No valid fields to update.");
  }

  values.push(loggedInUserId);

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

    return res.status(403).json("User can only update their own information.");
  });
};
