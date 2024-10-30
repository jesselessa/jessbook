import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.accessToken;
  
  if (!token)
    return res.status(401).json({ message: "User not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    //! decoded = token decoded payload after successful authentication
    if (error)
      return res
        .status(401)
        .json({ message: "Invalid or expired token", error: error });

    req.user = decoded; // Store token info in req.user //TODO

    next(); // Next step (protected route)
  });
};
