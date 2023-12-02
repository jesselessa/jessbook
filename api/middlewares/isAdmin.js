import jwt from "jsonwebtoken";

export const isAdmin = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("User not logged in.");
  }

  jwt.verify(token, process.env.SECRET, (error, userInfo) => {
    if (error) {
      console.log(error);
      return res.status(403).json("Invalid token.");
    }

    if (userInfo.role !== "admin") {
      return res.status(403).json("Access denied.");
    }

    next();
  });
};
