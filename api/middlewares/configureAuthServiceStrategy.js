/*
 * configureAuthServiceStrategy.js defines and configures how our server will interact with third-party authentication services like Google and Facebook, by using the Passport.js library

 * Its sole function is to call passport.use() to initialize and register the authentication 'strategies'

 * A 'strategy' is the method or mechanism that Passport uses to verify a user's identity
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { findOrCreateUser } from "../utils/findOrCreateUser.js";

//! The callbackURL is the URL to which Google/Facebook sends the authorization code. It must be our server.

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
        findOrCreateUser(email, firstName, lastName, done, "Google");
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

        findOrCreateUser(email, firstName, lastName, done, "Facebook");
      }
    )
  );
};
