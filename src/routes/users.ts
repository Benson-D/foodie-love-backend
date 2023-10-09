import { Router, Request, Response } from "express";
import UserModel from "../models/userModel";
import { isUserAuthenticated } from "../middleware/auth";
import { createToken } from "../utils/token";

const router: Router = Router();

/**
 * POST / { user }  => { user, token }
 *
 * Adds a new user and returns the newly created user and an authentication token for them:
 * { user: { username, firstName, lastName, email, isAdmin }, token }
 **/
router.post("/", async function (req, res) {
  console.log("this route is actually being called");

  const user = await UserModel.register(req.body);
  const token = createToken(user);

  return res.status(201).json({ user, token });
});

/**
 * GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 * Returns list of all users.
 **/
router.get("/", async function (req, res, next) {
  console.log("this route is actually being called");

  try {
    const users = await UserModel.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /[username] => { user }
 * Returns a single user and their data/
 **/
router.get("/:username", async function (req, res, next) {
  try {
    const user = UserModel.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.get("/auth/user", isUserAuthenticated, (req: Request, res: Response) => {
  return res.json(req.user);
});

export default router;
