import { Router } from "express";
import {
  getAllRecipes,
  getIndividualRecipe,
  createRecipe,
  updateRecipe,
  uploadRecipeImage,
  deleteRecipe,
} from "../controller/recipeController";
import multer from "multer";
import { isUserAuthenticated } from "../middleware/auth";

const upload = multer({ dest: "uploads/" });
const router: Router = Router();

router.get("/", isUserAuthenticated, getAllRecipes);
router.get("/:id", getIndividualRecipe);

router.post("/", isUserAuthenticated, createRecipe);
router.post("/image", upload.single("recipeImage"), uploadRecipeImage);

router.patch("/:id", isUserAuthenticated, updateRecipe);

router.delete("/:id", isUserAuthenticated, deleteRecipe);

export default router;
