import express from "express";
import passport from "passport";

// Controllers
import {
  register,
  login,
  recoverAccount,
  resetPassword,
  logout,
} from "../controllers/auth.js";

// Middlewares
import { authenticateWithPassport } from "../middlewares/authenticateWithPassport.js";
import { handleAuthSuccess } from "../middlewares/handleAuthSuccess.js";

// Express router
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/recover-account", recoverAccount);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

// Social media login routes
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
); // Send user to authentication provider : once user is authenticated, Google redirects the latter to our app at the specified callback URL.
router.get(
  "/login/google/callback",
  authenticateWithPassport("google"),
  handleAuthSuccess // Handle response after authentication
);

// router.get(
//   "/login/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );
// router.get(
//   "/login/facebook/callback",
//   passportAuth("facebook"),
//   handleAuthSuccess
// );

export default router;
