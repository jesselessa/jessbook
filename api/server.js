import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import { upload } from "./middlewares/upload.js"; // Multer configuration
import {
  connectWithGoogle,
  connectWithFacebook,
} from "./middlewares/configureAuthServiceStrategy.js";
import { connectDB } from "./db/connect.js";
import history from "connect-history-api-fallback";
import helmet from "helmet";

// Routes
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import postsRoute from "./routes/posts.js";
import commentsRoute from "./routes/comments.js";
import likesRoute from "./routes/likes.js";
import relationshipsRoute from "./routes/relationships.js";
import storiesRoute from "./routes/stories.js";

const PORT = process.env.PORT;

// Resolve __dirname for ES modules
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Create server with Express
const app = express();

// Use Helmet defaults to set a variety of security headers
app.use(helmet());
// Override the default Content Security Policy (CSP) with a custom configuration
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true, // Use the default CSP directives
    directives: {
      // Allow images (previews) from the same origin, HTTPS, data, AND blob: URIs
      "img-src": ["'self'", "https:", "data:", "blob:"], // Allow media (videos/sounds) from the same domain AND blob: URLs

      "media-src": ["'self'", "blob:"],
    },
  })
);

// Use CORS middleware
const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Allow cookies
  })
);

// Parse JSON data from incoming requests
app.use(express.json()); //! JSON data transformed into a JS object accessible in 'req.body'

// Parse cookies from incoming requests
app.use(cookieParser()); //! Cookies content accessible via 'req.cookies' and 'req.signedCookies'

// Initialize Passport
app.use(passport.initialize());
connectWithGoogle(); // Configure Google OAuth strategy
connectWithFacebook(); // Configure Facebook OAuth strategy

// API ROUTES
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/likes", likesRoute);
app.use("/api/relationships", relationshipsRoute);
app.use("/api/stories", storiesRoute);
// Files uploaded with Multer
app.post("/api/uploads", upload, (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// Serve "uploads" folder as static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../client/public/uploads"))
);

// Production setup for static files (SPA handling)
if (process.env.NODE_ENV === "production") {
  // 1. SPA Fallback: Unknown routes (non-API) must be redirected to index.html
  // This MUST be placed BEFORE serving static files, so the history middleware
  // Can catch routes like /home or /login/auth-provider/callback that are client-side routes
  app.use(history({ verbose: true })); 
  
  // 2. Serve static files from React/Vite build (including index.html) // The history middleware will redirect the request to index.html, // which will then be served by express.static
  app.use(express.static(path.join(__dirname, "../client/dist")));
}

// Global error handler
// This middleware is crucial for handling all uncaught errors, preventing the server from crashing
// It should always be placed at the end of our middleware chain
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// Start server
const startServer = async () => {
  try {
    await connectDB(); // Connect to the database
    app.listen(PORT, () => {
      console.log(`✅ Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
