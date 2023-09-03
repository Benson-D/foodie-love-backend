"use strict";

const db = require("../../config/db.js");
const Recipe = require("../../models/recipe.js");
const User = require("../../models/user.js");
const { createToken } = require("../../utils/token");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM recipes");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM ingredients");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM measurement_units");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users"); 
  
    await Recipe.insertRecipe(
        { 
            recipeName: "recipe_1",
            prepTime: 1,
            cookingTime: 10, 
            instructions: 'this is a test recipe, this is testing routes 1',
            recipeImage: null,
            mealType: "vegan"
        });

    await Recipe.insertRecipe(
        { 
            recipeName: "recipe_2",
            prepTime: 2,
            cookingTime: 20, 
            instructions: 'this is a test recipe, this is testing routes 2',
            recipeImage: null,
            mealType: "italian"
        });
    await Recipe.insertRecipe(
        { 
            recipeName: "recipe_3",
            prepTime: 3,
            cookingTime: 30, 
            instructions: 'this is a test recipe, this is testing routes 3',
            recipeImage: null,
            mealType: "mexican"
        });
  

    await User.register({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "user1@user.com",
      password: "password1",
      isAdmin: false,
    });
    await User.register({
      username: "u2",
      firstName: "U2F",
      lastName: "U2L",
      email: "user2@user.com",
      password: "password2",
      isAdmin: false,
    });
    await User.register({
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

  module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken
  };