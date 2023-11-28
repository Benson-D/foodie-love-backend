import { Router } from "express";
import RecipeController from "../controller/RecipeController";
import multer from "multer";
import { isUserAuthenticated } from "../middleware/auth";

const upload = multer({ dest: "uploads/" });
const router: Router = Router();

router.get("/", isUserAuthenticated, RecipeController.getAllRecipes);
router.get("/measurements", RecipeController.getAllMeasurements);
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

router.patch(
  "/",
  isUserAuthenticated,
  RecipeController.updateRecipeWithIngredients,
);

router.delete("/:id", isUserAuthenticated, RecipeController.deleteRecipe);

export default router;
