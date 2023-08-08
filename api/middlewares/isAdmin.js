import jwt from "jsonwebtoken";

export const isAdmin = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("User not logged in.");
  }

  jwt.verify(token, process.env.REACT_APP_SECRET, (error, userInfo) => {
    if (error) {
      return res.status(403).json("Invalid token.");
    }

    if (userInfo.role !== "admin") {
      return res.status(403).json("Access denied.");
    }

    next();
  });
};
