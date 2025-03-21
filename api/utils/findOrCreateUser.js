import { db, executeQuery } from "./connect.js";

export const findOrCreateUser = async (
  email,
  firstName,
  lastName,
  done,
  fromAuthProvider
) => {
  try {
    // Check if user exists in database
    const selectQuery = "SELECT * FROM users WHERE email = ?";
    const data = await executeQuery(selectQuery, [email]);

    if (data.length > 0) {
      return done(null, data[0]);
    }

    const insertQuery =
      "INSERT INTO users (`firstName`, `lastName`, `email`, `fromAuthProvider`, `role`) VALUES (?)";
    const values = [firstName, lastName, email, fromAuthProvider, "user"];

    const insertRelationshipQuery =
      "INSERT INTO relationships (followerId, followedId) VALUES (?)";

    // Insert new user
    const insertData = await executeQuery(insertQuery, [values]);

    // Insert admin as first relationship followed by new user
    await executeQuery(insertRelationshipQuery, [[insertData.insertId, 1]]);

    const newUser = {
      id: insertData.insertId,
      firstName,
      lastName,
      email,
      fromAuthProvider,
      role: "user",
    };

    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
};
