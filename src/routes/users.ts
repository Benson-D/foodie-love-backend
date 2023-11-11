import { Router, Request, Response } from "express";
import { isUserAuthenticated } from "../middleware/auth";
import UserController from "../controller/UserController";

const router: Router = Router();

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
