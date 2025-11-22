import { db, executeQuery } from "../db/connect.js";
import { isImage } from "../utils/isFile.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    if (data.length === 0)
      return res.status(404).json({ message: "User not found" });

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

  // Check validation conditions
  const updatedFields = [];
  const values = [];
  let errors = {};

  // Name
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

  // Email
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()) || email.trim().length > 320) {
      errors.email = "Invalid email format";
    } else {
      updatedFields.push("`email` = ?");
      values.push(email.trim());
    }
  }

  // Password
  if (password) {
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

  // Profile pic
  if (profilePic) {
    if (!isImage(profilePic)) {
      errors.profilePic = "Invalid profile picture format";
    } else {
      // Retrieve old profile picture name
      const oldUserData = await executeQuery(
        "SELECT profilePic FROM users WHERE id = ?",
        [loggedInUserId]
      );

      // Check if an old picture exists and is different from the new one
      if (
        oldUserData.length > 0 &&
        oldUserData[0].profilePic &&
        oldUserData[0].profilePic !== profilePic
      ) {
        try {
          // Delete old picture from server in "uploads" folder
          fs.unlinkSync(
            path.join(
              __dirname,
              "../../client/public/uploads",
              oldUserData[0].profilePic
            )
          );
        } catch (err) {
          console.error("Error deleting old profile picture:", err);
        }
      }
      updatedFields.push("`profilePic` = ?");
      values.push(profilePic);
    }
  }

  // Cover pic
  if (coverPic) {
    if (!isImage(coverPic)) {
      errors.coverPic = "Invalid cover picture format";
    } else {
      // Retrieve old cover picture name
      const oldUserData = await executeQuery(
        "SELECT coverPic FROM users WHERE id = ?",
        [loggedInUserId]
      );

      // Check if an old picture exists and is different from the new one
      if (
        oldUserData.length > 0 &&
        oldUserData[0].coverPic &&
        oldUserData[0].coverPic !== coverPic
      ) {
        try {
          // Delete old picture
          fs.unlinkSync(
            path.join(
              __dirname,
              "../../client/public/uploads",
              oldUserData[0].coverPic
            )
          );
        } catch (err) {
          console.error("Error deleting old cover picture:", err);
        }
      }
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

  // Return validation errors
  if (Object.keys(errors).length > 0)
    return res.status(400).json({ validationErrors: errors });

  // Nothing to update
  if (updatedFields.length === 0)
    return res.status(400).json("No field to update");

  values.push(loggedInUserId);

  // Update the database
  const q = `
          UPDATE users
          SET ${updatedFields.join(", ")}
          WHERE id = ?
        `;

  const data = await executeQuery(q, values);

  // If no row updated → either user doesn't exist or not authorized
  if (data.affectedRows === 0) {
    return res.status(404).json("User not found or unauthorized");
  }

  try {
    // Fetch the freshly updated user (without password)
    const selectQuery =
      "SELECT id, firstName, lastName, email, profilePic, coverPic, city, fromAuthProvider, role FROM users WHERE id = ?";

    const updatedRows = await executeQuery(selectQuery, [loggedInUserId]);

    if (updatedRows.length === 0) {
      return res.status(404).json({ message: "User not found after update" });
    }

    const updatedUser = updatedRows[0];

    // Return clean updated user object
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching updated user data.",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const loggedInUserId = req.user.id;
  try {
    // Retrieve profile, cover, story and post image files names before deleting user
    const userData = await executeQuery(
      "SELECT profilePic, coverPic FROM users WHERE id = ?",
      [loggedInUserId]
    );
    const storyData = await executeQuery(
      "SELECT file FROM stories WHERE userId = ?",
      [loggedInUserId]
    );
    const postData = await executeQuery(
      "SELECT img FROM posts WHERE userId = ?",
      [loggedInUserId]
    );

    // Delete profile and cover pictures if they exist
    if (userData.length > 0) {
      if (userData[0].profilePic) {
        fs.unlinkSync(
          path.join(
            __dirname,
            "../../client/public/uploads",
            userData[0].profilePic
          )
        );
        console.log(`File deleted: ${userData[0].profilePic}`);
      }
      if (userData[0].coverPic) {
        fs.unlinkSync(
          path.join(
            __dirname,
            "../../client/public/uploads",
            userData[0].coverPic
          )
        );
        console.log(`File deleted: ${userData[0].coverPic}`);
      }
    }

    // Delete post images if they exist
    if (postData.length > 0) {
      for (const post of postData) {
        if (post.img) {
          fs.unlinkSync(
            path.join(__dirname, "../../client/public/uploads", post.img)
          );
          console.log(`File deleted: ${post.img}`);
        }
      }
    }

    // Delete story file if it exists
    if (storyData.length > 0 && storyData[0].file) {
      fs.unlinkSync(
        path.join(__dirname, "../../client/public/uploads", storyData[0].file)
      );
      console.log(`File deleted: ${storyData[0].file}`);
    }

    // Delete user from database
    const q = "DELETE FROM users WHERE `id` = ?";
    const data = await executeQuery(q, [loggedInUserId]);

    if (data.affectedRows > 0) return res.status(200).json("User deleted");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting user account.",
      error: error.message,
    });
  }
};
