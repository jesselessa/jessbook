import express from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comments.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/", authenticateUser, getComments);
router.post("/", authenticateUser, addComment);
router.put("/:commentId", authenticateUser, updateComment);
router.delete("/:commentId", authenticateUser, deleteComment);

export default router;
