import express from "express";
import passport from "passport";

// Controllers
import {
  register,
  login,
  connectWithToken,
  recoverAccount,
  resetPassword,
  logout,
} from "../controllers/auth.js";

// Middlewares
import { authenticateUser } from "../middlewares/authenticateUser.js";
import { authenticateWithPassport } from "../middlewares/authenticateWithPassport.js";
import { handleAuthSuccess } from "../middlewares/handleAuthSuccess.js";

// Express router
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/connect-with-token", authenticateUser, connectWithToken);
router.post("/recover-account", recoverAccount);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

// Google OAuth
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/login/google/callback",
  authenticateWithPassport("google"),
  handleAuthSuccess
);

// Facebook OAuth
router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/login/facebook/callback",
  authenticateWithPassport("facebook"),
  handleAuthSuccess
);

export default router;
