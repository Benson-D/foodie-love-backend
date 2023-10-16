import passport from "passport";
import {
  Strategy as JWTStrategy,
  StrategyOptions,
  ExtractJwt,
  VerifiedCallback,
} from "passport-jwt";
import { SECRET_KEY } from "./general";
import UserModel from "../models/userModel";

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY,
};

async function verifyJWT(payload: { sub: string }, done: VerifiedCallback) {
  console.log(payload, "<==== received payload");
  try {
    const user = await UserModel.findById(payload.sub as string);
    if (!user) {
      done(null, false);
    }

    return done(null, user);
  } catch (err) {
    done(err, false);
  }
}

passport.use(new JWTStrategy(jwtOptions, verifyJWT));
