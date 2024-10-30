import jwt from "jsonwebtoken";

export const isAdmin = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token)
    return res.status(401).json({ message: "User not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error)
      return res.status(401).json({ message: "Invalid or expired token" });

    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    req.user = decoded; //TODO

    next();
  });
};
