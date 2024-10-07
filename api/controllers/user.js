import { db } from "../utils/connect.js";
import bcrypt from "bcryptjs";

//! In MySQL, when no results are found with a SELECT query, the 'data' variable will contain an empty array '[]', which is considered a truthy value. Therefore, to check if data really exists, we use 'if(data.length > 0)' and not 'if(data)', the latter always returning 'true'

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [userId], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.length === 0) return res.status(404).json("User not found.");

    // If user exists, return all info except password
    const { password, ...others } = data[0]; //! 'data[0]' represents the query result = an array with one entry
    return res.status(200).json(others);
  });
};

export const updateUser = (req, res) => {
  const loggedInUserId = req.userInfo.id; // User ID from token
  const updatedFields = [];
  const values = []; // Values for SQL parameters

  if (req.body.firstName) {
    updatedFields.push("`firstName` = ?");
    values.push(req.body.firstName);
  }

  if (req.body.lastName) {
    updatedFields.push("`lastName` = ?");
    values.push(req.body.lastName);
  }

  if (req.body.email) {
    updatedFields.push("`email` = ?");
    values.push(req.body.email);
  }

  if (req.body.password) {
    // Hash password before updating it
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    updatedFields.push("`password` = ?");
    values.push(hashedPassword);
  }

  if (req.body.profilePic) {
    updatedFields.push("`profilePic` = ?");
    values.push(req.body.profilePic);
  }

  if (req.body.coverPic) {
    updatedFields.push("`coverPic` = ?");
    values.push(req.body.coverPic);
  }

  if (req.body.city) {
    updatedFields.push("`city` = ?");
    values.push(req.body.city);
  }

  if (updatedFields.length === 0) {
    return res.status(400).json("No field to update.");
  }

  values.push(loggedInUserId);

  const q = `
      UPDATE users
      SET ${updatedFields.join(", ")}
      WHERE id = ?
    `;

  db.query(q, values, (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.affectedRows > 0)
      return res.status(200).json("User data updated.");

    return res.status(403).json("User can only update their own data.");
  });
};

export const deleteUser = (req, res) => {
  const loggedInUserId = req.userInfo.id;
  const q = "DELETE FROM users WHERE `id` = ?";

  db.query(q, [loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.affectedRows > 0) return res.status(200).json("User deleted.");

    return res.status(403).json("Only user can delete their own account.");
  });
};
