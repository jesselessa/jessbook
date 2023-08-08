import { db } from "../utils/connect.js";
import jwt from "jsonwebtoken";

export const updateRole = (req, res) => {
    const userId = req.params.userId;
    const newRole = "admin"; // Update the role here
  
    const q = "UPDATE users SET role = ? WHERE id = ?";
  
    db.query(q, [newRole, userId], (error, _data) => {
      if (error) return res.status(500).json(error);
  
      // Generate a new token with updated role, using the same user ID
      const secretKey = process.env.REACT_APP_SECRET;
      const token = jwt.sign(
        { id: userId, role: newRole },
        secretKey,
        // { expiresIn: "30d"} 
      );
  
      // Replace old token with new token
      res
        .cookie("accessToken", token, { httpOnly: true }) 
        .status(200)
        .json("User role updated to admin.");
    });
  };