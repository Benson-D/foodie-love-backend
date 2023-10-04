import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./general";

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, cb) => {
      const userData = {
        googleId: profile.id,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        email: profile.emails?.[0].value,
        image: profile.photos?.[0].value,
      };

      console.log(userData, "data to store in db");
      return cb(null, profile);
    },
  ),
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

type UserDocument = {
  id: string;
  username: string;
  email: string;
  googleId: string;
};

passport.deserializeUser(async (user, cb) => {
  cb(null, user as UserDocument);
});
