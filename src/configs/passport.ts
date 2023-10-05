import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./general";
import UserModel from "../models/userModel";

type UserDocument = {
  username: string;
  googleId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  isAdmin: boolean;
};

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, cb) => {
      const defaultUser = {
        googleId: profile.id,
        firstName: profile.name?.givenName ?? "",
        lastName: profile.name?.familyName ?? "",
        email: profile.emails?.[0].value ?? "",
        imageUrl: profile.photos?.[0].value ?? "",
      };

      const userData = await UserModel.findOrCreate(profile.id, defaultUser);
      console.log(userData, "data to store in db");
      cb(null, userData);
    },
  ),
);

passport.serializeUser((user, cb) => {
  console.log(user, "serialized user");
  cb(null, user);
});

passport.deserializeUser(async (user: UserDocument, cb) => {
  console.log(user, "deserialized user");

  const googleId = user.googleId as string;

  const responseUser = await UserModel.findById(googleId);
  cb(null, responseUser);
});
