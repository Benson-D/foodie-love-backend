import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UnauthorizedError } from "../utils/expressError";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/general";

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;

  console.log(cookies, "request cookies");

  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

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
  const sessionData = req.session;

  if (!sessionData!.user && !sessionData!.user?.id) {
    res.status(401).send("You must login first!");
  } else {
    next();
  }
}

export {
  authenticateJWT,
  isUserAuthenticated,
  authenticateJWTPassport,
  ensureUserLoggedIn,
};
