import { prisma } from "../configs/prismaClient";
import { NotFoundError } from "../utils/expressError";

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

  public static async updateRecipe(
    recipeId: string,
    recipeData: {
      recipeName: string;
      prepTime?: number;
      cookingTime: number;
      recipeImage?: string;
      mealType?: string;
      instructions: string;
    },
  ) {
    const updatedRecipe = await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        name: recipeData.recipeName,
        prepTime: recipeData.prepTime ?? null,
        cookingTime: recipeData.cookingTime,
        recipeImage: recipeData.recipeImage ?? null,
        mealType: recipeData.mealType ?? null,
      },
    });

    return updatedRecipe;
  }

  public static async updateRecipeIngredient(
    recipeId: string,
    updateRecipeIngredient: {
      amount: number;
      measurementId?: string;
      ingredientId: string;
    },
  ) {
    const updatedRecipeIngredient = await prisma.recipeIngredient.update({
      where: {
        recipeId_ingredientId: {
          recipeId: recipeId,
          ingredientId: updateRecipeIngredient.ingredientId,
        },
      },
      data: {
        amount: updateRecipeIngredient.amount,
        measurementUnitId: updateRecipeIngredient.measurementId ?? null,
        ingredientId: updateRecipeIngredient.ingredientId,
      },
    });

    return updatedRecipeIngredient;
  }

  /**
   * Updates the recipe table and recipeIngredient table
   * @param {number} recipeId
   * @param {Object} recipeData
   * @returns
   */
  public static async updateRecipeWithIngredients(
    recipeId: string,
    recipeData: {
      recipeName: string;
      prepTime?: number;
      cookingTime: number;
      recipeImage?: string;
      mealType?: string;
      instructions: string;
      ingredients: {
        amount: number;
        measurementId?: string;
        ingredientId: string;
      }[];
    },
  ) {
    const foundRecipe = await this.findRecipeById(recipeId);

    if (!foundRecipe) throw new NotFoundError(`Recipe not found: ${recipeId}`);

    const updatedRecipe = await this.updateRecipe(recipeId, recipeData);

    for (const ingredientItems of recipeData.ingredients) {
      await this.updateRecipeIngredient(recipeId, ingredientItems);
    }

    return updatedRecipe;
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

  public static async removeRecipeIngredients(recipeData: {
    recipeId: string;
    ingredientId: string;
  }) {
    const deletedRecipeIngredient = await prisma.recipeIngredient.delete({
      where: {
        recipeId_ingredientId: {
          recipeId: recipeData.recipeId,
          ingredientId: recipeData.ingredientId,
        },
      },
    });

    return deletedRecipeIngredient;
  }
}

export default RecipeModel;
