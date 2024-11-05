import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getAllUsers);
router.get("/:userId", authenticateUser, getUser);
router.put("/", authenticateUser, updateUser);
router.delete("/", authenticateUser, deleteUser);

export default router;
