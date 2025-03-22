import { db, executeQuery } from "../utils/connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  const { firstName, lastName, email, password, confirmPswd } = req.body;

  try {
    // Find user in database by email
    const selectQuery = "SELECT * FROM users WHERE email = ?";
    const data = await executeQuery(selectQuery, [email]);

    // Check if user exists
    if (data.length > 0)
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });

    // If user doesn't exist, validate request body values
    let errors = {};

    // Check name
    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      errors.firstName = "Enter a name between 2 and 35\u00A0characters.";

    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      errors.lastName = "Enter a name between 1 and 35\u00A0characters.";

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email?.trim()) || email?.trim()?.length > 320)
      errors.email = "Enter a valid email format.";

    // Check password format
    const passwordRegex =
      /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;
    if (!passwordRegex.test(password?.trim()) || password?.trim()?.length > 200)
      errors.password =
        "Password must be between 6 and 200\u00A0characters, including at least 1\u00A0number and 1\u00A0symbol.";

    // Check if passwords match
    if (password?.trim() !== confirmPswd?.trim())
      errors.confirmPswd = "Confirmation password does not match.";

    if (Object.keys(errors).length > 0)
      return res.status(401).json({ errors: errors });

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password?.trim(), salt);

    const insertQuery =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`, `fromAuthProvider`,`role`) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      hashedPswd,
      "No",
      "user",
    ];

    const insertRelationshipQuery =
      "INSERT INTO relationships (followerId, followedId) VALUES (?, ?)";

    // Store new user in database
    const insertData = await executeQuery(insertQuery, values);
    const newUserId = insertData.insertId;

    // Find admin ID based on role
    const adminQuery = "SELECT id FROM users WHERE role = 'admin'";
    const adminData = await executeQuery(adminQuery);

    if (adminData.length === 0)
      return res.status(404).json({ message: "Admin not found" });

    const adminId = adminData[0].id;

    // Insert admin as first relationship followed by new user
    await executeQuery(insertRelationshipQuery, [newUserId, adminId]);

    return res.status(201).json({ message: "New user created" });
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json({ message: "Please, fill in all required fields." });
  }

  try {
    // Find user by email
    const q = "SELECT * FROM users WHERE email = ?";
    const data = await executeQuery(q, [email]);

    // Check if user exists
    if (data.length === 0) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Compare passwords with bcrypt
    const checkPswd = bcrypt.compareSync(password, data[0].password);
    if (!checkPswd) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If password is correct, generate a token with JWT
    const secretKey = process.env.JWT_SECRET;
    let token;

    // Set token info (payload) depending on user role
    if (data[0].role === "admin") {
      token = jwt.sign({ id: data[0].id, role: "admin" }, secretKey, {
        expiresIn: "7d", // After delay, invalid token: user must reconnect
      });
    } else {
      token = jwt.sign({ id: data[0].id, role: "user" }, secretKey, {
        expiresIn: "7d",
      });
    }

    // Remove password before sending user data
    const { password: userPassword, ...otherInfo } = data[0];

    // Set token in cookie
    return res
      .cookie("accessToken", token, {
        httpOnly: true, // Prevent scripts from accessing cookie (XSS protection)
        secure: true, // Ensure cookies are only sent over HTTPS connections
        sameSite: "none", // Allow cross-site access
        maxAge: 7 * 24 * 60 * 60 * 1000, // 'maxAge' in milliseconds, must match token expiration date
      })
      .status(201)
      .json(otherInfo);
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred.",
      error: error.message,
    });
  }
};

export const connectWithToken = async (req, res) => {
  const loggedInUserId = req.user.id; // Get user ID from token
  try {
    const q = "SELECT * FROM users WHERE id = ?";
    const data = await executeQuery(q, [loggedInUserId]);

    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: userPassword, ...otherInfo } = data[0];
    return res.status(200).json(otherInfo);
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred.",
      error: error.message,
    });
  }
};

export const logout = (_req, res) => {
  // Cookie options (such as 'httpOnly', 'secure', and 'sameSite') must be the same between creation and deletion
  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ message: "User is logged out." });
};

export const recoverAccount = async (req, res) => {
  const { email } = req.body;

  if (email?.trim()?.length > 0) {
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()) || email.trim().length > 320) {
      return res.status(401).json({ message: "Invalid email" });
    }

    try {
      // Find user by email
      const q = "SELECT * FROM users WHERE email = ?";
      const data = await executeQuery(q, [email.trim()]);

      // Check if user exists
      if (data.length === 0) {
        return res.status(404).json({
          message: "There is no account associated with this email address.",
        });
      }

      // If user exists, generate a token
      const secretKey = process.env.JWT_SECRET;
      const token = jwt.sign({ id: data[0].id }, secretKey, {
        expiresIn: "1h",
      });

      // Create a password reset link
      const resetLink = `${process.env.CLIENT_URL}/reset-password`;

      // Set token in cookie
      res
        .cookie("resetToken", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 3600000, // 1 hour = 1(h) * 60(min) * 60(s) * 1000(ms)
        })
        .status(201);

      // Send email with Nodemailer
      await sendEmail({
        to: email,
        subject: "Jessbook - Reset your password",
        html: `<div style="padding: 10px">
                            <p>Click the link below to reset your password\u00A0:</p>
                            <a href="${resetLink}" target="_blank" style="font-weight: bold; color: #008080">
                              Change my password
                            </a>
                            <p style="margin-top: 10px; font-weight: bold">This link will expire in 1 hour.</p>
                          </div>`,
      });

      return res.status(200).json({
        message: "A link to reset your password has been sent to your email.",
      });
    } catch (error) {
      return res.status(500).json({
        message: "An unknown error occurred.",
        error: error.message,
      });
    }
  } else {
    return res.status(400).json({ message: "Please, provide an email." });
  }
};

export const resetPassword = async (req, res) => {
  const { password, confirmPswd } = req.body;
  const token = req.cookies.resetToken; // Get token from cookie

  // Check if password is provided
  if (!password?.trim() || !confirmPswd?.trim()) {
    return res
      .status(400)
      .json({ message: "Please, fill in all required fields." });
  }

  // Check password format
  const passwordRegex =
    /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;
  if (!passwordRegex.test(password?.trim()) || password?.trim()?.length > 200) {
    return res.status(401).json({
      message:
        "Password must be between 6 and 200\u00A0characters, including at least 1\u00A0number and 1\u00A0symbol.",
    });
  }

  // Check if passwords match
  if (password?.trim() !== confirmPswd?.trim()) {
    return res
      .status(401)
      .json({ message: "Confirmation password does not match." });
  }

  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: "Invalid authentication" });
  }
  const secretKey = process.env.JWT_SECRET;

  try {
    // Decode token to get user ID
    const decoded = jwt.verify(token, secretKey);

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password?.trim(), salt);

    // Update password in database
    const q = "UPDATE users SET password = ? WHERE id = ?";
    await executeQuery(q, [hashedPswd, decoded.id]);

    // Clear 'resetToken' cookie after password has been reset to make token only usable once
    res.clearCookie("resetToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res
      .status(200)
      .json({ message: "Your password has been successfully reset." });
  } catch (error) {
    // Invalid or expired token
    return res
      .status(401)
      .json({ message: "Invalid authentication", error: error.message });
  }
};
