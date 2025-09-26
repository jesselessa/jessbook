//* authenticateWithPassport (OAuth Callback Handler)

import passport from "passport";

//! passport.authenticate(strategy, callback)(req, res, next) : this function executes the middleware returned by 'passport.authenticate' passing it the 'req', 'res', and 'next' arguments to pursue the request processing cycle

export const authenticateWithPassport = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      // 1. Internal strategy error (e.g., DB connection or configuration issue)
      if (error) {
        // Propagate the error
        const err = new Error(
          "An internal error occurred during authentication with Passport."
        );
        err.status = 500;
        err.details = error;
        return next(err);
      }

      // 2. Authentication failure (e.g., user not authorized by Google/Facebook)
      if (!user) {
        // Propagate the authentication failure
        const err = new Error(
          info?.message || "Authentication with Passport failed."
        );
        err.status = 401;
        return next(err);
      }

      req.user = user; // Store user data in request object

      next();
    })(req, res, next);
  };
};
