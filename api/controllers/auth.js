import { db } from "../utils/connect.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // 1 - Check if user is in database
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [email], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.length > 0)
      return res
        .status(409)
        .json("A user account with this email address already exists.");

    // 2 - If no user, create a new one
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password, salt);

    // Store new user in database
    const q =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`, `role`) VALUES (?)";

    const values = [firstName, lastName, email, hashedPswd, "user"];

    db.query(q, [values], (error, _data) => {
      if (error) return res.status(500).json(error);

      return res.status(200).json("New user created.");
    });
  });
};

export const login = (req, res) => {
  // 1 - Check user mail
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.length === 0)
      return res.status(404).json("Invalid email or password.");

    // 2 - Check password
    const checkPswd = bcrypt.compareSync(req.body.password, data[0].password);

    if (!checkPswd) return res.status(400).json("Invalid email or password.");

    // 3 - Generate token with jsonwebtoken
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

    // 4 - Store token in cookie and send it in response if login is successful
    const { password, ...others } = data[0];

    return res
      .cookie("accessToken", token, { httpOnly: true }) // Random JS script can't access our cookie
      .status(200)
      .json(others);
  });
};

export const recoverAccount = (req, res) => {
  const { email } = req.body;

  // If email received
  if (email) {
    const selectQuery = "SELECT * FROM users WHERE email = ?";

    db.query(selectQuery, [email], async (error, data) => {
      if (error) return res.status(500).json(error);

      if (data.length === 0)
        return res
          .status(404)
          .json("There is no account associated with this email.");

      if (data.length > 0) {
        // Generate a token for reset
        const secretKey = process.env.SECRET;
        const token = jwt.sign({ id: data[0].id }, secretKey, {
          expiresIn: "1h",
        });

        // Password reset link
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

        // Send email with Nodemailer
        try {
          await sendEmail({
            to: email,
            subject: "Jessbook - Reset your password",
            html: `<div style="padding: 10px">
                    <p>Clink the link below to reset your password\u00A0:</p>
                    <a href="${resetLink}" target="_blank" style="font-weight: bold; color: #008080">
                      Changer my password
                    </a>
                    <p style="margin-top: 10px; font-weight: bold">This link will expire in 1 hour.</p>
                  </div>`,
          });

          return res
            .status(200)
            .json("A link to reset your password has be sent to your email.");
        } catch (err) {
          return res.status(500).json(err);
        }
      }
    });
  } else {
    return res.status(400).json("Invalid request.");
  }
};

export const resetPassword = (req, res) => {
  const { password } = req.body;
  const { token } = req.params; // Get token from URL

  // If token and password received
  if (password && token) {
    const secretKey = process.env.SECRET;

    try {
      // Decode token to get user ID
      const decoded = jwt.verify(token, secretKey);

      // Hash new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPswd = bcrypt.hashSync(password, salt);

      // Update password in database
      const updateQuery = "UPDATE users SET password = ? WHERE id = ?";

      db.query(updateQuery, [hashedPswd, decoded.id], (error, _data) => {
        if (error) return res.status(500).json(error);

        return res
          .status(200)
          .json("Your password has been successfully reset.");
      });
    } catch (error) {
      return res.status(400).json("Invalid token.");
    }
  } else {
    return res.status(400).json("Invalid request.");
  }
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
