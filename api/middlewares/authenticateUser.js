import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: "User not logged in." });

  jwt.verify(token, process.env.SECRET, (error, userInfo) => {
    if (error)
      return res
        .status(401)
        .json({ message: "Invalid or expired token.", error: error });

    // Store user information in the request object
    req.userInfo = userInfo;

    next();
  });
};
