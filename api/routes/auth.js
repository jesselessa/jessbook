import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

// Controllers
import {
  register,
  login,
  recoverAccount,
  resetPassword,
  logout,
  connectWithFacebook,
  connectWithGoogle,
} from "../controllers/auth.js";

// Middlewares
import { passportAuth } from "../middlewares/passportAuth.js";

// Express router
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/recover-account", recoverAccount);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

// Social media login routes
router.get(
  "/auth/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/login/google/callback",
  passportAuth("google"), // Handle authentication via Google
  connectWithGoogle // Manage the rest (creation of new user, token, etc.)
);
router.get(
  "/auth/login/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/auth/login/facebook/callback",
  passportAuth("facebook"),
  connectWithFacebook
);
export default router;
