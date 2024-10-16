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

// Google login routes
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/login/google/callback",
  authenticateWithPassport("google"),
  handleAuthSuccess
);

//Facebook login routes
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
