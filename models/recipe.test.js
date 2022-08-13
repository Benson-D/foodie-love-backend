"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Recipe = require("./recipe.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    recipeIds,
    ingredientIds,
    measurementIds
  } = require("./_testCommon");
  
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
 
/********************************* create *************************************/
describe("create recipes", function() {
    const newRecipe = {
        recipeName: "test_recipe", 
        prepTime: 15, 
        cookingTime: 30, 
        recipeImage: 'http://new-recipe.img',
        instructions: 'testing creation of recipe',
        mealType: 'italian'
    };

    test("create a recipe", async function() {
        let recipe = await Recipe.insertRecipe(newRecipe); 
        expect(recipe).toEqual({ id: expect.any(Number) });

        const recipeResponse = await db.query(            
            `SELECT id,
             recipe_name
            FROM recipes
            WHERE recipe_name = $1`, ['test_recipe']);

        //Validate
        expect(recipeResponse.rows).toEqual([
            {
                id: expect.any(Number),
                recipe_name: "test_recipe"
            }])
    });


    test("create ingredient", async function() {
        let ingredient = await Recipe.insertIngredients('test_food');
        expect(ingredient).toEqual(
            { 
                id: expect.any(Number),
                ingredientName: 'test_food'
            })
    });

    test("handle duplicate ingredients", async function() {
        const ingredient = await Recipe.insertIngredients('ingredient_1');
        expect(ingredient).toEqual({
            id: expect.any(Number),
            ingredientName: 'ingredient_1'
        })
       
    });

    test("handle non string ingredient value", async function() {
        try {
            await Recipe.insertIngredients(0);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
       
    });

    test("return an existing ingredient", async function() {
        let ingredient = await Recipe.insertIngredients('ingredient_1');
        expect(ingredient).toEqual(
            {
                id: ingredientIds[0],
                ingredientName: 'ingredient_1'
            }
        )
    });

    test("create measurement", async function() {
        let measurement = await Recipe.insertMeasurements('test_measurement');
        expect(measurement).toEqual(
            {
                id: expect.any(Number),
                measurement: "test_measurement"
            }
        )
    });

    test("handles empty measurments", async function() {
        let measurement = await Recipe.insertMeasurements('');
        expect(measurement).toEqual(undefined);
    });

    test("create recipe ingredients", async function() {
        let recipeIngredient = await Recipe.insertRecipeIngredients(
            {
                recipeId: recipeIds[1],
                measurementId: measurementIds[1],
                ingredientId: ingredientIds[1],
                amount: 5
            }
        );
        expect(recipeIngredient).toEqual(
            {
                recipeId: recipeIds[1],
                measurementId: measurementIds[1],
                ingredientId: ingredientIds[1],
                amount: "5"
            }
        );
    });

})
/**************************** Ingredient Builder ******************************/
describe("_ingredientBuilder", function() {
    test("_ingredientBuilder creates recipe", async function() {
        const recipeList = {
            ingredient: "ingredient_test",
            measurement: "cups",
            amount: 10,
        }

        const recipe = await Recipe._ingredientBuilder(recipeList, recipeIds[2]);
        expect(recipe).toEqual(
            {
                recipeId: expect.any(Number),
                measurementId: expect.any(Number),
                ingredientId: expect.any(Number),
                amount: '10'
            }
        );
    });

    test("handles duplicate ingredients", async function() {
        const recipeList = {
            ingredient: "ingredient_2",
            measurement: "oz",
            amount: 2,
        }

        const recipe = await Recipe._ingredientBuilder(recipeList, recipeIds[3]);
        expect(recipe).toEqual(
            {
                recipeId: expect.any(Number),
                measurementId: expect.any(Number),
                ingredientId: expect.any(Number),
                amount: '2'
            }
        );
    });

    test("handles duplicate recipes", async function() {
        const recipeList = {
            ingredient: "ingredient_2",
            measurement: "oz",
            amount: 2,
        }

        const recipe = await Recipe._ingredientBuilder(recipeList, recipeIds[0]);
        expect(recipe).toEqual(
            {
                recipeId: expect.any(Number),
                measurementId: expect.any(Number),
                ingredientId: expect.any(Number),
                amount: '2'
            }
        );
    });

    test("handles empty measurement", async function() {
        const recipeList = {
            ingredient: "ingredient_3",
            measurement: "",
            amount: 3
        }

        const recipe = await Recipe._ingredientBuilder(recipeList, recipeIds[0]);
        expect(recipe).toEqual(
            {
                recipeId: expect.any(Number),
                measurementId: null,
                ingredientId: expect.any(Number),
                amount: '3'
            }
        );
    });
})

/********************************* findAll ************************************/
describe("findAll", function() {
    test("works: all recipes", async function() {

        let recipes = await Recipe.findAll();
        expect(recipes).toEqual([
            { 
                id: recipeIds[0],
                recipeName: "recipe_1",
                prepTime: 1,
                cookingTime: 10, 
                recipeImage: null,
                mealType: "vegan"
            },
            { 
                id: recipeIds[1],
                recipeName: "recipe_2",
                prepTime: 2,
                cookingTime: 20, 
                recipeImage: null,
                mealType: "italian"
            },
            { 
                id: recipeIds[2],
                recipeName: "recipe_3",
                prepTime: 3,
                cookingTime: 30, 
                recipeImage: null,
                mealType: "mexican"
            },
            { 
                id: recipeIds[3],
                recipeName: "recipe_4",
                prepTime: 4,
                cookingTime: 40, 
                recipeImage: null,
                mealType: "vegan"
            },
        ])
    }); 

    test("works: find cooking time", async function() {
        const recipes = await Recipe.findAll({ cookingTime: 20});
        expect(recipes).toEqual([
            { 
                id: recipeIds[0],
                recipeName: "recipe_1",
                prepTime: 1,
                cookingTime: 10, 
                recipeImage: null,
                mealType: "vegan"
            },
            { 
                id: recipeIds[1],
                recipeName: "recipe_2",
                prepTime: 2,
                cookingTime: 20, 
                recipeImage: null,
                mealType: "italian"
            }
        ])
    });

    test("works: find recipe type", async function() {
        const recipes = await Recipe.findAll({ recipeName: "vegan"});
        expect(recipes).toEqual([
            { 
                id: recipeIds[0],
                recipeName: "recipe_1",
                prepTime: 1,
                cookingTime: 10, 
                recipeImage: null,
                mealType: "vegan"
            },
            { 
                id: recipeIds[3],
                recipeName: "recipe_4",
                prepTime: 4,
                cookingTime: 40, 
                recipeImage: null,
                mealType: "vegan"
            },
        ])
    });

    test("works: find recipe name", async function() {
        const recipes = await Recipe.findAll({ recipeName: "1"});
        expect(recipes).toEqual([
            { 
                id: recipeIds[0],
                recipeName: "recipe_1",
                prepTime: 1,
                cookingTime: 10, 
                recipeImage: null,
                mealType: "vegan"
            },
        ])
    });

    test("works find cooking time", async function() {
        const recipes = await Recipe.findAll({ cookingTime: 20 });
        expect(recipes).toEqual([
            {
                id: recipeIds[0],
                recipeName: "recipe_1",
                prepTime: 1,
                cookingTime: 10, 
                recipeImage: null,
                mealType: "vegan" 
            },
            { 
                id: recipeIds[1],
                recipeName: "recipe_2",
                prepTime: 2,
                cookingTime: 20, 
                recipeImage: null,
                mealType: "italian"
            } 
        ])
    });

    test("handles not found values", async function() {
        const recipes = await Recipe.findAll({ recipeName: 1000000 });
        expect(recipes).toEqual([]);
    })

});
/******************************* getRecipe ************************************/
describe("get recipe", function() {
    test('finds a recipe', async function() {
        const recipe = await Recipe.getRecipe(recipeIds[0]);
        expect(recipe).toEqual([
            {
                id: recipeIds[0],
                recipeName: "recipe_1",
                prepTime: '1 minute',
                cookingTime: '10 minutes', 
                recipeImage: null,
                mealType: "vegan",
                instructions: "testing, recipe_1",
                ingredients: [
                    {
                        amount: '5', 
                        measurement: 'measurement_cup',
                        ingredient: 'ingredient_1'
                    }
                ] 
            },
        ])  
    });

    test('not found if no such recipe', async function() {
        try {
            await Recipe.getRecipe(9999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

});
/******************************* updateRecipe *********************************/
describe("update a curent recipe", function() {
    const updateData = {
        recipeName: "update_recipe",
        cookingTime: 10,
        prepTime: 1,
        recipeImage: null,
        instructions: "adding test, update current recipe",
        mealType: "italian"
    };

    test("update recipe", async function() {
        const updateRecipe = await Recipe.updateRecipe(recipeIds[0], updateData);
        expect(updateRecipe).toEqual({
            id: recipeIds[0],
            recipeName: "update_recipe"
        });

        //Testing recipe updated properly
        const recipe = await Recipe.getRecipe(recipeIds[0]);
        expect(recipe).toEqual([
            {
                id: recipeIds[0],
                recipeName: "update_recipe",
                prepTime: '1 minute',
                cookingTime: '10 minutes', 
                recipeImage: null,
                mealType: "italian",
                instructions: "adding test, update current recipe",
                ingredients: [
                    {
                        amount: '5', 
                        measurement: 'measurement_cup',
                        ingredient: 'ingredient_1'
                    }
                ] 
            },
        ]);
    })

    test('not found if no such recipe', async function() {
        try {
            await Recipe.updateRecipe(9999, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
}) 

/******************************* deleteRecipe *********************************/
describe("remove a recipe", function() {
    test("remove recipe", async function() {
        await Recipe.removeRecipe(recipeIds[1]);

        //Check if Deleted
        const recipe = await db.query(`SELECT id FROM recipes WHERE id=${recipeIds[1]}`);
        expect(recipe.rows.length).toEqual(0);
    });

    test('not found if no such recipe', async function() {
        try {
            await Recipe.removeRecipe(9999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})