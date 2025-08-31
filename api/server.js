import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { upload } from "./middlewares/upload.js"; // Multer configuration
import passport from "passport";
import {
  connectWithGoogle,
  connectWithFacebook,
} from "./middlewares/configureAuthServiceStrategy.js";

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
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Create server with Express
const app = express();

// Dynamic CORS headers middleware
const allowedOrigins = [process.env.CLIENT_URL, process.env.API_URL];

app.use((req, res, next) => {
  //! req.headers.origin = the origin (protocol + domain + port) from which the request originated
  if (allowedOrigins.includes(req.headers.origin))
    res.header("Access-Control-Allow-Origin", req.headers.origin);

  res.header("Access-Control-Allow-Credentials", "true"); // Allow cookies and credentials
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// CORS middleware kept for standard handling
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Parse JSON data from incoming requests
app.use(express.json()); //! JSON data transformed into a JS object accessible in 'req.body'

// Parse cookies from incoming requests
app.use(cookieParser()); //! Cookies content accessible via 'req.cookies' and 'req.signedCookies'

// Upload files via 'upload' middleware configured with Multer
app.post("/api/uploads", upload, (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// Initialize Passport
app.use(passport.initialize());
connectWithGoogle();
connectWithFacebook();

// API routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/likes", likesRoute);
app.use("/api/relationships", relationshipsRoute);
app.use("/api/stories", storiesRoute);

// Serve "uploads" folder as static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../client/public/uploads"))
); //! Must be placed before 'app.get("*", ...)' which serves our React app, otherwise, requests for "/uploads" will be intercepted by the latter

// Serve front-end static files
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
}); // Display Login page

// Start server
app.listen(PORT, (error) => {
  if (error) {
    console.error("❌ Error connecting to server:", error);
  } else {
    console.log(`✅ Server running on port ${process.env.PORT}`);
  }
});
