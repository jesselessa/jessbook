import { db, executeQuery } from "../utils/connect.js";
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

  // Name validation
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

  // Email validation
  if (email) {
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

  // // Profile picture
  // if (profilePic) {
  //   if (!isImage(profilePic)) {
  //     errors.profilePic = "Invalid profile picture format";
  //   } else {
  //     updatedFields.push("`profilePic` = ?");
  //     values.push(profilePic);
  //   }
  // }

  // // Cover picture
  // if (coverPic) {
  //   if (!isImage(coverPic)) {
  //     errors.coverPic = "Invalid cover picture format";
  //   } else {
  //     updatedFields.push("`coverPic` = ?");
  //     values.push(coverPic);
  //   }
  // }

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
          // Delete old picture
          fs.unlinkSync(
            path.join(
              __dirname,
              "../../client/uploads",
              oldUserData[0].profilePic
            )
          );
          console.log("Old profile picture deleted");
        } catch (err) {
          console.error("Error deleting old profile picture:", err);
          // Do not block update if deletion fails
        }
      }

      updatedFields.push("`profilePic` = ?");
      values.push(profilePic);
    }
  }

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
              "../../client/uploads",
              oldUserData[0].coverPic
            )
          );
          console.log("Old cover picture deleted.");
        } catch (err) {
          console.error("Error deleting old cover picture:", err);
          // Do not block update if deletion fails
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
    // Retrieve profile, cover, and story file names before deleting user
    const userData = await executeQuery(
      "SELECT profilePic, coverPic FROM users WHERE id = ?",
      [loggedInUserId]
    );

    const storyData = await executeQuery(
      "SELECT file FROM stories WHERE userId = ?",
      [loggedInUserId]
    );

    // Delete profile and cover pictures if they exist
    if (userData.length > 0) {
      if (userData[0].profilePic) {
        try {
          fs.unlinkSync(
            path.join(__dirname, "../../client/uploads", userData[0].profilePic)
          );
          console.log("Old profile picture deleted on user deletion");
        } catch (err) {
          console.error(
            "Error deleting old profile picture on user deletion:",
            err
          );
        }
      }

      if (userData[0].coverPic) {
        try {
          fs.unlinkSync(
            path.join(__dirname, "../../client/uploads", userData[0].coverPic)
          );
          console.log("Old cover picture deleted on user deletion");
        } catch (err) {
          console.error(
            "Error deleting old cover picture on user deletion:",
            err
          );
        }
      }
    }

    // Delete story files if they exist
    if (storyData.length > 0) {
      for (const story of storyData) {
        if (story.file) {
          try {
            fs.unlinkSync(
              path.join(__dirname, "../../client/uploads", story.file)
            );
            console.log(`Story file ${story.file} deleted on user deletion`);
          } catch (err) {
            console.error(
              `Error deleting story file ${story.file} on user deletion:`,
              err
            );
          }
        }
      }
    }

    // Delete user from database.
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

// export const deleteUser = async (req, res) => {
//   const loggedInUserId = req.user.id;
//   try {
//     const q = "DELETE FROM users WHERE `id` = ?";
//     const data = await executeQuery(q, [loggedInUserId]);

//     if (data.affectedRows > 0) {
//       return res.status(200).json("User deleted");
//     }
//   } catch (error) {
//     return res.status(500).json({
//       message: "An unknown error occurred while deleting user account.",
//       error: error.message,
//     });
//   }
// };
