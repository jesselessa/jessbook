import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

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

// Multer configuration
const storage = multer.diskStorage({
  destination: function (_req, _file, callback) {
    callback(null, "../client/uploads");
  },
  filename: function (_req, file, callback) {
    const name = file.originalname.split(" ").join("_");
    callback(null, Date.now() + name);
  },
});
const upload = multer({ storage: storage }).single("file");

app.post("/uploads", upload, (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

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
