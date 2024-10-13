import passport from "passport";
import { db } from "./connect.js";

//! Keep session management if necessary, but because we use authentication based on JWT, not needed

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  const q = `SELECT * FROM users WHERE id = ?`;
  db.query(q, [id], (error, data) => {
    if (error) return done(error);
    done(null, data[0]);
  });
});
