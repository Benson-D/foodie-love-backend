import { Router } from "express";
import RecipeController from "../controller/RecipeController";
import multer from "multer";
import {
  isUserAuthenticated,
  authenticateJWTPassport,
} from "../middleware/auth";

const upload = multer({ dest: "uploads/" });
const router: Router = Router();

router.get("/", authenticateJWTPassport, RecipeController.getAllRecipes);
router.get("/:id", isUserAuthenticated, RecipeController.getIndividualRecipe);

router.post(
  "/",
  isUserAuthenticated,
  RecipeController.createRecipeAndIngredients,
);
router.post(
  "/image",
  upload.single("recipeImage"),
  RecipeController.uploadRecipeImage,
);

router.patch("/:id", isUserAuthenticated, RecipeController.updateRecipe);

router.delete("/:id", isUserAuthenticated, RecipeController.deleteRecipe);

export default router;
