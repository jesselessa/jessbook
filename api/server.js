import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.js"; //! Error if no file extension
import usersRoute from "./routes/users.js";
import postsRoute from "./routes/posts.js";
import commentsRoute from "./routes/comments.js";
import likesRoute from "./routes/likes.js";
import relationshipsRoute from "./routes/relationships.js";
import storiesRoute from "./routes/stories.js";

// Create server with Express
const app = express();

// Middlewares
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // 5173 = Vite (CRA alternative)
  })
);
app.use(cookieParser());

app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/likes", likesRoute);
app.use("/relationships", relationshipsRoute);
app.use("/stories", storiesRoute);

// Start server
const PORT = process.env.REACT_APP_PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
