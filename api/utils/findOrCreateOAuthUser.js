import { db } from "../utils/connect.js";

export const findOrCreateOAuthUser = (
  email,
  firstName,
  lastName,
  done,
  fromOAuthProvider
) => {
  const selectQuery = "SELECT * FROM users WHERE email = ?";
  db.query(selectQuery, [email], (err, data) => {
    if (err) return done(err);

    if (data.length > 0) return done(null, data[0]);

    // Insert new user
    const insertQuery =
      "INSERT INTO users (firstName, lastName, email, role, fromGoogle) VALUES (?)";
    const values = [firstName, lastName, email, "user", 1]; //! MySQL doesn't support Boolean, alternative : 1 = true and 0 = false

    db.query(insertQuery, [values], (insertErr, insertData) => {
      if (insertErr) return done(insertErr);

      const newUser = {
        id: insertData.insertId,
        firstName,
        lastName,
        email,
        fromGoogle: 1,
        role: "user",
      };
      return done(null, newUser);
    });
  });
};
