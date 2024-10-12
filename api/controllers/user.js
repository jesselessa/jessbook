import { db } from "../utils/connect.js";
import { isImage } from "../utils/isFile.js";
import bcrypt from "bcryptjs";

//! In MySQL, when no results are found with a SELECT query, the 'data' variable will contain an empty array '[]', which is considered a truthy value. Therefore, to check if data really exists, we use 'if(data.length > 0)' and not 'if(data)', the latter always returning 'true'

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [userId], (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error fetching user data.", error: error });

    if (data.length === 0) return res.status(404).json("User not found.");

    const { password, ...others } = data[0];
    return res.status(200).json(others);
  });
};

export const updateUser = (req, res) => {
  const { firstName, lastName, email, password, profilePic, coverPic, city } =
    req.body;
  const loggedInUserId = req.userInfo.id; // User ID from token
  const updatedFields = [];
  const values = []; // Values for SQL parameters

  // Check validation conditions
  let errors = {};

  if (firstName) {
    if (firstName.trim().length < 2 || firstName.trim().length > 35) {
      errors.firstName = "First name must be between 2 and 35 characters.";
    } else {
      updatedFields.push("`firstName` = ?");
      values.push(firstName.trim());
    }
  }

  if (lastName) {
    if (lastName.trim().length < 1 || lastName.trim().length > 35) {
      errors.lastName = "Last name must be between 1 and 35 characters.";
    } else {
      updatedFields.push("`lastName` = ?");
      values.push(lastName.trim());
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email) {
    if (!emailRegex.test(email.trim()) || email.trim().length > 320) {
      errors.email = "Invalid email format or too long.";
    } else {
      updatedFields.push("`email` = ?");
      values.push(email.trim());
    }
  }

  // d - Password validation and hashing
  const passwordRegex =
    /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;
  if (password) {
    if (!passwordRegex.test(password) || password.trim()?.length > 200) {
      errors.password = "Invalid password format or too long.";
    } else {
      // Hash password before updating it
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      updatedFields.push("`password` = ?");
      values.push(hashedPassword);
    }
  }

  if (profilePic) {
    if (!isImage(profilePic)) {
      errors.profilePic =
        "Invalid profile picture format. Please, upload a valid image.";
    } else {
      updatedFields.push("`profilePic` = ?");
      values.push(profilePic);
    }
  }

  // f - Cover picture (optional)
  if (coverPic) {
    if (!isImage(coverPic)) {
      errors.coverPic =
        "Invalid cover picture format. Please, upload a valid image.";
    } else {
      updatedFields.push("`coverPic` = ?");
      values.push(coverPic);
    }
  }

  // g - City (optional)
  if (city) {
    if (city.trim().length > 85) {
      errors.city = "Enter a valid city name.";
    } else {
      updatedFields.push("`city` = ?");
      values.push(city.trim());
    }
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0)
    return res.status(400).json({ validationErrors: errors });

  // If no fields to update
  if (updatedFields.length === 0)
    return res.status(400).json("No field to update.");

  values.push(loggedInUserId);

  // Update database
  const q = `
    UPDATE users
    SET ${updatedFields.join(", ")}
    WHERE id = ?
  `;

  db.query(q, values, (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error updating user data.", error: error });

    if (data.affectedRows > 0)
      return res.status(200).json("User data updated.");

    return res.status(403).json("User can only delete their own profile.");
  });
};

export const deleteUser = (req, res) => {
  const loggedInUserId = req.userInfo.id;
  const q = "DELETE FROM users WHERE `id` = ?";

  db.query(q, [loggedInUserId], (error, data) => {
    if (error)
      return res
        .status(500)
        .json({ message: "Error deleting user.", error: error });

    if (data.affectedRows > 0) return res.status(200).json("User deleted.");
  });
};
