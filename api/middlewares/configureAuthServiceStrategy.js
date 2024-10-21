import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { findOrCreateOAuthUser } from "../utils/findOrCreateOAuthUser.js";

//! When users log in via authentication providers such as Google or Facebook, their credentials (profile, email, etc.) are transmitted to our server. 'Strategies' are functions which define how to handle these data

// Configure Google strategy
export const connectWithGoogle = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/login/google/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0]?.value;
        const firstName = profile.name?.givenName || "Undefined";
        const lastName = profile.name?.familyName || "Undefined";
        // console.log("Google User Profile:", profile);

        // If not already present in database, create a new user
        findOrCreateOAuthUser(email, firstName, lastName, done, "Google");
      }
    )
  );
};

// Configure Facebook strategy
export const connectWithFacebook = () => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/login/facebook/callback`,
        profileFields: ["id", "emails", "name"], // Get required fields
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0]?.value;
        const firstName = profile.name?.givenName || "Undefined";
        const lastName = profile.name?.familyName || "Undefined";
        // console.log("Facebook User Profile:", profile);

        findOrCreateOAuthUser(email, firstName, lastName, done, "Facebook");
      }
    )
  );
};
