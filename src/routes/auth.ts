import { Router, Request, Response } from "express";
import { createToken } from "../utils/token";
import { REFRESH_TIME } from "../configs/general";
import { validate } from "jsonschema";
import authToken from "../schemas/authToken.json";
import authRegister from "../schemas/authRegister.json";
import UserModel from "../models/userModel";
import passport from "passport";
import AuthController from "../controller/AuthController";

const router: Router = Router();

/**
 * POST /auth/token:  { username, password } => { token }
 * Returns JWT token which can be used to authenticate further requests.
 */
router.post("/token", async function (req: Request, res: Response) {
  const requestBody = req.body;
  const validator = validate(requestBody, authToken);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    return res.status(400).json({ errors: errs });
  }

  const { username, password } = req.body;
  const user = await UserModel.authenticate(username, password);

  const initialUser = {
    id: "",
    username: user.username,
    isAdmin: user.isAdmin,
  };

  const token = createToken(initialUser);
  const refreshToken = createToken(initialUser, REFRESH_TIME);

  res.cookie("jwt", refreshToken, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(201).json({ token });
});

/**
 * POST /auth/register:   { user } => { token }
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 */
router.post("/register", async function (req: Request, res: Response) {
  const requestBody = req.body;
  const validator = validate(requestBody, authRegister);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    return res.status(400).json({ errors: errs });
  }

  const newUser = await UserModel.register({ ...requestBody, isAdmin: false });

  const initialUser = {
    id: "",
    username: newUser.username,
    isAdmin: false,
  };

  const token = createToken(initialUser);
  const refreshToken = createToken(initialUser, REFRESH_TIME);

  res.cookie("jwt", refreshToken, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(201).json({ message: "Register Successful!", token });
});

router.post("/refresh", AuthController.verifyRefreshToken);

router.get(
  "/google",
  passport.authenticate("google", {
    accessType: "offline",
    prompt: "consent",
    scope: ["email", "profile"],
  }),
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureMessage: "Cannot login to Google, please try again later!",
  }),
  AuthController.verifyGoogleOAuth2,
);

router.get("/logout", AuthController.userLogout);

export default router;
