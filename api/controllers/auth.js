import { db } from "../utils/connect.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  const { firstName, lastName, email, password, confirmPswd } = req.body;

  // 1 - Check if user is in database
  const selectQuery = "SELECT * FROM users WHERE email = ?";

  db.query(selectQuery, [email], (error, data) => {
    if (error) return res.status(500).json(error);

    // If user exists, return a conflict status
    if (data.length > 0) {
      return res
        .status(409)
        .json("A user account with this email address already exists.");
    }

    // 2 - If user doesn't exist, check password validation

    // a - Check if both password fields are provided
    if (password?.trim()?.length === 0 || confirmPswd?.trim()?.length === 0) {
      return res
        .status(401)
        .json("You must provide both a password and a confirmation password.");
    }

    // b - Check if passwords match
    if (password?.trim() !== confirmPswd?.trim()) {
      return res.status(401).json("The confirmation password does not match.");
    }

    // c -Check password length and format
    if (!/(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}/.test(password)) {
      return res
        .status(401)
        .json(
          "Password must contain at least 6 characters, including at least 1 number and 1 symbol."
        );
    }

    // 3 - Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password, salt);

    // 4 - Store new user in database
    const insertQuery =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`, `role`) VALUES (?)";
    const values = [firstName, lastName, email, hashedPswd, "user"];

    db.query(insertQuery, [values], (error, _data) => {
      if (error) return res.status(500).json(error);
      return res.status(200).json("New user created.");
    });
  });
};

export const login = (req, res) => {
  // 1 - Check email
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.length === 0)
      return res.status(404).json("Invalid email or password.");

    // 2 - Check password
    const checkPswd = bcrypt.compareSync(req.body.password, data[0].password);

    if (!checkPswd) return res.status(401).json("Invalid email or password.");

    // 3 - Generate token with JWT
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

    // 4 - Store token in cookie and send it in response
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
      secure: true,
      sameSite: "none", // Because API and React app port numbers are not the same
    })
    .status(200)
    .json("User logged out.");
};

export const recoverAccount = (req, res) => {
  const { email } = req.body;

  // If email received
  if (email) {
    const selectQuery = "SELECT * FROM users WHERE email = ?";

    db.query(selectQuery, [email], async (error, data) => {
      if (error) return res.status(500).json(error);

      if (data.length === 0) {
        return res
          .status(404)
          .json("There is no account associated with this email.");
      }

      // If user exists, generate token
      const secretKey = process.env.SECRET;
      const token = jwt.sign({ id: data[0].id }, secretKey, {
        expiresIn: "1h",
      });

      // Password reset link
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`; // TODO - Replace by our own API URL in production

      // Send email with Nodemailer
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
        // Error while sending email
        return res.status(500).json(err);
      }
    });
  } else {
    // No email in request
    return res.status(401).json("Invalid request.");
  }
};

export const resetPassword = (req, res) => {
  const { password, confirmPswd } = req.body;
  const { token } = req.params; // Get token from URL

  // 1 - Check if both password fields are provided
  if (password?.length === 0 || confirmPswd?.length === 0)
    return res
      .status(400)
      .json("You must provide a password and a confirmation password.");

  // 2 - Check if passwords match
  if (password?.trim()?.length !== confirmPswd?.trim()?.length)
    return res.status(400).json("Confirmation password does not match.");

  // 3 - Check password length and format
  if (!/(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}/.test(password))
    return res
      .status(400)
      .json(
        "Password must contain at least 6 characters, including at least 1 number and 1 symbol."
      );

  // 4 - Verify token
  if (!token) return res.status(401).json("Missing token.");

  const secretKey = process.env.SECRET;

  try {
    // Decode token to get user ID
    const decoded = jwt.verify(token, secretKey);

    // 5 - Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password, salt);

    // 6 - Update password in database
    const updateQuery = "UPDATE users SET password = ? WHERE id = ?";

    db.query(updateQuery, [hashedPswd, decoded.id], (error, _data) => {
      if (error) return res.status(500).json(error);

      return res.status(200).json("Your password has been successfully reset.");
    });
  } catch (err) {
    // Invalid or expired token
    return res.status(401).json("Invalid token.");
  }
};
