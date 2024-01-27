import { Router, Request, Response } from "express";
import UserController from "../controller/UserController";

const router: Router = Router();

router.get("/auth/user", (req: Request, res: Response) => {
  return res.json(req.user);
});

router.post("/add-favorite", UserController.addOrDeleteFavoriteRecipe);

router.delete("/remove-favorite", UserController.addOrDeleteFavoriteRecipe);

export default router;
