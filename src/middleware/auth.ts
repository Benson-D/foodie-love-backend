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

function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authorizedHeaders = req.headers;
    console.log(
      authorizedHeaders,
      "<=== headers",
      req,
      "<==== general request",
    );

    next();
  } catch (err) {
    next();
  }
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
  isUserAuthenticated,
  authenticateJWTPassport,
  ensureUserLoggedIn,
  authenticateUser,
};
