import { db } from "../utils/connect.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  const { firstName, lastName, email, password, confirmPswd } = req.body;

  // Check if user is in database
  const selectQuery = "SELECT * FROM users WHERE email = ?";

  db.query(selectQuery, [email], (error, data) => {
    if (error)
      return res.status(500).json({
        message: "An unknown error occurred while fetching user data.",
        error: error,
      });

    // 1 - If user exists, return a conflict status
    if (data.length > 0)
      return res
        .status(409)
        .json("A user account with this email address already exists.");

    // 2 - If user doesn't exist, validate request body values
    let errors = {};

    // a - Check name
    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      errors.firstName = "Enter a name between 2 and 35\u00A0characters.";

    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      errors.lastName = "Enter a name between 1 and 35\u00A0characters.";

    // b - Check email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email?.length > 64)
      errors.email = "Enter a valid email.";

    // c - Check password

    // c.a - Check password length and format
    if (!/(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}/.test(password))
      errors.password =
        "Password must contain at least 6 characters, including at least 1 number and 1 symbol.";

    // c.b - Check if passwords match
    if (password?.trim() !== confirmPswd?.trim())
      errors.confirmPswd = "Confirmation password does not match.";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    // 3 - Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password, salt);

    // 4 - Store new user in database
    const insertQuery =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`, `role`) VALUES (?)";
    const values = [firstName, lastName, email, hashedPswd, "user"];

    db.query(insertQuery, [values], (error, _data) => {
      if (error)
        return res.status(500).json({
          message: "An unknown error occurred while creating new user.",
          error: error,
        });
      return res.status(200).json("New user created.");
    });
  });
};

export const login = (req, res) => {
  const { email } = req.body;

  // Check if user is in database
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [email], (error, data) => {
    if (error)
      return res.status(500).json({
        message: "An unknown error occurred while fetching user data.",
        error: error,
      });

    // 1 - If user doesn't exist, send a status 404 error message
    if (data.length === 0)
      return res.status(404).json("Invalid email or password.");

    // 2 - If user exists

    // a - Check password
    const checkPswd = bcrypt.compareSync(req.body.password, data[0].password);
    if (!checkPswd) return res.status(401).json("Invalid email or password.");

    // b - Generate token with JWT
    const secretKey = process.env.SECRET;
    let token;

    if (data[0].role === "admin") {
      token = jwt.sign({ id: data[0].id, role: "admin" }, secretKey, {
        expiresIn: "30d",
      });
    } else {
      token = jwt.sign({ id: data[0].id, role: "user" }, secretKey, {
        expiresIn: "30d",
      });
    }

    // c - Store token in cookie and send it in response
    const { password, ...others } = data[0];

    return res
      .cookie("accessToken", token, { httpOnly: true }) //! 'httpOnly: true' prevents random JS script from accessing our cookie. It is very important to protect against XSS attacks !!!
      .status(200)
      .json(others);
  });
};

export const logout = (_req, res) => {
  return res
    .clearCookie("accessToken", {
      httpOnly: true, // Protect agains XSS attacks
      secure: true, // Prevent cookie from being observed by unauthorized parties
      sameSite: "none", // Allow cross-site cookies
    })
    .status(200)
    .json("User logged out.");
};

export const recoverAccount = (req, res) => {
  const { email } = req.body;

  if (email) {
    // Check if user is in database
    const selectQuery = "SELECT * FROM users WHERE email = ?";

    // Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json("Enter a valid email.");

    db.query(selectQuery, [email], async (error, data) => {
      if (error)
        return res.status(500).json({
          message: "An unknown error occurred while fetching user data.",
          error: error,
        });

      if (data.length === 0)
        return res
          .status(404)
          .json("There is no account associated with this email.");

      // 1 - If user exists, generate token
      const secretKey = process.env.SECRET;
      const token = jwt.sign({ id: data[0].id }, secretKey, {
        expiresIn: "1h",
      });

      // 2 - Create password reset link
      const resetLink = `${process.env.CLIENT_URL}/reset-password`;

      // 3 - Set token in cookie
      res.cookie("resetToken", token, {
        httpOnly: true,
        secure: true, // Ensure that cookies are only sent over HTTPS
        sameSite: "none", // Allow cross-site cookies
        maxAge: 3600000, // 1 hour
      });

      // 4 - Send email with Nodemailer
      try {
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

        return res
          .status(200)
          .json("A link to reset your password has been sent to your email.");
      } catch (err) {
        return res.status(500).json({
          message: "An unknown error occurred while sending email.",
          error: err,
        });
      }
    });
  } else {
    return res.status(400).json("Invalid request.");
  }
};

export const resetPassword = (req, res) => {
  const { password, confirmPswd } = req.body;
  const token = req.cookies.resetToken; // Get token from cookie

  // 1 - Check password length and format
  if (!/(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}/.test(password))
    return res
      .status(400)
      .json(
        "Password must contain at least 6 characters, including at least 1 number and 1 symbol."
      );

  // 2 - Check if passwords match
  if (password?.trim() !== confirmPswd?.trim())
    return res.status(400).json("Confirmation password does not match.");

  // 3 - Verify token
  if (!token) return res.status(401).json("Invalid token.");

  const secretKey = process.env.SECRET;

  try {
    const decoded = jwt.verify(token, secretKey); // Decode token to get user ID

    // 4 - Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password, salt);

    // 5 - Update password in database
    const updateQuery = "UPDATE users SET password = ? WHERE id = ?";

    db.query(updateQuery, [hashedPswd, decoded.id], (error, _data) => {
      if (error)
        return res.status(500).json({
          message: "An error occurred while updating password.",
          error: error,
        });

      // Clear 'resetToken' cookie after password has been reset to make token only usable once
      res.clearCookie("resetToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json("Your password has been successfully reset.");
    });
  } catch (err) {
    // Invalid or expired token
    return res.status(401).json("Invalid token.");
  }
};
