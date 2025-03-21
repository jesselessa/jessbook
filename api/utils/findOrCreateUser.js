import { db } from "./connect.js";

export const findOrCreateUser = (
  email,
  firstName,
  lastName,
  done,
  fromAuthProvider
) => {
  // Check if user exists in database
  const selectQuery = "SELECT * FROM users WHERE email = ?";
  db.query(selectQuery, [email], (err, data) => {
    if (err) return done(err);

    if (data.length > 0) return done(null, data[0]);

    const insertQuery =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `fromAuthProvider`, `role`) VALUES (?)";
    const values = [firstName, lastName, email, fromAuthProvider, "user"];

    const insertRelationshipQuery =
      "INSERT INTO relationships (followerId, followedId) VALUES (?)";

    // Insert new user
    db.query(insertQuery, [values], (insertErr, insertData) => {
      if (insertErr) return done(insertErr);

      // Insert admin as first relationship followed by new user
      db.query(
        insertRelationshipQuery,
        [[insertData.insertId, 1]],
        (insertErr, insertData) => {
          if (insertErr) return done(insertErr);
        }
      );

      const newUser = {
        id: insertData.insertId,
        firstName,
        lastName,
        email,
        fromAuthProvider,
        role: "user",
      };

      return done(null, newUser);
    });
  });
};
