import "dotenv/config";
import express from "express";

// Create server with Express
const app = express();
const PORT = process.env.REACT_APP_PORT || 5000;

// Middlewares
app.use(express.json());

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
