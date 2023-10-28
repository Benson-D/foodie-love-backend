import { Router, Request, Response } from "express";
//import UserModel from "../models/userModel";
import { isUserAuthenticated } from "../middleware/auth";
import UserController from "../controller/UserController";
//import { createToken } from "../utils/token";

const router: Router = Router();

/**
 * POST / { user }  => { user, token }
 *
 * Adds a new user and returns the newly created user and an authentication token for them:
 * { user: { username, firstName, lastName, email, isAdmin }, token }
 **/
// router.post("/", async function (req, res) {
//   const user = await UserModel.register(req.body);
//   const token = createToken(user);

//   return res.status(201).json({ user, token });
// });

/**
 * GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 * Returns list of all users.
 **/
// router.get("/", isUserAuthenticated, async function (req, res, next) {
//   try {
//     const users = await UserModel.findAll();
//     return res.json({ users });
//   } catch (err) {
//     return next(err);
//   }
// });

/**
 * GET /[username] => { user }
 * Returns a single user and their data/
 **/
// router.get("/:username", isUserAuthenticated, async function (req, res, next) {
//   try {
//     const user = UserModel.get(req.params.username);
//     return res.json({ user });
//   } catch (err) {
//     return next(err);
//   }
// });

router.get("/auth/user", isUserAuthenticated, (req: Request, res: Response) => {
  return res.json(req.user);
});

router.post(
  "/add-favorite",
  isUserAuthenticated,
  UserController.addOrDeleteFavoriteRecipe,
);
router.delete(
  "/remove-favorite",
  isUserAuthenticated,
  UserController.addOrDeleteFavoriteRecipe,
);

export default router;
