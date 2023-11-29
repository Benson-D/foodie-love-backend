// import request from "supertest";
// import app from "../../app";

// import {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
// } from "./_testCommon";

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
// afterAll(commonAfterAll);

// /***************************** POST /recipes **********************************/
// describe("POST /recipes ", function () {
//   const recipe = {
//     recipeName: "recipe_test",
//     prepTime: 1,
//     cookingTime: 10,
//     instructions:
//       '[{"instruction": "this is a test recipe, this is testing routes creation"}]',
//     mealType: "vegan",
//     ingredientList: JSON.stringify([]),
//   };

//   const recipe1 = {
//     recipeName: "recipe_test_1",
//     prepTime: 1,
//     cookingTime: 10,
//     instructions:
//       '[{"instruction": "this is a test recipe, this is testing routes creation"}]',
//     mealType: "vegan",
//     ingredientList: JSON.stringify([
//       {
//         ingredient: "tomato",
//         measurement: "cup",
//         amount: "2",
//       },
//       {
//         ingredient: "fish",
//         measurement: "",
//         amount: "1",
//       },
//     ]),
//   };

//   test("bad request with invalid data", async function () {
//     const response = await request(app).post("/recipes").send({
//       recipeName: "recipe_fail",
//       prepTime: 1,
//       instructions: "",
//       mealType: "barbeque",
//     });

//     expect(response.statusCode).toEqual(400);
//   });

//   test("ok status with empty ingredients", async function () {
//     const response = await request(app).post("/recipes").send(recipe);

//     expect(response.statusCode).toEqual(201);
//     expect(response.body).toEqual({
//       recipe: {
//         id: expect.any(Number),
//         ingredients: [],
//       },
//     });
//   });

//   test("ok creation with ingredients", async function () {
//     const response = await request(app).post("/recipes").send(recipe1);

//     const recipeId1 = response.body.recipe.ingredients[0].recipeId;
//     const recipeId2 = response.body.recipe.ingredients[1].recipeId;

//     expect(response.statusCode).toEqual(201);
//     expect(response.body.recipe.id).toEqual(recipeId1);
//     expect(response.body.recipe.id).toEqual(recipeId2);
//     expect(response.body).toEqual({
//       recipe: {
//         id: expect.any(Number),
//         ingredients: [
//           {
//             recipeId: expect.any(Number),
//             ingredientId: expect.any(Number),
//             measurementId: expect.any(Number),
//             amount: "2",
//           },
//           {
//             recipeId: expect.any(Number),
//             ingredientId: expect.any(Number),
//             measurementId: null,
//             amount: "1",
//           },
//         ],
//       },
//     });
//   });
// });

// describe("GET / recipes", function () {
//   test("ok for find all recipes", async function () {
//     const response = await request(app).get("/recipes");
//     expect(response.body).toEqual({
//       recipes: [
//         {
//           id: expect.any(Number),
//           recipeName: "recipe_1",
//           prepTime: 1,
//           cookingTime: 10,
//           recipeImage: "",
//           mealType: "vegan",
//         },
//         {
//           id: expect.any(Number),
//           recipeName: "recipe_2",
//           prepTime: 2,
//           cookingTime: 20,
//           recipeImage: "",
//           mealType: "italian",
//         },
//         {
//           id: expect.any(Number),
//           recipeName: "recipe_3",
//           prepTime: 3,
//           cookingTime: 30,
//           recipeImage: "",
//           mealType: "mexican",
//         },
//       ],
//     });
//   });

//   test("bad request if invalid filter key", async function () {
//     const response = await request(app)
//       .get("/recipes")
//       .query({ fail: "fail search" });
//     expect(response.statusCode).toEqual(400);
//   });
// });
