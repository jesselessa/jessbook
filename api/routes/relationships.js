import express from "express";
import {
  getRelationships,
  addRelationship,
  deleteRelationship,
} from "../controllers/relationships.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/", authenticateUser, getRelationships);
router.post("/", authenticateUser, addRelationship);
router.delete("/", authenticateUser, deleteRelationship);

export default router;
