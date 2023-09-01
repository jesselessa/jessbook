import express from "express";
import { getUser, updateUser } from "../controllers/user.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/:userId", getUser);

router.put("/", authenticateUser, updateUser);

export default router;
