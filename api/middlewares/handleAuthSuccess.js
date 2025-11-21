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

  // Generate a JWT token for the authenticated user
  let token;
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    const error = new Error("Missing JWT secret key on server.");
    error.status = 500; // Server configuration error (must be handled as 500)
    return next(error);
  }

  // Sign JWT token with user ID and role
  try {
    const payload = {
      id: req.user.id,
      role: req.user.role === "admin" ? "admin" : "user",
    };

    token = jwt.sign(payload, secretKey, {
      expiresIn: "7d",
    });
  } catch (error) {
    // Error during token signing (rare, but possible)
    const err = new Error(
      "An unknown error occurred while generating JWT token."
    );
    err.status = 500;
    err.details = err;
    return next(err);
  }

  // Set JWT token in HTTP-only cookie and redirect to frontend
  res
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: true, // Ensures HTTPS in production
      sameSite: "none", // Allows sharing between API and client on different domains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(201)
    // Redirection to frontend after authentication
    .redirect(`${process.env.CLIENT_URL}/login/auth-provider/callback`);
};
