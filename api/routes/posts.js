import express from "express";
import {
  getPosts,
  addPost,
  updatePost,
  deletePost,
} from "../controllers/posts.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", addPost);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

export default router;
