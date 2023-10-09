import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./general";
import UserModel from "../models/userModel";

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      const defaultUser = {
        googleId: profile.id,
        firstName: profile.name?.givenName ?? "",
        lastName: profile.name?.familyName ?? "",
        email: profile.emails?.[0].value ?? "",
        imageUrl: profile.photos?.[0].value ?? "",
      };

      const userData = await UserModel.findOrCreate(profile.id, defaultUser);

      done(null, userData);
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await UserModel.findById(id);

  done(null, user);
});
