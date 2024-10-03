import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { upload } from "./middlewares/upload.js"; // Multer configuration

// Environment variables
const host = process.env.HOST;
const PORT = process.env.PORT;

// Routes
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
    origin: process.env.CLIENT_URL, // Front-end URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Methods authorized
    credentials: true, // Allow cookies
  })
);

app.use(cookieParser());

// API routes
app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/likes", likesRoute);
app.use("/relationships", relationshipsRoute);
app.use("/stories", storiesRoute);

// Multer : handle file upload
app.post("/uploads", upload, (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// Serve static files for our front-end (after Vite build)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html")); // Serve index.html for any route not handled by the API
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at http://${host}:${PORT}`);
});
