import { db, executeQuery } from "../utils/connect.js";
import { isImage } from "../utils/isFile.js";
import bcrypt from "bcryptjs";

//! In MySQL, when no results are found with a SELECT query, the 'data' variable will contain an empty array '[]', which is considered a truthy value. Therefore, to check if data really exists, we use 'if(data.length > 0)' and not 'if(data)', the latter always returning 'true'

export const getAllUsers = async (req, res) => {
  try {
    const q = "SELECT * FROM users";
    const data = await executeQuery(q);

    // Exclude password from users data
    const users = data.map((user) => {
      const { password, ...otherInfo } = user;
      return otherInfo;
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching all users data.",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const q = "SELECT * FROM users WHERE id = ?";
    const data = await executeQuery(q, [userId]);

    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...otherInfo } = data[0];
    return res.status(200).json(otherInfo);
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching user data.",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { firstName, lastName, email, password, profilePic, coverPic, city } =
    req.body;
  const loggedInUserId = req.user.id;
  const updatedFields = [];
  const values = [];

  // Check validation conditions
  let errors = {};

  if (firstName) {
    if (firstName.trim().length < 2 || firstName.trim().length > 35) {
      errors.firstName = "First name must be between 2 and 35\u00A0characters.";
    } else {
      updatedFields.push("`firstName` = ?");
      values.push(firstName.trim());
    }
  }

  if (lastName) {
    if (lastName.trim().length < 1 || lastName.trim().length > 35) {
      errors.lastName = "Last name must be between 1 and 35\u00A0characters.";
    } else {
      updatedFields.push("`lastName` = ?");
      values.push(lastName.trim());
    }
  }

  if (email) {
    // Check format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim()) || email.trim().length > 320) {
      errors.email = "Invalid email format";
    } else {
      updatedFields.push("`email` = ?");
      values.push(email.trim());
    }
  }

  // Password validation and hashing
  if (password) {
    // Check format
    const passwordRegex =
      /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;

    if (!passwordRegex.test(password) || password.trim()?.length > 200) {
      errors.password = "Invalid password format";
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
      errors.profilePic = "Invalid profile picture format";
    } else {
      updatedFields.push("`profilePic` = ?");
      values.push(profilePic);
    }
  }

  // Cover picture
  if (coverPic) {
    if (!isImage(coverPic)) {
      errors.coverPic = "Invalid cover picture format";
    } else {
      updatedFields.push("`coverPic` = ?");
      values.push(coverPic);
    }
  }

  // City
  if (city) {
    if (city.trim().length > 85) {
      errors.city = "Enter a valid city name.";
    } else {
      updatedFields.push("`city` = ?");
      values.push(city.trim());
    }
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ validationErrors: errors });
  }

  // If no fields to update
  if (updatedFields.length === 0) {
    return res.status(400).json("No field to update");
  }

  values.push(loggedInUserId);

  try {
    // Update database
    const q = `
          UPDATE users
          SET ${updatedFields.join(", ")}
          WHERE id = ?
        `;
    const data = await executeQuery(q, values);

    if (data.affectedRows > 0) {
      return res.status(200).json("User data updated");
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while updating user data.",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const loggedInUserId = req.user.id;
  try {
    const q = "DELETE FROM users WHERE `id` = ?";
    const data = await executeQuery(q, [loggedInUserId]);

    if (data.affectedRows > 0) {
      return res.status(200).json("User deleted");
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting user account.",
      error: error.message,
    });
  }
};
