import express from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comments.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", authenticateUser, addComment);
router.put("/:postId", authenticateUser, updateComment);
router.delete("/:postId", authenticateUser, deleteComment);

export default router;
