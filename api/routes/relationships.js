import express from "express";
import {
  getFollowers,
  getFollowing,
  addRelationship,
  deleteRelationship,
} from "../controllers/relationships.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/followers", authenticateUser, getFollowers);
router.get("/following", authenticateUser, getFollowing);
router.post("/", authenticateUser, addRelationship);
router.delete("/", authenticateUser, deleteRelationship);

export default router;
