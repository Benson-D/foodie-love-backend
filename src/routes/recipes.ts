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

const upload = multer({ dest: "uploads/" });
const router: Router = Router();

router.get("/", getAllRecipes);
router.get("/:id", getIndividualRecipe);

router.post("/", createRecipe);
router.post("/image", upload.single("recipeImage"), uploadRecipeImage);

router.patch("/:id", updateRecipe);

router.delete("/:id", deleteRecipe);

export default router;
