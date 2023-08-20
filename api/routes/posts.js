import express from "express";
import {
  getPosts,
  addPost,
  updatePost,
  deletePost,
} from "../controllers/posts.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/", authenticateUser, getPosts);
router.post("/", authenticateUser, addPost);
router.put("/:postId", authenticateUser, updatePost);
router.delete("/:postId", authenticateUser, deletePost);

export default router;
