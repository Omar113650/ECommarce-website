import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import { GoogleUser } from "../models/LoginGoogle.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await GoogleUser.findOne({ googleId: profile.id });

        if (!user) {
          user = await GoogleUser.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName,
            picture: profile.photos?.[0]?.value || "",
          });
        }
        return done(null, user); // مهم: رجع user من DB مش profile
      } catch (error) {
        console.error("Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await GoogleUser.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;

