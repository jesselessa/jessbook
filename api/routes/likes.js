import express from "express";
import { getLikes, addLike, deleteLike } from "../controllers/likes.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/", getLikes);
router.post("/", authenticateUser, addLike);
router.delete("/", authenticateUser, deleteLike);

export default router;
