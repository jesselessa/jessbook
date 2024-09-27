import { db } from "../utils/connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // 1 - Check if user is in database
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [email], (error, data) => {
    if (error)
      return res
        .status(500)
        .json("An unknown error has occured. Please, try again later.");

    if (data.length > 0) return res.status(409).json("User already exists.");

    // 2 - If no user, create a new one
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPswd = bcrypt.hashSync(password, salt);

    // Store new user in database
    const q =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `password`, `role`) VALUES (?)";

    const values = [firstName, lastName, email, hashedPswd, "user"];

    db.query(q, [values], (error, _data) => {
      if (error)
        return res
          .status(500)
          .json("An unknown error has occured. Please, try again later.");

      return res.status(200).json("New user created.");
    });
  });
};

export const login = (req, res) => {
  // 1 - Check user mail
  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (error, data) => {
    if (error)
      return res
        .status(500)
        .json("An unknown error has occured. Please, try again later.");

    if (data.length === 0)
      return res.status(404).json("Invalid email or password.");

    // 2 - Check password
    const checkPswd = bcrypt.compareSync(req.body.password, data[0].password); 

    if (!checkPswd) return res.status(400).json("Invalid email or password.");

    // 3 - Generate token with jsonwebtoken
    const secretKey = process.env.SECRET;
    let token;

    if (data[0].role === "admin") {
      token = jwt.sign(
        { id: data[0].id, role: "admin" },
        secretKey
        // { expiresIn: "30d" }
      );
    } else {
      token = jwt.sign(
        { id: data[0].id, role: "user" },
        secretKey
        // { expiresIn: "30d" }
      );
    }

    // 4 - Store token in cookie and send it in response if login is successful
    const { password, ...others } = data[0];

    return res
      .cookie("accessToken", token, { httpOnly: true }) // Random JS script can't access our cookie
      .status(200)
      .json(others);
  });
};

export const logout = (_req, res) => {
  return res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none", // Because API and React app port numbers are not the same
    })
    .status(200)
    .json("User logged out.");
};
