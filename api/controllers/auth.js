import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "../db/connect.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  const { firstName, lastName, email, password, confirmPswd } = req.body;

  try {
    // 1 - Check if user already exists in the database by email
    const selectQuery = "SELECT * FROM users WHERE email = ?";
    const data = await executeQuery(selectQuery, [email]);

    if (data.length > 0)
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });

    // 2 - If user does not exist, start validating input values
    let errors = {};

    // 3 - Validate first name length
    if (firstName?.trim()?.length < 2 || firstName?.trim()?.length > 35)
      errors.firstName = "Enter a name between 2 and 35 characters.";

    // 4 - Validate last name length
    if (lastName?.trim()?.length < 1 || lastName?.trim()?.length > 35)
      errors.lastName = "Enter a name between 1 and 35 characters.";

    // 5 - Validate email format using regex and check max length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email?.trim()) || email?.trim()?.length > 320)
      errors.email = "Enter a valid email format.";

    // 6 - Validate password using regex
    const passwordRegex =
      /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;
    if (!passwordRegex.test(password?.trim()) || password?.trim()?.length > 200)
      errors.password =
        "Password must be between 6 and 200 characters, including at least 1 number and 1 symbol.";

    // 7 - Check if password and confirmation password match
    if (password?.trim() !== confirmPswd?.trim())
      errors.confirmPswd = "Confirmation password does not match.";

    // 8 - If there are any validation errors, return them
    if (Object.keys(errors).length > 0)
      return res.status(401).json({ errors: errors });

    // 9 - Hash password using bcrypt (with salt rounds = 10)
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password?.trim(), salt);

    // 10 - Insert new user into the database with default role = "user"
    const insertQuery =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`, `fromAuthProvider`,`role`) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      hashedPswd,
      "No", // Indicates the user is not from a third-party authentication provider
      "user",
    ];

    const insertData = await executeQuery(insertQuery, values);
    const newUserId = insertData.insertId; // Get the ID of newly created user

    // 11 - Automatically add admin as new user first relationship
    const insertRelationshipQuery =
      "INSERT INTO relationships (followerId, followedId) VALUES (?, ?)";

    // 12 - Find admin user ID (role = 'admin') in database
    const adminQuery = "SELECT id FROM users WHERE role = 'admin'";
    const adminData = await executeQuery(adminQuery);

    if (adminData.length === 0)
      return res.status(404).json({ message: "Admin not found" });

    const adminId = adminData[0].id;

    // 13 - Insert the relationship (new user follows admin)
    await executeQuery(insertRelationshipQuery, [newUserId, adminId]);

    // 14 - Return success response
    return res.status(201).json({ message: "New user created" });
  } catch (error) {
    // Catch any unexpected errors
    return res.status(500).json({
      message: "An unknown error occurred.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1 - Validate that both email and password are provided
  if (!email?.trim() || !password?.trim())
    return res
      .status(400)
      .json({ message: "Please, fill in all required fields." });

  try {
    // 2 - Find user by email in the database
    const q = "SELECT * FROM users WHERE email = ?";
    const data = await executeQuery(q, [email]);

    // 3 - If user does not exist, return error
    if (data.length === 0)
      return res.status(404).json({ message: "Invalid email or password" });

    // 4 - Compare provided password with hashed password stored in DB
    const checkPswd = bcrypt.compareSync(password, data[0].password);
    if (!checkPswd)
      return res.status(401).json({ message: "Invalid email or password" });

    // 5 - If password is correct, generate a JWT token
    const secretKey = process.env.JWT_SECRET;
    let token;

    // 6 - Set token payload based on user role (admin or regular user)
    if (data[0].role === "admin") {
      token = jwt.sign({ id: data[0].id, role: "admin" }, secretKey, {
        expiresIn: "7d", // Token expires in 7 days
      });
    } else {
      token = jwt.sign({ id: data[0].id, role: "user" }, secretKey, {
        expiresIn: "7d",
      });
    }

    // 7 - Remove password field from the response for security
    const { password: userPassword, ...otherInfo } = data[0];

    // 8 - Send JWT token in an HTTP-only cookie for better security
    return res
      .cookie("accessToken", token, {
        httpOnly: true, // Prevent client-side JavaScript access
        secure: process.env.NODE_ENV === "production", // Only send over HTTPS in prod
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site requests in prod ("lax" for others such as dev)
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
      })
      .status(201)
      .json(otherInfo);
  } catch (error) {
    // Catch unexpected errors
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

    if (data.length === 0)
      return res.status(404).json({ message: "User not found" });

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
  //! Cookie options (such as 'httpOnly', 'secure', and 'sameSite') must be the same between creation and deletion
  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .status(200)
    .json({ message: "User is logged out." });
};

export const recoverAccount = async (req, res) => {
  const { email } = req.body;

  // 1 - Check if email is provided
  if (!email?.trim()?.length)
    return res.status(400).json({ message: "Please, provide an email." });

  // 2 - Validate email format with regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim()) || email.trim().length > 320)
    return res.status(401).json({ message: "Invalid email format." });

  try {
    // 3 - Check if user exists in database by email
    const q = "SELECT * FROM users WHERE email = ?";
    const data = await executeQuery(q, [email.trim()]);

    if (data.length === 0)
      return res.status(404).json({
        message: "There is no account associated with this email address.",
      });

    // 4 - Generate a JWT token for password reset (expires in 1h)
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ id: data[0].id }, secretKey, { expiresIn: "1h" });

    // 5 - Build reset password link
    const resetLink = `${process.env.CLIENT_URL}/reset-password`;

    // 6 - Send email for password reset
    await sendEmail({
      to: email,
      subject: "Jessbook - Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 10px;">
          <h2 style="font-weight: bold;">Reset your Jessbook password</h2>
          <a href="${resetLink}" target="_blank" style="font-size: 16px; font-weight: bold; color: #008080">
            Click here to change your password
          </a>
          <p style="font-size: 16px; margin-top: 15px;">
            This link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    // 7 - Set a secure cookie with the token
    return res
      .cookie("resetToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 3600000, // 1 hour = 1(h) * 60(min) * 60(s) * 1000(ms)
      })
      .status(200)
      .json({
        message: "A link to reset your password has been sent to your email.",
      });
  } catch (error) {
    // Catch unexpected errors
    console.error("Error in recoverAccount:", error);
    return res.status(500).json({
      message: "An unknown error occurred.",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { password, confirmPswd } = req.body;
  const token = req.cookies.resetToken; // Get token from cookie

  console.log("ResetPassword called. Token received:", token);

  // 1 - Validate password fields
  if (!password?.trim() || !confirmPswd?.trim()) {
    console.log("Validation error: Missing fields");
    return res
      .status(400)
      .json({ message: "Please, fill in all required fields." });
  }

  const passwordRegex =
    /(?=.*[0-9])(?=.*[~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%])[a-zA-Z0-9~`!§@#$€%^&*()_\-+={[}\]|\\:;"'«»<,>.?/%]{6,}/;
  if (!passwordRegex.test(password?.trim()) || password?.trim()?.length > 200) {
    console.log("Validation error: Invalid password format");
    return res.status(401).json({
      message:
        "Password must be between 6 and 200 characters, including at least 1 number and 1 symbol.",
    });
  }

  if (password?.trim() !== confirmPswd?.trim()) {
    console.log("Validation error: Passwords do not match");
    return res
      .status(401)
      .json({ message: "Confirmation password does not match." });
  }

  if (!token) {
    console.log("Token missing in cookies");
    return res.status(401).json({ message: "Invalid authentication" });
  }

  const secretKey = process.env.JWT_SECRET;

  try {
    // 2 - Verify token
    const decoded = jwt.verify(token, secretKey);
    console.log("Token verified. User ID:", decoded.id);

    // 3 - Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password.trim(), salt);

    // 4 - Update database
    const q = "UPDATE users SET password = ? WHERE id = ?";
    await executeQuery(q, [hashedPswd, decoded.id]);
    console.log("Password updated in DB");

    // 5 - Clear cookie only after successful update
    res.clearCookie("resetToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    console.log("Reset token cookie cleared successfully");

    return res
      .status(200)
      .json({ message: "Your password has been successfully reset." });
  } catch (error) {
    console.log("Error verifying token:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid authentication", error: error.message });
  }
};
