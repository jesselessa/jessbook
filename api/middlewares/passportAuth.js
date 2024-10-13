import passport from "passport";

// Handle authentication via a service web
export const passportAuth = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error) return next(error);

      if (!user)
        return res
          .status(401)
          .json({ message: info?.message || "Authentication failed." });

      req.user = user; 
      next();
    })(req, res, next);
  };
};
