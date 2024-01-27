import { Router } from "express";
import RecipeController from "../controller/RecipeController";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router: Router = Router();

router.get("/", RecipeController.getAllRecipes);
router.get("/measurements", RecipeController.getAllMeasurements);
router.get("/:id", RecipeController.getIndividualRecipe);

router.post("/", RecipeController.createRecipeAndIngredients);
router.post(
  "/image",
  upload.single("recipeImage"),
  RecipeController.uploadRecipeImage,
);

router.patch("/", RecipeController.updateRecipeWithIngredients);

router.delete("/:id", RecipeController.deleteRecipe);

export default router;
