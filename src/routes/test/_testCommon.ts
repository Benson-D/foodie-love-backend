import db from "../../configs/db";
import { createToken } from "../../utils/token";

import RecipeModel from "../../models/recipeModel";
import UserModel from "../../models/userModel";

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM recipes");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM ingredients");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM measurement_units");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await RecipeModel.insertRecipe({
    recipeName: "recipe_1",
    prepTime: 1,
    cookingTime: 10,
    instructions:
      '[{"description": "this is a test recipe, this is testing routes 1"}]',
    recipeImage: "",
    mealType: "vegan",
  });

  await RecipeModel.insertRecipe({
    recipeName: "recipe_2",
    prepTime: 2,
    cookingTime: 20,
    instructions:
      '[{"description": "this is a test recipe, this is testing routes 2"}]',
    recipeImage: "",
    mealType: "italian",
  });
  await RecipeModel.insertRecipe({
    recipeName: "recipe_3",
    prepTime: 3,
    cookingTime: 30,
    instructions:
      '[{"description": "this is a test recipe, this is testing routes 3"}]',
    recipeImage: "",
    mealType: "mexican",
  });

  await UserModel.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await UserModel.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await UserModel.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
};
