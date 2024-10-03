import express from "express";
import {
  register,
  login,
  recoverAccount,
  resetPassword,
  logout,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/recover-account", recoverAccount);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", logout);

export default router;
