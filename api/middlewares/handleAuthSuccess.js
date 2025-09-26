//* handleAuthSuccess (JWT Generation and Redirection)

import jwt from "jsonwebtoken";

export const handleAuthSuccess = (req, res, next) => {
  if (!req.user) {
    // If user data is missing after Passport processing
    const error = new Error(
      "Authentication failed: No user data found after Passport processing."
    );
    error.status = 401;
    return next(error);
  }

  // Generate a secret key
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    // Server configuration error (must be handled as 500)
    const error = new Error("Missing JWT secret key on server.");
    error.status = 500;
    return next(error);
  } //! Error 500 because server-side configuration problem

  // Set JWT token payload depending on user role
  let token;

  try {
    const role = req.user.role === "admin" ? "admin" : "user";

    token = jwt.sign({ id: req.user.id, role: role }, secretKey, {
      expiresIn: "7d",
    });
  } catch (error) {
    // Error during token signing (rare, but possible)
    const err = new Error(
      "An unknown error occurred while generating JWT token."
    );
    err.status = 500;
    err.details = error;
    return next(err);
  }

  res
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: true, // Ensures HTTPS in production
      sameSite: "none", // Allows sharing between API and Client on different domains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(201)
    // Redirection to frontend after authentication
    .redirect(`${process.env.CLIENT_URL}/login/auth-provider/callback`);
};
