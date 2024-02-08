import { type Request, type Response } from "express";
import { validate } from "jsonschema";
import * as recipeSearchSchema from "../schemas/recipeSearch.json";
import * as recipeNewSchema from "../schemas/recipeNew.json";
import RecipeModel from "../models/RecipeModel";
import { uploadImageToS3 } from "../aws/s3";
import { unlink } from "fs/promises";

export default class RecipeController {
  /**
   * Validates and retrieves all or filtered recipes
   * @param req
   * @param res
   * @returns
   */
  public static async getAllRecipes(req: Request, res: Response) {
    const recipeSearchParams = req.query as Record<string, string | number>;

    recipeSearchParams.skip = Number(recipeSearchParams.skip) || 0;

    if (recipeSearchParams?.cookingTime) {
      recipeSearchParams.cookingTime = Number(recipeSearchParams.cookingTime);
    }

    const validator = validate(recipeSearchParams, recipeSearchSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      return res.status(400).json({ errors: errs });
    }

    try {
      const userId = recipeSearchParams?.userId.toString() ?? "0";
      const recipes = await RecipeModel.findAll(
        recipeSearchParams,
        userId,
        Number(recipeSearchParams.skip),
      );

      return res.json({ recipes });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error: recipes" });
    }
  }

  /**
   * Based on recipe id finds and returns the individual recipe.
   * @param req
   * @param res
   * @returns
   */
  public static async getIndividualRecipe(req: Request, res: Response) {
    const recipeId = req.params.id;

    try {
      const foundRecipe = await RecipeModel.findRecipeById(recipeId);
      return res.json(foundRecipe);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error: recipes" });
    }
  }

  public static async getAllMeasurements(req: Request, res: Response) {
    const foundMeasurements = await RecipeModel.findAllMeasurementUnits();
    const formattedMeasurements = foundMeasurements
      .map(({ description }) => {
        return { value: description, label: description };
      })
      .filter(({ value }) => value !== "");

    const measurementOutput = [
      { value: "", label: "none" },
      ...formattedMeasurements,
    ];

    return res.json(measurementOutput);
  }

  /**
   * Validates and creates a recipe and recipe ingredients to the db.
   * @param req
   * @param res
   * @returns
   */
  public static async createRecipeAndIngredients(req: Request, res: Response) {
    const creationBody = req.body;
    creationBody.userId = req.user?.id ?? req.body?.userId;

    const validator = validate(creationBody, recipeNewSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      return res.status(400).json({ errors: errs });
    }

    try {
      const recipe = await RecipeModel.createRecipe(creationBody);

      const { ingredientList } = req.body;

      const responseIngredients = await Promise.all(
        ingredientList.map(
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
    } catch (err) {
      console.error("An error occurred:", err);
      return res
        .status(500)
        .json({ err: "An error occurred while creating the recipe." });
    }
  }

  /**
   * Uploads an image to s3 bucket returns url if valid image.
   * @param req
   * @param res
   * @returns
   */
  public static async uploadRecipeImage(req: Request, res: Response) {
    const image = req.file || "";
    let urlResponse = "";

    if (image) {
      urlResponse = await uploadImageToS3(image);
      await unlink(image.path);
    }

    return res.status(201).json({ url: urlResponse || "" });
  }

  /**
   * Updates a current recipe to the db.
   * @param req
   * @param res
   * @returns
   */
  public static async updateRecipeWithIngredients(req: Request, res: Response) {
    try {
      const recipe = await RecipeModel.updateRecipe(req.body.id, req.body);

      const foundRecipeIngredients =
        await RecipeModel.findAllRecipeIngredientsById(req.body.id);
      foundRecipeIngredients.map(async (recipe) => {
        await RecipeModel.removeRecipeIngredients(recipe);
      });

      const responseIngredients = await Promise.all(
        req.body.ingredientList.map(
          async (list: {
            amount: string;
            measurement: string;
            ingredient: string;
          }) => await _ingredientBuilder(recipe.id, list),
        ),
      );

      return res.json({ id: recipe.id, ingredients: [...responseIngredients] });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ err: "An error occurred while updating the recipe." });
    }
  }

  /**
   * Deletes a recipe from the db.
   * @param req
   * @param res
   * @returns
   */
  public static async deleteRecipe(req: Request, res: Response) {
    const deletedRecipe = await RecipeModel.removeRecipe(req.params.id);
    return res.json({ deleted: deletedRecipe });
  }
}

/******************************* Helpers **************************************/

async function _ingredientBuilder(
  recipeId: string,
  recipeItems: { amount: string; measurement: string; ingredient: string },
) {
  const { amount, measurement, ingredient } = recipeItems;

  const measurementId = await insertMeasurementAndReturnId(measurement);
  const ingredientId = await insertIngredientAndReturnId(ingredient);
  const parsedAmount = parseRecipeAmount(amount);

  const recipeData = {
    recipeId: recipeId,
    measurementId: measurementId,
    ingredientId: ingredientId,
    amount: parsedAmount,
  };

  const result = await RecipeModel.createRecipeIngredient(recipeData);
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

async function insertIngredientAndReturnId(
  ingredient: string,
): Promise<string> {
  const response = await RecipeModel.findOrCreateIngredient(ingredient);
  return response.id;
}

async function insertMeasurementAndReturnId(
  measurement: string,
): Promise<string | undefined> {
  const response = await RecipeModel.findOrCreateMeasurement(measurement);
  return response?.id ?? undefined;
}
