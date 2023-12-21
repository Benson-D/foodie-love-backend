import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UnauthorizedError } from "../utils/expressError";

function authenticateJWTPassport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  passport.authenticate(
    "jwt-access",
    (err: unknown, user: Express.User | false | null) => {
      if (!user) {
        return next(null);
      }

      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = user; // Store user information in the request object for later use
      return next();
    },
  )(req, res, next);
}

function ensureUserLoggedIn(req: Response, res: Response, next: NextFunction) {
  passport.authenticate(
    "jwt-access",
    (err: unknown, user: Express.User | false | null) => {
      if (err || !user) throw new UnauthorizedError();
      next();
    },
  )(req, res, next);
}

function isUserAuthenticated(req: Request, res: Response, next: NextFunction) {
  console.log(
    req.user,
    "<=== validate req users for middleware",
    req,
    "<==== general request",
  );

  if (!req.user) {
    res.status(401).send("You must login first!");
  } else {
    next();
  }
}

export { isUserAuthenticated, authenticateJWTPassport, ensureUserLoggedIn };
