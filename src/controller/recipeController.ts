import { Request, Response } from "express";
import { validate } from "jsonschema";
import * as recipeSearchSchema from "../schemas/recipeSearch.json";
import * as recipeNewSchema from "../schemas/recipeNew.json";
import RecipeModel from "../models/recipeModel";
import { BadRequestError } from "../utils/expressError";
import { uploadImageToS3 } from "../aws/s3";
import { unlink } from "fs/promises";

interface IngredientItems {
  amount: number;
  measurementId: number | undefined;
  measurement: string | undefined;
  ingredientId: number;
  ingredient: string;
}

interface GetRecipe {
  id: number;
  recipeName: string;
  prepTime: string;
  cookingTime: string;
  recipeImage: string;
  mealType: string;
  instructions: { description: string }[];
  amount: number;
  measurementId: number | undefined;
  measurement: string | undefined;
  ingredientId: number;
  ingredient: string;
}

interface FormattedRecipe {
  id: number;
  recipeName: string;
  prepTime: string;
  cookingTime: string;
  recipeImage: string | undefined;
  mealType: string;
  instructions: { description: string }[];
  ingredients: IngredientItems[];
}

async function createRecipe(req: Request, res: Response) {
  const validator = validate(req.body, recipeNewSchema);

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    console.log(errs, "error");
    return res.status(400).json({ errors: errs });
  }

  const recipe = await RecipeModel.insertRecipe(req.body);

  const { ingredientList } = req.body;
  const recipeIngredients = JSON.parse(ingredientList);

  const responseIngredients = await Promise.all(
    recipeIngredients.map(
      async (list: {
        amount: string;
        measurement: string;
        ingredient: string;
      }) => await _ingredientBuilder(recipe.id, list),
    ),
  );

  const output = {
    id: recipe.id,
    ingredients: [...responseIngredients],
  };

  return res.status(201).json({ recipe: output });
}

/**
 * Gets a list of recipes
 *
 * @param {Request} req - The HTTP request object containing query parameters.
 * @param {Response} res - The HTTP response object to send the recipe list.
 * @returns
 */
async function getAllRecipes(req: Request, res: Response) {
  const recipeQuery = req.query as Record<string, string | number>;

  if (recipeQuery?.skip) {
    recipeQuery.skip = Number(recipeQuery.skip);
  } else {
    recipeQuery["skip"] = 0;
  }

  if (recipeQuery?.cookingTime) {
    recipeQuery.cookingTime = Number(recipeQuery.cookingTime);
  }

  // Validate the query parameters against a predefined schema.
  const validator = validate(recipeQuery, recipeSearchSchema);

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    return res.status(400).json({ errors: errs });
  }

  try {
    const recipes = await RecipeModel.findAll(recipeQuery);
    return res.json({ recipes });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getIndividualRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);

  const recipe: GetRecipe[] = await RecipeModel.findRecipeById(recipeId);
  const formattedRecipe = _formatRecipe(recipe);
  return res.json({ recipe: formattedRecipe });
}

async function uploadRecipeImage(req: Request, res: Response) {
  const image = req.file || "";
  let urlResponse = "";

  if (image) {
    urlResponse = await uploadImageToS3(image);
    await unlink(image.path);
  }

  return res.status(201).json({ url: urlResponse || "" });
}

async function updateRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);

  const recipe = await RecipeModel.updateRecipeWithIngredients(
    recipeId,
    req.body,
  );
  return res.json({ recipe });
}

async function deleteRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);

  await RecipeModel.removeRecipe(recipeId);
  return res.json({ deleted: req.params.id });
}

/******************************* Helpers **************************************/

/**
 * Given the recipe data, return the recipe for readable format.
 *
 * @param {GetRecipe[]} recipe
 * @returns {FormattedRecipe}
 * { id: 0,
 *   recipeName: "test recipe",
 *   prepTime: 1,
 *   cookingTime: 2,
 *   image: null,
 *   ingredients: [{
 *       "amount": "4.0",
 *       "measurement": "cup",
 *       "ingredient": "testIngredient"
 *   }, ...]};
 */
function _formatRecipe(recipe: GetRecipe[]): FormattedRecipe {
  const recipeList: FormattedRecipe = {
    id: 0,
    recipeName: "",
    prepTime: "",
    cookingTime: "",
    recipeImage: "",
    mealType: "",
    instructions: [],
    ingredients: [],
  };

  for (const item of recipe) {
    const minuteStatement = Number(item.prepTime) > 1 ? "minutes" : "minute";

    recipeList.id = item.id;
    recipeList.recipeName = item.recipeName;
    recipeList.prepTime = `${item.prepTime} ${minuteStatement}`;
    recipeList.cookingTime = `${item.cookingTime} minutes`;
    recipeList.recipeImage = item?.recipeImage;
    recipeList.mealType = item.mealType;
    recipeList.instructions = item.instructions;

    const ingredientList: IngredientItems = {
      amount: item.amount,
      measurementId: item?.measurementId,
      measurement: item?.measurement,
      ingredientId: item.ingredientId,
      ingredient: item.ingredient,
    };

    if (recipeList.ingredients) {
      recipeList.ingredients.push(ingredientList);
    } else {
      recipeList.ingredients = [ingredientList];
    }
  }

  return recipeList;
}

async function _ingredientBuilder(
  recipeId: number,
  recipeItems: { amount: string; measurement: string; ingredient: string },
): Promise<{
  recipeId: number;
  measurementId?: number | undefined;
  ingredientId: number;
  amount: number;
}> {
  if (typeof recipeId !== "number") {
    throw new BadRequestError("Not a valid id");
  }

  const { amount, measurement, ingredient } = recipeItems;

  const measurementId = await insertMeasurement(measurement);
  const ingredientId = await insertIngredient(ingredient);
  const parsedAmount = parseRecipeAmount(amount);

  const recipeData = {
    recipeId: recipeId,
    measurementId: measurementId,
    ingredientId: ingredientId,
    amount: parsedAmount,
  };

  const result = await RecipeModel.insertRecipeIngredients(recipeData);
  return result;
}

function parseRecipeAmount(amount: string): number {
  let parsedAmount = amount;

  if (amount.includes("/")) {
    parsedAmount = amount
      .split("/")
      .map(Number)
      .reduce((total, amount) => total / amount)
      .toString();
  }

  return parseFloat(parsedAmount);
}

async function insertIngredient(ingredient: string): Promise<number> {
  const response = await RecipeModel.insertIngredients(ingredient);
  return response.id;
}

async function insertMeasurement(
  measurement: string,
): Promise<number | undefined> {
  const response = await RecipeModel.insertMeasurements(measurement);
  return response?.id ?? undefined;
}

export {
  getAllRecipes,
  getIndividualRecipe,
  createRecipe,
  updateRecipe,
  uploadRecipeImage,
  deleteRecipe,
};
