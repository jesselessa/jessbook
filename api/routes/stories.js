import express from "express";
import { getStories, addStory, deleteStory } from "../controllers/stories.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/", authenticateUser, getStories);
router.post("/", authenticateUser, addStory);
router.delete("/:storyId", authenticateUser, deleteStory);

export default router;
