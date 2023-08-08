import express from "express";
import { getAllUsers, getUser, updateUser } from "../controllers/users.js";
import { updateRole } from "../middlewares/updateRole.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getAllUsers);

router.get("/:userId", isAdmin, getUser);

router.put("/", updateUser);

router.put("/:userId/updateRole", updateRole);

export default router;
