import { db } from "../utils/connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { sendEmail } from "../utils/sendEmail.js";

export const register = (req, res) => {
  const { firstName, lastName, email, password, confirmPswd } = req.body;

  // Find user in database by mail
  const selectQuery = "SELECT * FROM users WHERE email = ?";

  db.query(selectQuery, [email], (selectErr, data) => {
    if (selectErr)
      return res.status(500).json({
        message: "Error fetching user data.",
        error: selectErr,
      });

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

    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email?.trim()) || email?.trim()?.length > 320)
      errors.email = "Invalid email.";

    // Check password
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
    const hashedPswd = bcrypt.hashSync(password.trim(), salt);

    // Store new user in database
    // TODO - Add fromFacebook 'null', fromGoogle 'null' in table & change password to 'null'
    const insertQuery =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`, `role`) VALUES (?)";
    const values = [
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      hashedPswd,
      "user",
    ];

    db.query(insertQuery, [values], (insertErr, _data) => {
      if (insertErr)
        return res.status(500).json({
          message: "Error creating new user.",
          error: insertErr,
        });

      return res.status(201).json({ message: "New user created." });
    });
  });
};

export const login = (req, res) => {
  const { email } = req.body; //! Cannot use 'password' variable here, otherwise, ReferenceError object : 'Cannot destructure password before initialization'

  if (email?.trim()?.length === 0 || req.body.password?.trim()?.length === 0)
    return res
      .status(400)
      .json({ message: "Please, fill in all required fields." });

  // Find user in database by mail
  const q = `SELECT * FROM users WHERE email = ?`;

  db.query(q, [email], (error, data) => {
    if (error)
      return res.status(500).json({
        message: "Error fetching user data.",
        error: error,
      });

    // Check if user exists
    if (data.length === 0)
      return res.status(404).json({ message: "Invalid email or password." });

    // Compare passwords with bcrypt
    const checkPswd = bcrypt.compareSync(req.body.password, data[0].password); //! 'data[0]' represents the query result (user) = an array with one entry
    if (!checkPswd)
      return res.status(401).json({ message: "Invalid email or password." });

    // If passord is correct, generate a token with JWT
    const secretKey = process.env.SECRET;
    let token;

    // Check user role to set token content
    if (data[0].role === "admin") {
      token = jwt.sign({ id: data[0].id, role: "admin" }, secretKey, {
        expiresIn: "7d", // After delay, invalid token : user must reconnect
      });
    } else {
      token = jwt.sign({ id: data[0].id, role: "user" }, secretKey, {
        expiresIn: "7d",
      });
    }

    // Remove password before sending user data
    const { password, ...otherInfo } = data[0];

    // Store token in a cookie named 'accessToken' with value of 'token' and send it in response
    return res
      .cookie("accessToken", token, {
        httpOnly: true, // Prevent scripts from accessing cookie (XSS protection)
        secure: true, // Ensure cookies are only sent over HTTPS connections
        sameSite: "none", // Allow cross-site access
        maxAge: 7 * 24 * 60 * 60 * 1000, // 'maxAge' in milliseconds, must match token expiration date
      })
      .status(201)
      .json(otherInfo);
  });
};

export const logout = (_req, res) => {
  //! Cookie options (such as 'httpOnly', 'secure', and 'sameSite') must be the same between creation and deletion
  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ message: "User logged out." });
};

export const recoverAccount = (req, res) => {
  const { email } = req.body;

  if (email?.trim()?.length > 0) {
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()) || email.trim().length > 320)
      return res.status(401).json({ message: "Invalid email." });

    // Find user by mail
    const q = "SELECT * FROM users WHERE email = ?";

    db.query(q, [email.trim()], async (error, data) => {
      if (error)
        return res.status(500).json({
          message: "Error fetching user data.",
          error: error,
        });

      // Check if user exists
      if (data.length === 0)
        return res.status(404).json({
          message: "There is no account associated with this email address.",
        });

      // If user exists, generate a token
      const secretKey = process.env.SECRET;
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

        return res.status(200).json({
          message: "A link to reset your password has been sent to your email.",
        });
      } catch (err) {
        return res.status(500).json({
          message: "Error sending email.",
          error: err,
        });
      }
    });
  } else {
    return res.status(400).json({ message: "Please, provide an email." });
  }
};

export const resetPassword = (req, res) => {
  const { password, confirmPswd } = req.body;
  const token = req.cookies.resetToken; // Get token from cookie

  // Check if password is provided
  if (password?.trim()?.length === 0 || confirmPswd?.trim()?.length === 0)
    return res
      .status(400)
      .json({ message: "Please, fill in all required fields." });

  // Check password format
  const passwordRegex =
    /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;
  if (!passwordRegex.test(password?.trim()) || password?.trim()?.length > 200)
    return res.status(401).json({
      message:
        "Password must be between 6 and 200\u00A0characters, including at least 1\u00A0number and 1\u00A0symbol.",
    });

  // Check if passwords match
  if (password?.trim() !== confirmPswd?.trim())
    return res
      .status(401)
      .json({ message: "Confirmation password does not match." });

  // Check if token is present
  if (!token)
    return res.status(401).json({ message: "Invalid authentication." });
  const secretKey = process.env.JWT_SECRET;

  try {
    // Decode token to get user ID
    const decoded = jwt.verify(token, secretKey);

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password?.trim(), salt);

    // Update password in database
    const q = "UPDATE users SET password = ? WHERE id = ?";

    db.query(q, [hashedPswd, decoded.id], (error, _data) => {
      if (error)
        return res.status(500).json({
          message: "Error updating password.",
          error: error,
        });

      // Clear 'resetToken' cookie after password has been reset to make token only usable once
      res.clearCookie("resetToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res
        .status(200)
        .json({ message: "Your password has been successfully reset." });
    });
  } catch (err) {
    // Invalid or expired token
    return res
      .status(401)
      .json({ message: "Invalid authentication.", error: err });
  }
};

//* Connect via social networks with Passport
//! When users log in via authentication providers such as Google or Facebook, their credentials (profile, email, etc.) are transmitted to our server. 'Strategies' are function which define how to handle these data.

export const connectWithGoogle = () => {
  // Set up Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/login/google/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const firstName = profile.name?.givenName || "Undefined"; // If available
        const lastName = profile.name?.familyName || profile.displayName; // Family name or fullName


        const selectQuery = `SELECT * FROM users WHERE email = ?`;

        db.query(selectQuery, [email], (selectErr, data) => {
          if (selectErr) return done(selectErr);

          // If user exists, continue connection
          if (data.length > 0) return done(null, data[0]);

          // Otherwise, create a new user
          const insertQuery = `INSERT INTO users (firstName, lastName, email, fromGoogle, role) VALUES (?)`;
          const values = [firstName, lastName, email, 1, "user"];

          db.query(insertQuery, [values], (insertError, insertData) => {
            if (insertError) return done(insertError);

            const newUser = {
              id: insertData.insertId, // new user ID added in table
              firstName,
              lastName,
              email,
              fromGoogle: 1, //! Boolean not supported in MySQL (1 = true and 0 = false)
              role: "user",
            };
            return done(null, newUser);
          });
        });
      }
    )
  );
};

export const connectWithFacebook = () => {
  // Set up Facebook OAuth strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/login/facebook/callback`,
        profileFields: ["id", "emails", "name"], // Get required fields
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;

        const selectQuery = `SELECT * FROM users WHERE email = ?`;

        db.query(selectQuery, [email], (selectErr, data) => {
          if (selectErr) return done(selectErr);

          // If user exists, continue connection
          if (data.length > 0) return done(null, data[0]);

          // Otherwise, create a new user
          const insertQuery = `INSERT INTO users (firstName, lastName, email, fromFacebook, role) VALUES (?)`;
          const values = [firstName, lastName, email, 1, "user"];

          db.query(insertQuery, [values], (insertError, insertData) => {
            if (insertError) return done(insertError);

            const newUser = {
              id: insertData.insertId,
              firstName,
              lastName,
              email,
              fromFacebook: 1,
              role: "user",
            };
            return done(null, newUser);
          });
        });
      }
    )
  );
};
