import { db } from "../utils/connect.js";

//! Note : In MySQL, when no results are found with a SELECT query, the 'data' variable will contain an empty array ([]), which is always considered a truthy value. Therefore, to check if data really exists, we use 'if(data.length)' and not 'if(data)', the latter always returning 'true'.

export const getUser = (req, res) => {
  const userId = req.params.userId;

  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [userId], (error, data) => {
    if (error) return res.status(500).json("An unknown error has occured.");

    // All user info except password
    const { password, ...others } = data[0]; // Result = 1st line of array
    if (data.length > 0) return res.status(200).json(others);
  });
};

export const updateUser = (req, res) => {
  const loggedInUserId = req.userInfo.id; // User ID from token

  const updatedFields = [];

  // Define values for SQL parameters
  const values = [];

  if (req.body.firstName !== undefined) {
    updatedFields.push("`firstName` = ?");
    values.push(req.body.firstName);
  }

  if (req.body.lastName !== undefined) {
    updatedFields.push("`lastName` = ?");
    values.push(req.body.lastName);
  }

  if (req.body.email !== undefined) {
    updatedFields.push("`email` = ?");
    values.push(req.body.email);
  }

  if (req.body.password !== undefined) {
    // Hash the password before updating
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    updatedFields.push("`password` = ?");
    values.push(hashedPassword);
  }

  if (req.body.profilePic !== undefined) {
    updatedFields.push("`profilePic` = ?");
    values.push(req.body.profilePic);
  }

  if (req.body.coverPic !== undefined) {
    updatedFields.push("`coverPic` = ?");
    values.push(req.body.coverPic);
  }

  if (req.body.city !== undefined) {
    updatedFields.push("`city` = ?");
    values.push(req.body.city);
  }

  if (updatedFields.length === 0) {
    return res.status(400).json("No field updated.");
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
      return res.status(200).json("User's data updated.");

    return res.status(403).json("User can only update their own data.");
  });
};

export const deleteUser = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q = "DELETE FROM users WHERE `id`= ?";

  db.query(q, [loggedInUserId], (error, data) => {
    if (error) return res.status(500).json(error);
    
    if (data.affectedRows > 0) return res.status(200).json("User deleted.");

    return res.status(403).json("User can only delete their own data.");
  });
};
