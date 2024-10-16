import jwt from "jsonwebtoken";

// Handle redirection and creation of JWT token after connection
export const handleAuthSuccess = (req, res) => {
  // Check if user is attached to Passport request
  if (!req.user) {
    return res.status(401).json({ message: "Authentication failed." });
  }

  // Generate token from user ID
  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign({ id: req.user.id }, secretKey, {
    expiresIn: "7d",
  });

  // Send token in a secured cookie
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Redirect user to frontend
  res.redirect(`${process.env.CLIENT_URL}`);
};
