import { db } from "../utils/connect.js";
import bcrypt from "bcryptjs";

export const register = (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  //* First, check if user is in database
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [email], (err, data) => {
    if (err) return res.status(500).json({ error: err });

    if (data.length)
      return res.status(409).json({ message: "User already exists !" });

    //* If not, create new user
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password, salt);

    // Store new user in database
    const q =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`) VALUES (?)";
    const values = [firstName, lastName, email, hashedPswd];

    db.query(q, [values], (err, _data) => {
      if (err) return res.status(500).json({ error: err });

      return res.status(200).json({ message: "New user created !" });
    });
  });
};

export const login = (req, res) => {
  //TODO
};

export const logout = (req, res) => {
  //TODO
};
