import UserModel from "../models/userModel";
import { createToken } from "../utils/token";
import { Router } from "express";

const router: Router = Router();

/**
 * POST / { user }  => { user, token }
 *
 * Adds a new user and returns the newly created user and an authentication token for them:
 * { user: { username, firstName, lastName, email, isAdmin }, token }
 **/
router.post("/", async function (req, res) {
  const user = await UserModel.register(req.body);
  const token = createToken(user);

  return res.status(201).json({ user, token });
});

/**
 * GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 * Returns list of all users.
 **/
router.get("/", async function (req, res, next) {
  try {
    const users = UserModel.findAll();
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

export default router;
