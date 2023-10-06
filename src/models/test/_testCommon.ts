import bcrypt from "bcrypt";
import db from "../../configs/db";
import { BCRYPT_WORK_FACTOR } from "../../configs/general";

const recipeIds: number[] = [];
const ingredientIds: number[] = [];
const measurementIds: number[] = [];
const userIds: string[] = [];

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
    VALUES ('recipe_1', 1, 10, NULL, '[{ "description": "testing, recipe_1"}]', 'vegan'),
           ('recipe_2', 2, 20, NULL, '[{ "description": "testing, recipe_2"}]', 'italian'),
           ('recipe_3', 3, 30, NULL, '[{ "description": "testing, recipe_3"}]', 'mexican'),
           ('recipe_4', 4, 40, NULL, '[{ "description": "testing, recipe_4"}]', 'vegan')
    RETURNING id`);

  recipeIds.splice(0, 0, ...resultRecipe.rows.map((recipe) => recipe.id));

  const resultIngredient = await db.query(`
        INSERT INTO ingredients(ingredient_name)
        VALUES ('ingredient_1'), 
               ('ingredient_2'), 
               ('ingredient_3')
        RETURNING id`);

  ingredientIds.splice(0, 0, ...resultIngredient.rows.map((ingr) => ingr.id));

  const resultMeasurement = await db.query(`
        INSERT INTO measurement_units(measurement_description)
        VALUES ('measurement_cup'),
               ('measurement_teaspoon')
        RETURNING id`);

  measurementIds.splice(0, 0, ...resultMeasurement.rows.map((m) => m.id));

  await db.query(
    `
        INSERT INTO recipe_ingredients
               (recipe_id, measurement_id, ingredient_id, amount) 
        VALUES ($1, $2, $3, 5),
               ($4, $5, $6, 7)`,
    [
      recipeIds[0],
      measurementIds[0],
      ingredientIds[0],
      recipeIds[2],
      null,
      ingredientIds[2],
    ],
  );

  const resultUser = await db.query(
    `
        INSERT INTO users
               (username, password, first_name, last_name, email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING id, username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ],
  );

  userIds.splice(0, 0, ...resultUser.rows.map((user) => user.id));

  await db.query(
    `
        INSERT INTO users_recipes(user_id, recipe_id)
        VALUES ($1, $2)`,
    [userIds[0], recipeIds[0]],
  );

  await db.query(
    `
       INSERT INTO users_groceries(user_id, ingredient_id)
       VALUES ($1, $2)`,
    [userIds[0], ingredientIds[0]],
  );
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

export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  recipeIds,
  ingredientIds,
  measurementIds,
  userIds,
};
