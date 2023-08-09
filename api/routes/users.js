import express from "express";
import { getAllUsers, getUser, updateUser } from "../controllers/users.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/", isAdmin, getAllUsers);

router.get("/:userId", isAdmin, getUser);

router.put("/", authenticateUser, updateUser);

export default router;
