import db from "../../configs/db";
import { NotFoundError } from "../../utils/expressError";
import RecipeModel from "../recipeModel";

import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  recipeIds,
  ingredientIds,
  measurementIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************************* create *************************************/
describe("create recipes", function () {
  const newRecipe = {
    recipeName: "test_recipe",
    prepTime: 15,
    cookingTime: 30,
    recipeImage: "http://new-recipe.img",
    instructions: JSON.stringify([{ instruction: "testing, recipe_1" }]),
    mealType: "italian",
  };

  test("create a recipe", async function () {
    const recipe = await RecipeModel.insertRecipe(newRecipe);
    expect(recipe).toEqual({ id: expect.any(Number) });

    const recipeResponse = await db.query(
      `SELECT id,
             recipe_name
            FROM recipes
            WHERE recipe_name = $1`,
      ["test_recipe"],
    );

    //Validate
    expect(recipeResponse.rows).toEqual([
      {
        id: expect.any(Number),
        recipe_name: "test_recipe",
      },
    ]);
  });

  test("create ingredient", async function () {
    const ingredient = await RecipeModel.insertIngredients("test_food");
    expect(ingredient).toEqual({
      id: expect.any(Number),
      ingredientName: "test_food",
    });
  });

  test("return an existing ingredient", async function () {
    const ingredient = await RecipeModel.insertIngredients("ingredient_1");
    expect(ingredient).toEqual({
      id: ingredientIds[0],
      ingredientName: "ingredient_1",
    });
  });

  test("create measurement", async function () {
    const measurement =
      await RecipeModel.insertMeasurements("test_measurement");
    expect(measurement).toEqual({
      id: expect.any(Number),
      measurement: "test_measurement",
    });
  });

  test("handles empty measurments", async function () {
    const measurement = await RecipeModel.insertMeasurements("");
    expect(measurement).toEqual(undefined);
  });

  test("create recipe ingredients", async function () {
    const recipeIngredient = await RecipeModel.insertRecipeIngredients({
      recipeId: recipeIds[1],
      measurementId: measurementIds[1],
      ingredientId: ingredientIds[1],
      amount: 5,
    });
    expect(recipeIngredient).toEqual({
      recipeId: recipeIds[1],
      measurementId: measurementIds[1],
      ingredientId: ingredientIds[1],
      amount: "5",
    });
  });

  test("create recipe ingredient with empty measurement", async function () {
    const recipeIngredient = await RecipeModel.insertRecipeIngredients({
      recipeId: recipeIds[3],
      measurementId: undefined,
      ingredientId: ingredientIds[2],
      amount: 2,
    });
    expect(recipeIngredient).toEqual({
      recipeId: recipeIds[3],
      measurementId: null,
      ingredientId: ingredientIds[2],
      amount: "2",
    });
  });
});
/**************************** Ingredient Builder ******************************/
// describe("_ingredientBuilder", function() {
//     test("_ingredientBuilder creates recipe", async function() {
//         const recipeList = {
//             ingredient: "ingredient_test",
//             measurement: "cups",
//             amount: '10',
//         }

//         const recipe = await RecipeModel._ingredientBuilder(recipeIds[2], recipeList);
//         expect(recipe).toEqual(
//             {
//                 recipeId: expect.any(Number),
//                 measurementId: expect.any(Number),
//                 ingredientId: expect.any(Number),
//                 amount: '10'
//             }
//         );
//     });

//     test("handles empty measurement", async function() {
//         const recipeList = {
//             ingredient: "ingredient_3",
//             measurement: "",
//             amount: '3'
//         }

//         const recipe = await RecipeModel._ingredientBuilder(recipeList, recipeIds[0]);
//         expect(recipe).toEqual(
//             {
//                 recipeId: expect.any(Number),
//                 measurementId: null,
//                 ingredientId: expect.any(Number),
//                 amount: '3'
//             }
//         );
//     });

//     test("handles invalid recipe ids", async function() {
//         const recipeList = {
//             ingredient: "ingredient_5",
//             measurement: "oz",
//             amount: 8,
//         }

//         try {
//             await RecipeModel._ingredientBuilder(recipeList, null);
//             fail();
//         } catch (err) {
//             expect(err instanceof BadRequestError).toBeTruthy();
//         }
//     });

// })

