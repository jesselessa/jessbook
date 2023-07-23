import { db } from "../utils/connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  //* First, check if user is in database
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [email], (err, data) => {
    if (err) return res.status(500).json({ error: err });

    if (data.length)
      return res.status(409).json({ message: "User already exists." });

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

      return res.status(200).json({ message: "New user created." });
    });
  });
};

export const login = (req, res) => {
  //TODO - Reset password function
  //* First, check user's mail
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json({ error: err });

    if (data.length === 0)
      return res.status(404).json({ message: "User not found." });

    //* If mail OK, check password
    const checkPswd = bcrypt.compareSync(req.body.password, data[0].password); // data[0] because SELECT * query returns an array => if user found by email, will return an array with one entry

    if (!checkPswd)
      return res.status(400).json({ error: "Invalid email or password." });

    //* Generate token with jsonwebtoken
    const secretKey = process.env.REACT_APP_SECRET;

    const token = jwt.sign(
      { id: data[0].id },
      secretKey
      // { expiresIn: "30d" }
    );

    //* Store token in cookie and send it in response in case of successful login
    const { password, ...others } = data[0]; // Distinguish "password" property from others

    return res
      .cookie("accessToken", token, { httpOnly: true }) // Random JS script can't access our cookie
      .status(200)
      .json(others); // Return user info except password
  });
};

export const logout = (_req, res) => {
  return res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none", // Because API and React app port numbers are not the same
    })
    .status(200)
    .json({ message: "User logged out." });
};
