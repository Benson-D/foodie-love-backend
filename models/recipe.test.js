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
    }

    test("create a recipe", async function() {
        let recipe = await Recipe.insertRecipe(newRecipe); 
        expect(recipe).toEqual({ id: expect.any(Number) });
    })

    test("create ingredient", async function() {
        let ingredient = await Recipe.insertIngredients('test_food');
        expect(ingredient).toEqual(
            { 
                id: expect.any(Number),
                ingredientName: 'test_food'
            })
    })

    test("return an existing ingredient", async function() {
        let ingredient = await Recipe.insertIngredients('ingredient_1');
        expect(ingredient).toEqual(
            {
                id: ingredientIds[0],
                ingredientName: 'ingredient_1'
            }
        )
    })

    test("create measurement", async function() {
        let measurement = await Recipe.insertMeasurements('test_measurement');
        expect(measurement).toEqual(
            {
                id: expect.any(Number),
                measurement: "test_measurement"
            }
        )
    })

    test("create recipe ingredients", async function() {
        let recipeIngredient = await Recipe.insertRecipeIngredients(
            {
                recipeId: recipeIds[0],
                measurementId: measurementIds[0],
                ingredientId: ingredientIds[0],
                amount: 5
            }
        );
        expect(recipeIngredient).toEqual(
            {
                recipeId: recipeIds[0],
                measurementId: measurementIds[0],
                ingredientId: ingredientIds[0],
                amount: "5"
            }
        );
    })

})

/********************************* findAll ************************************/
describe("findAll", function() {
    test("works: all recipes", async function(){

        let recipes = await Recipe.findAll();
        expect(recipes).toEqual([
            { 
                id: recipeIds[0],
                recipeName: "recipe_1",
                prep_time: 1,
                cookingTime: 10, 
                recipe_image: null,
                mealType: "vegan"
            },
            { 
                id: recipeIds[1],
                recipeName: "recipe_2",
                prep_time: 2,
                cookingTime: 20, 
                recipe_image: null,
                mealType: "italian"
            },
            { 
                id: recipeIds[2],
                recipeName: "recipe_3",
                prep_time: 3,
                cookingTime: 30, 
                recipe_image: null,
                mealType: "mexican"
            },
            { 
                id: recipeIds[3],
                recipeName: "recipe_4",
                prep_time: 4,
                cookingTime: 40, 
                recipe_image: null,
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
                prep_time: 1,
                cookingTime: 10, 
                recipe_image: null,
                mealType: "vegan"
            },
            { 
                id: recipeIds[1],
                recipeName: "recipe_2",
                prep_time: 2,
                cookingTime: 20, 
                recipe_image: null,
                mealType: "italian"
            }
        ])
    })

    test("works: find recipe type", async function() {
        const recipes = await Recipe.findAll({ recipeName: "vegan"});
        expect(recipes).toEqual([
            { 
                id: recipeIds[0],
                recipeName: "recipe_1",
                prep_time: 1,
                cookingTime: 10, 
                recipe_image: null,
                mealType: "vegan"
            },
            { 
                id: recipeIds[3],
                recipeName: "recipe_4",
                prep_time: 4,
                cookingTime: 40, 
                recipe_image: null,
                mealType: "vegan"
            },
        ])
    })

    test("works: find recipe name", async function() {
        const recipes = await Recipe.findAll({ recipeName: "1"});
        expect(recipes).toEqual([
            { 
                id: recipeIds[0],
                recipeName: "recipe_1",
                prep_time: 1,
                cookingTime: 10, 
                recipe_image: null,
                mealType: "vegan"
            },
        ])
    })

    test("works find cooking time", async function() {
        const recipes = await Recipe.findAll({ cookingTime: 20 });
        expect(recipes).toEqual([
            {
                id: recipeIds[0],
                recipeName: "recipe_1",
                prep_time: 1,
                cookingTime: 10, 
                recipe_image: null,
                mealType: "vegan" 
            },
            { 
                id: recipeIds[1],
                recipeName: "recipe_2",
                prep_time: 2,
                cookingTime: 20, 
                recipe_image: null,
                mealType: "italian"
            } 
        ])
    })

});