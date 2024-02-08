import { Router } from "express";
import RecipeController from "../controller/RecipeController";
import UserController from "../controller/UserController";
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
router.post("/add-favorite", UserController.addOrDeleteFavoriteRecipe);

router.patch("/", RecipeController.updateRecipeWithIngredients);

router.delete("/remove-favorite", UserController.addOrDeleteFavoriteRecipe);
router.delete("/:id", RecipeController.deleteRecipe);

export default router;
