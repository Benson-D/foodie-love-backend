import { Request } from "express";
import passport from "passport";
import { Strategy as JWTStrategy, VerifiedCallback } from "passport-jwt";
import { SECRET_KEY } from "./general";
import UserModel from "../models/UserModel";

const cookieExtractor = (req: Request) => {
  let token = null;

  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }

  return token;
};

async function verifyJWT(payload: { id: string }, done: VerifiedCallback) {
  try {
    const user = await UserModel.findById(payload.id as string);

    if (!user) return done(null, false);

    return done(null, user);
  } catch (err) {
    done(err, false);
  }
}

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: SECRET_KEY,
    },
    verifyJWT,
  ),
);
