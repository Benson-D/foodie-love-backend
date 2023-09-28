import { Router, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { createToken } from "../utils/token";
import { REFRESH_TIME, SECRET_KEY } from "../configs/general";
import { validate } from "jsonschema";
import authToken from "../schemas/authToken.json";
import authRegister from "../schemas/authRegister.json";
import UserModel from "../models/userModel";
import passport from "passport";

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
  const token = createToken(user);
  const refreshToken = createToken(user, REFRESH_TIME);

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
  const token = createToken(newUser);
  const refreshToken = createToken(newUser, REFRESH_TIME);

  res.cookie("jwt", refreshToken, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(201).json({ message: "Register Successful!", token });
});

router.post("/refresh", async function (req: Request, res: Response) {
  const { refreshToken } = req.cookies;

  // Verify the refresh token
  try {
    jwt.verify(
      refreshToken,
      SECRET_KEY as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (err: VerifyErrors | null, decoded: any | undefined) => {
        if (err || !decoded.username) {
          return res.status(401).json({ errors: "Invalid refresh token" });
        }

        const user = await UserModel.get(decoded.username as string);
        const token = createToken(user);
        return res.status(201).json({ message: "New Token Acquired!", token });
      },
    );
  } catch (err) {
    return res.status(401).json({ errors: "Invalid refresh token" });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.send("This is the callback route");
});

export default router;
