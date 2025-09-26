//* authenticateUser (JWT Verification Middleware)

import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    // Propagate the error to the global handler (401 Unauthorized)
    const error = new Error("User not authenticated");
    error.status = 401;
    return next(error);
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    //! decoded = token decoded payload after successful authentication
    if (error) {
      // Propagate the token expiration/invalidity error
      const err = new Error("Invalid or expired token");
      err.status = 401;
      err.details = error; // Add error details for server-side logging
      return next(err);
    }

    req.user = decoded; // Store token info in req.user

    next(); // Next step (protected route)
  });
};
