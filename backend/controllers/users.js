import { db } from "../utils/connect.js";

export const getAllUsers = (_req, res) => {
  const q = "SELECT * FROM users";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
    return res.status(200).json(data);
  });
};

// export const getUser = (req, res) => {
//   const q = "SELECT FROM users WHERE id=?"; // Value hidden for security reasons
//   const userId = req.params.id;

//   db.query(q, [userId], (err, data) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ error: err });
//     }
//     return res.status(200).json(data);
//   });
// };