/********************************* findAll ************************************/
describe("findAll", function () {
  test("works: all recipes", async function () {
    const recipes = await RecipeModel.findAll();
    expect(recipes).toEqual([
      {
        id: recipeIds[0],
        recipeName: "recipe_1",
        prepTime: 1,
        cookingTime: 10,
        recipeImage: null,
        mealType: "vegan",
      },
      {
        id: recipeIds[1],
        recipeName: "recipe_2",
        prepTime: 2,
        cookingTime: 20,
        recipeImage: null,
        mealType: "italian",
      },
      {
        id: recipeIds[2],
        recipeName: "recipe_3",
        prepTime: 3,
        cookingTime: 30,
        recipeImage: null,
        mealType: "mexican",
      },
      {
        id: recipeIds[3],
        recipeName: "recipe_4",
        prepTime: 4,
        cookingTime: 40,
        recipeImage: null,
        mealType: "vegan",
      },
    ]);
  });

  test("works: find cooking time", async function () {
    const recipes = await RecipeModel.findAll({ cookingTime: 20 });
    expect(recipes).toEqual([
      {
        id: recipeIds[0],
        recipeName: "recipe_1",
        prepTime: 1,
        cookingTime: 10,
        recipeImage: null,
        mealType: "vegan",
      },
      {
        id: recipeIds[1],
        recipeName: "recipe_2",
        prepTime: 2,
        cookingTime: 20,
        recipeImage: null,
        mealType: "italian",
      },
    ]);
  });

  test("works: find recipe type", async function () {
    const recipes = await RecipeModel.findAll({ recipeName: "vegan" });
    expect(recipes).toEqual([
      {
        id: recipeIds[0],
        recipeName: "recipe_1",
        prepTime: 1,
        cookingTime: 10,
        recipeImage: null,
        mealType: "vegan",
      },
      {
        id: recipeIds[3],
        recipeName: "recipe_4",
        prepTime: 4,
        cookingTime: 40,
        recipeImage: null,
        mealType: "vegan",
      },
    ]);
  });

  test("works: find recipe name", async function () {
    const recipes = await RecipeModel.findAll({ recipeName: "1" });
    expect(recipes).toEqual([
      {
        id: recipeIds[0],
        recipeName: "recipe_1",
        prepTime: 1,
        cookingTime: 10,
        recipeImage: null,
        mealType: "vegan",
      },
    ]);
  });

  test("works find cooking time", async function () {
    const recipes = await RecipeModel.findAll({ cookingTime: 20 });
    expect(recipes).toEqual([
      {
        id: recipeIds[0],
        recipeName: "recipe_1",
        prepTime: 1,
        cookingTime: 10,
        recipeImage: null,
        mealType: "vegan",
      },
      {
        id: recipeIds[1],
        recipeName: "recipe_2",
        prepTime: 2,
        cookingTime: 20,
        recipeImage: null,
        mealType: "italian",
      },
    ]);
  });

  test("handles not found values", async function () {
    const recipes = await RecipeModel.findAll({ recipeName: "1000000" });
    expect(recipes).toEqual([]);
  });
});
/******************************* findRecipeById ************************************/
describe("get recipe", function () {
  test("finds a recipe", async function () {
    const recipe = await RecipeModel.findRecipeById(recipeIds[0]);

    expect(recipe).toEqual([
      {
        id: recipeIds[0],
        recipeName: "recipe_1",
        prepTime: 1,
        cookingTime: 10,
        recipeImage: null,
        mealType: "vegan",
        instructions: [{ instruction: "testing, recipe_1" }],
        amount: "5",
        measurementId: measurementIds[0],
        measurement: "measurement_cup",
        ingredientId: ingredientIds[0],
        ingredient: "ingredient_1",
      },
    ]);
  });

  test("not found if no such recipe", async function () {
    try {
      await RecipeModel.findRecipeById(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
/******************************* updateRecipe *********************************/
describe("update a curent recipe", function () {
  const updateData = {
    recipeName: "update_recipe",
    cookingTime: 10,
    prepTime: 1,
    recipeImage: "",
    instructions: JSON.stringify([
      { instruction: "adding test, update current recipe" },
    ]),
    mealType: "italian",
  };

  test("update recipe", async function () {
    const updateRecipe = await RecipeModel.updateRecipe(
      recipeIds[0],
      updateData,
    );

    expect(updateRecipe).toEqual({
      id: recipeIds[0],
      recipeName: "update_recipe",
    });

    //Testing recipe updated properly
    const recipe = await RecipeModel.findRecipeById(recipeIds[0]);
    expect(recipe).toEqual([
      {
        id: recipeIds[0],
        recipeName: "update_recipe",
        prepTime: 1,
        cookingTime: 10,
        recipeImage: "",
        mealType: "italian",
        instructions: [{ instruction: "adding test, update current recipe" }],
        amount: "5",
        measurementId: measurementIds[0],
        measurement: "measurement_cup",
        ingredientId: ingredientIds[0],
        ingredient: "ingredient_1",
      },
    ]);
  });

  test("not found if no such recipe", async function () {
    try {
      await RecipeModel.updateRecipe(9999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/******************************* deleteRecipe *********************************/
describe("remove a recipe", function () {
  test("remove recipe", async function () {
    await RecipeModel.removeRecipe(recipeIds[1]);

    //Check if Deleted
    const recipe = await db.query(
      `SELECT id FROM recipes WHERE id=${recipeIds[1]}`,
    );
    expect(recipe.rows.length).toEqual(0);
  });

  test("not found if no such recipe", async function () {
    try {
      await RecipeModel.removeRecipe(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************* deleteRecipeIngredient *****************************/
describe("remove a recipe ingredient list", function () {
  test("remove list", async function () {
    const recipeData = {
      recipeId: recipeIds[0],
      ingredientId: ingredientIds[0],
      measurementId: measurementIds[0],
    };

    await RecipeModel.removeRecipeIngredients(recipeData);

    //Check if Deleted
    const recipeList = await db.query(
      `SELECT recipe_id, 
                            measurement_id,
                            ingredient_id
                    FROM recipe_ingredients 
                    WHERE recipe_id = ${recipeIds[0]} 
                        AND measurement_id = ${measurementIds[0]}
                        AND ingredient_id = ${ingredientIds[0]}`,
    );
    expect(recipeList.rows.length).toEqual(0);
  });

  test("remove list with no measurment", async function () {
    const recipeData = {
      recipeId: recipeIds[2],
      ingredientId: ingredientIds[2],
    };

    await RecipeModel.removeRecipeIngredients(recipeData);

    //Check if Deleted
    const recipeList = await db.query(
      `SELECT recipe_id, 
                            measurement_id,
                            ingredient_id
                    FROM recipe_ingredients 
                    WHERE recipe_id = ${recipeIds[2]} 
                        AND ingredient_id = ${ingredientIds[2]}`,
    );
    expect(recipeList.rows.length).toEqual(0);
  });

  test("not found if no such recipe", async function () {
    const invalidData = {
      recipeId: 9999,
      measurementId: 9999,
      ingredientId: 9999,
    };

    try {
      await RecipeModel.removeRecipeIngredients(invalidData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
