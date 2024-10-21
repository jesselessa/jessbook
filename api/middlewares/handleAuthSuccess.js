import jwt from "jsonwebtoken";

export const handleAuthSuccess = (req, res) => {
  if (!req.userInfo)
    return res.status(401).json({ message: "Authentication failed" });

  // Generate JWT token avec les informations de l'utilisateur
  const secretKey = process.env.JWT_SECRET;
  let token;

  // Set token content depending on user role
  if (req.userInfo.role === "admin") {
    token = jwt.sign({ id: req.userInfo.id, role: "admin" }, secretKey, {
      expiresIn: "7d", // After delay, invalid token : user must reconnect
    });
  } else {
    token = jwt.sign({ id: req.userInfo.id, role: "user" }, secretKey, {
      expiresIn: "7d",
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
    // Redirection to our frontend which handles connection with token
    .redirect(`${process.env.CLIENT_URL}/auth-provider/callback`);
};
