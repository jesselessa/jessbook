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
import rateLimit from "express-rate-limit";

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
      "img-src": ["'self'", "https:", "data:"], // Allow images from the same origin, HTTPS URLs, and data URIs
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

// Upload files via 'upload' middleware configured with Multer
app.post("/api/uploads", upload, (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// Initialize Passport
app.use(passport.initialize());
connectWithGoogle();
connectWithFacebook();

// Limit the rate of requests for every route
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests by IP every 15 minutes
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
// Middleware applied to every route beginning with "/api"
app.use("/api/", apiLimiter);

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

// Production setup for static files
if (process.env.NODE_ENV === "production") {
  // Handle client-side routing for SPA before static files
  app.use(history({ verbose: true }));
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Serve the SPA's index.html for unknown routes server side
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
