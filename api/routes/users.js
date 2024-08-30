import express from "express";
import { getUser, updateUser, deleteUser } from "../controllers/user.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/:userId", getUser);
router.put("/", authenticateUser, updateUser);
router.delete("/", authenticateUser, deleteUser);

export default router;
