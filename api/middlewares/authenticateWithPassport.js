import passport from "passport";

// passport.authenticate(strategy, callback)(req, res, next); //! This function executes the middleware returned by 'passport.authenticate' passing it the 'req', 'res', and 'next' arguments to pursue request processing cycle

export const authenticateWithPassport = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error)
        return res.status(500).json({
          message: "An error occurred during authentication with Passport.",
          error: error,
        });

      if (!user)
        return res.status(401).json({
          message: info.message || "Authentication with Passport failed.",
        });

      req.user = user; // Store user data in request object

      next();
    })(req, res, next);
  };
};
