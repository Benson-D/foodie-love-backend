const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const recipeIds = [];
const ingredientIds = [];
const measurementIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM recipes");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM ingredients");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM measurement_units");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users"); 

  const resultRecipe = await db.query(`
    INSERT INTO recipes(
                        recipe_name, 
                        prep_time, 
                        cooking_time, 
                        recipe_image, 
                        instructions,  
                        meal_type)
    VALUES ('recipe_1', 1, 10, NULL, 'testing, recipe_1', 'vegan'),
           ('recipe_2', 2, 20, NULL, 'testing, recipe_2', 'italian'),
           ('recipe_3', 3, 30, NULL, 'testing, recipe_3', 'mexican'),
           ('recipe_4', 4, 40, NULL, 'testing, recipe_4', 'vegan')
    RETURNING id`);

  recipeIds.splice(0, 0, ...resultRecipe.rows.map(recipe => recipe.id));

  const resultIngredient = await db.query(`
        INSERT INTO ingredients(ingredient_name)
        VALUES ('ingredient_1'), 
               ('ingredient_2'), 
               ('ingredient_3')
        RETURNING id`);

  ingredientIds.splice(0, 0, ...resultIngredient.rows.map(ingr => ingr.id));

  const resultMeasurement = await db.query(`
        INSERT INTO measurement_units(measurement_description)
        VALUES ('measurement_cup'),
               ('measurement_teaspoon')
        RETURNING id`);
  
  measurementIds.splice(0, 0, ...resultMeasurement.rows.map(m => m.id));

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

  await db.query(`
        INSERT INTO users_recipes(username, recipe_id)
        VALUES ('u1', $1)`,
        [recipeIds[0]]);

  await db.query(`
       INSERT INTO users_groceries(username, ingredient_id)
       VALUES ('u1', $1)`,
       [ingredientIds[0]]);


}

/** Initiate a transaction */
async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  recipeIds,
  ingredientIds,
  measurementIds
};