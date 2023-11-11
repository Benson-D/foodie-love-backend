import { Router } from "express";
import authRoutes from "./auth";
import usersRoutes from "./users";
import recipeRoutes from "./recipes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/user", usersRoutes);
router.use("/recipes", recipeRoutes);

export default router;
