"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /recipes ", function() {
    const recipe = {
        recipeName: "recipe_test",
        prepTime: 1,
        cookingTime: 10, 
        instructions: 'this is a test recipe, this is testing routes creation',
        mealType: "vegan",
        ingredientList: []
    }; 

    const recipe1 = {
        recipeName: "recipe_test_1",
        prepTime: 1,
        cookingTime: 10, 
        instructions: 'this is a test recipe, this is testing routes creation',
        mealType: "vegan",
        ingredientList: [
            {
                ingredient: 'tomato',
                measurement: 'cup',
                amount: 2
            },
            {
                ingredient: 'fish',
                measurement: '',
                amount: 1
            }

        ]
    };

    test("ok status with empty ingredients", async function() {
        const response = await request(app)
            .post("/recipes")
            .send(recipe);

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({ 
            recipe: {
                id: expect.any(Number),
                ingredients: []
            }
        });
    });

    test("ok creation with ingredients", async function() {
        const response = await request(app)
            .post("/recipes")
            .send(recipe1);

        const recipeId1 = response.body.recipe.ingredients[0].recipeId;
        const recipeId2 = response.body.recipe.ingredients[1].recipeId;
            
        expect(response.statusCode).toEqual(201);
        expect(response.body.recipe.id).toEqual(recipeId1);
        expect(response.body.recipe.id).toEqual(recipeId2);
        expect(response.body).toEqual({ 
            recipe: {
                id: expect.any(Number),
                ingredients: [
                    {
                        recipeId: expect.any(Number),
                        ingredientId: expect.any(Number),
                        measurementId: expect.any(Number),
                        amount: '2'
                    },
                    {
                        recipeId: expect.any(Number),
                        ingredientId: expect.any(Number),
                        measurementId: null,
                        amount: '1'
                    }
                ]
            }
        });
    });
})