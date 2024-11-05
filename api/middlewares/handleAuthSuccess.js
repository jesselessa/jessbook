import jwt from "jsonwebtoken";

export const handleAuthSuccess = (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: "Authentication failed." });

  // Generate a secret key
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey)
    return res.status(500).json({ message: "Missing JWT secret key" }); //! Error 500 because problem of configuration server side

  // Set JWT token payload depending on user role
  let token;

  try {
    if (req.user.role === "admin") {
      token = jwt.sign({ id: req.user.id, role: "admin" }, secretKey, {
        expiresIn: "7d",
      });
    } else {
      token = jwt.sign({ id: req.user.id, role: "user" }, secretKey, {
        expiresIn: "7d",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while generating JWT token.",
      error: error,
    });
  }

  res
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(201)
    // Redirection to frontend after authentication
    .redirect(`${process.env.CLIENT_URL}/login/auth-provider/callback`);
};
