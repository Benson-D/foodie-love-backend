import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./general";
import UserModel from "../models/UserModel";

async function verifyGoogleOAuth20(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback,
) {
  const defaultUser = {
    googleId: profile.id,
    firstName: profile.name?.givenName ?? "",
    lastName: profile.name?.familyName ?? "",
    email: profile.emails?.[0].value ?? "",
    imageUrl: profile.photos?.[0].value ?? "",
  };

  const userData = await UserModel.findOrCreateGoogleUser(
    profile.id,
    defaultUser,
  );

  console.log(userData, "<=== verified oauth2 for passport");
  done(null, userData);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
      //callbackURL: "http://localhost:3001/auth/google/redirect"
    },
    verifyGoogleOAuth20,
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await UserModel.findById(id);

  console.log(user, "<==== deserialized user for passport");
  done(null, user);
});
