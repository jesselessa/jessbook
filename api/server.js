import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { upload } from "./middlewares/upload.js";

// Routes
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import postsRoute from "./routes/posts.js";
import commentsRoute from "./routes/comments.js";
import likesRoute from "./routes/likes.js";
import relationshipsRoute from "./routes/relationships.js";
import storiesRoute from "./routes/stories.js";

const PORT = process.env.PORT;

// Get __dirname equivalent in ES module mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create server with Express
const app = express();

// Handle HTTP header in response
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true); //! Allow coookies or other authentication info such as tokens
  next();
});

// Handle Cross-Origin Resource Sharing (CORS) requests
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies
  })
);

// Parse JSON data from incoming requests
app.use(express.json()); //! JSON data transformed into a JS object accessible in 'req.body'

// Parse cookies from incoming requests
app.use(cookieParser()); //! Cookies content accessible via 'req.cookies' and 'req.signedCookiess'

// Upload files via 'upload' middleware configured with Multer
app.post("/uploads", upload, (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// API routes
app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/likes", likesRoute);
app.use("/relationships", relationshipsRoute);
app.use("/stories", storiesRoute);

// Serve static files for our front end (after Vite build)
app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle routes not defined by API
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
}); // Display Login page

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at ${process.env.SERVER_URL}`);
});
