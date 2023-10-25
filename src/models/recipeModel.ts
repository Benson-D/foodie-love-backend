import db from "../configs/db";
import { prisma } from "../configs/prismaClient";
import { NotFoundError } from "../utils/expressError";
import { sqlForPartialUpdate } from "../utils/sql";

class RecipeModel {
  public static async findAll(
    searchFilters: {
      recipeName?: string;
      cookingTime?: number;
      mealType?: string;
    } = {},
    skip: number,
  ) {
    const { recipeName, cookingTime, mealType } = searchFilters;

    const recipes = await prisma.recipe.findMany({
      where: {
        AND: [
          recipeName ? { name: { contains: recipeName } } : {},
          cookingTime ? { cookingTime: { lte: cookingTime } } : {},
          mealType ? { mealType: mealType } : {},
        ],
      },
      select: {
        id: true,
        name: true,
        prepTime: true,
        cookingTime: true,
        recipeImage: true,
        mealType: true,
      },
      orderBy: {
        id: "asc",
      },
      skip: skip,
      take: 10,
    });

    return recipes;
  }

  /**
   * Retrieves a recipe id and returns data with associated ingredients.
   * @param recipeId
   * @returns
   */
  public static async findRecipeById(recipeId: string) {
    const foundRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          select: {
            ingredientId: true,
            ingredient: {
              select: {
                name: true,
              },
            },
            measurementUnitId: true,
            measurementUnit: {
              select: {
                description: true,
              },
            },
            amount: true,
          },
        },
      },
    });

    if (!foundRecipe) throw new NotFoundError(`Recipe not found: ${recipeId}`);

    return foundRecipe;
  }

  /**
   * Retrieves first item in row that matches the ingredient parameter,
   * if not found returns null.
   * @param ingredientName
   * @returns
   */
  public static async findIngredientByName(ingredientName: string) {
    const foundIngredient = await prisma.ingredient.findFirst({
      where: { name: ingredientName },
    });
    return foundIngredient;
  }

  /**
   * Retrieves ingredient, if not found adds to the db and returns new ingredient.
   * @param ingredientName
   * @returns
   */
  public static async findOrCreateIngredient(ingredientName: string) {
    const foundIngredient = await this.findIngredientByName(ingredientName);

    if (foundIngredient) {
      return foundIngredient;
    }

    const createIngredient = await prisma.ingredient.create({
      data: {
        name: ingredientName,
      },
    });

    return createIngredient;
  }

  /**
   * Retrieves measurement, if not found adds to the db and returns new measurement.
   * @param measurement
   * @returns
   */
  public static async findOrCreateMeasurement(measurement: string) {
    const foundMeasurement = await prisma.measurementUnit.findFirst({
      where: { description: measurement },
    });

    if (foundMeasurement) {
      return foundMeasurement;
    }

    const createMeasurement = await prisma.measurementUnit.create({
      data: {
        description: measurement,
      },
    });

    return createMeasurement;
  }

  /**
   * Creates an individual recipe and adds to db
   * @param recipeData
   * @param userId
   * @returns
   */
  public static async createRecipe(recipeData: {
    recipeName: string;
    prepTime?: number;
    cookingTime: number;
    recipeImage?: string;
    instructions: string;
    mealType?: string;
    userId: string;
  }) {
    const createRecipe = await prisma.recipe.create({
      data: {
        name: recipeData.recipeName,
        prepTime: recipeData.prepTime ?? null,
        cookingTime: recipeData.cookingTime,
        recipeImage: recipeData.recipeImage ?? null,
        instructions: recipeData.instructions,
        mealType: recipeData.mealType ?? null,
        createdBy: recipeData.userId,
      },
      select: {
        id: true,
      },
    });

    return createRecipe;
  }

  public static async createRecipeIngredient(recipeData: {
    recipeId: string;
    measurementId?: string;
    ingredientId: string;
    amount: number;
  }) {
    const createdRecipeIngredient = await prisma.recipeIngredient.create({
      data: {
        recipeId: recipeData.recipeId,
        ingredientId: recipeData.ingredientId,
        measurementUnitId: recipeData.measurementId ?? null,
        amount: recipeData.amount,
      },
    });

    return createdRecipeIngredient;
  }

  public static async removeRecipe(recipeId: string) {
    const deletedRecipe = await prisma.recipe.delete({
      where: {
        id: recipeId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!deletedRecipe) throw new NotFoundError(`No recipe: ${recipeId}`);

    return deletedRecipe;
  }

  /**
   * Update current recipe list based on data
   *
   * Partial Update -- data doesn't need all fields
   * Throws NotFoundError if recipe id not found.
   *
   * @param {Number} id
   * @param {Object} data
   * @returns
   */
  public static async updateRecipe(
    id: number,
    data: {
      recipeName: string;
      prepTime?: number;
      cookingTime?: number;
      recipeImage: string;
      mealType: string;
      instructions: string;
    },
  ): Promise<{ id: number; recipeName: string }> {
    const columnsToSql = {
      recipeName: "recipe_name",
      cookingTime: "cooking_time",
      prepTime: "prep_time",
      recipeImage: "recipe_image",
      mealType: "meal_type",
    };

    const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);
    const result = await db.query(
      `UPDATE recipes
             SET ${setCols}
             WHERE id = $${values.length + 1}
             RETURNING id, recipe_name AS "recipeName"`,
      [...values, id],
    );

    const recipe = result.rows[0];

    if (!recipe) throw new NotFoundError(`No recipe: ${id}`);

    return recipe;
  }

  /**
   * Upate recipe Ingredient List
   *
   * Partial Update -- data doesn't need all fields
   * Throws NotFoundError if recipe list id not found.
   * @param {*} id
   * @param {*} data
   * @returns
   */
  public static async updateRecipeIngredients(
    id: number,
    data: {
      amount: number;
      measurementId?: number;
      measurement?: string;
      ingredientId: number;
      ingredient: string;
    },
  ) {
    const columnsToSql = {
      recipeId: "recipe_id",
      measurementId: "measurement_id",
      ingredientId: "ingredient_id",
    };

    const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);

    const result = await db.query(
      `UPDATE recipe_ingredients 
             SET ${setCols}
             WHERE recipe_id = $${values.length + 1}
             RETURNING recipe_id AS "recipeId", 
                    measurement_id AS "measurementId",
                    ingredient_id AS "ingredientId", 
                    amount`,
      [...values, id],
    );

    const recipeIngredient = result.rows[0];

    if (!recipeIngredient) throw new NotFoundError(`No recipe: ${id}`);

    return recipeIngredient;
  }

  /**
   * Updates the recipe table and recipeIngredient table
   * @param {number} recipeId
   * @param {Object}data
   * @returns
   */
  public static async updateRecipeWithIngredients(
    recipeId: number,
    data: {
      recipeName: string;
      prepTime?: number | undefined;
      cookingTime?: number | undefined;
      recipeImage: string;
      mealType: string;
      instructions: string;
      ingredients?: {
        amount: number;
        measurementId?: number | undefined;
        measurement?: string | undefined;
        ingredientId: number;
        ingredient: string;
      }[];
    },
  ) {
    // delete data?.ingredients;
    const updatedRecipe = await this.updateRecipe(recipeId, data);

    const ingredientList = data?.ingredients;
    if (updatedRecipe && ingredientList && ingredientList.length) {
      await Promise.all(
        ingredientList.map(async (recipeList) => {
          const response = await db.query(
            `SELECT recipe_id,
                          measurement_id,
                          ingredient_id
                  FROM recipe_ingredients
                  WHERE recipe_id = $1 AND ingredient_id = $2`,
            [recipeId, recipeList.ingredientId],
          );

          if (response) {
            await this.updateRecipeIngredients(recipeId, recipeList);
          }
        }),
      );
    }

    return data;
  }

  /** Delete given ingredient from database; returns undefined.
   *
   * Throws NotFoundError if ingredient not found.
   * @param {Object} data
   */
  public static async removeRecipeIngredients(data: {
    recipeId: number;
    measurementId?: number;
    ingredientId: number;
  }): Promise<void> {
    const columnsToSql = {
      recipeId: "recipe_id",
      measurementId: "measurement_id",
      ingredientId: "ingredient_id",
    };

    const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);
    const deleteCols = setCols.split(",");

    const result = await db.query(
      `DELETE
             FROM recipe_ingredients
             WHERE ${deleteCols.join(" AND ")}
             RETURNING recipe_id`,
      [...values],
    );

    const recipeIngredient = result.rows[0];

    if (!recipeIngredient) throw new NotFoundError(`No recipeIngredient`);
  }
}

export default RecipeModel;
