"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for recipes. */

class Recipe {
    /** Create a recipe, updates db, return new recipe data.
     * 
     * data should be { recipeName, prepTime, cookingTime, recipeImage, 
     * instructions, mealType }
     * 
     * 
     * @param {Object} recipeData 
     * @return {Promise<string>} JSON [{ id }]
     */
    static async insertRecipe(recipeData) {
        const { recipeName, prepTime, cookingTime, recipeImage, 
                instructions, mealType } = recipeData; 
        
        const result = await db.query(
            `INSERT INTO recipes
                (recipe_name, prep_time, cooking_time, recipe_image, 
                instructions, meal_type)
                VALUES
                    ($1, $2, $3, $4, $5, $6)
                RETURNING id`,
                [ recipeName, 
                  prepTime, 
                  cookingTime, 
                  recipeImage, 
                  instructions, 
                  mealType
                ]);

        const recipe = result.rows[0];

        return recipe; 
    }

    /** Create a ingredient, updates db, return new ingredient data.
     * 
     * data should be { ingredientName } 
     * 
     * If ingredient already in database returns that ingredient data
     * 
     * @param {string} ingredientName
     * @return {Promise<string>} JSON [{ id, ingredientName }]
     */
    static async insertIngredients(ingredientName) {
        if (typeof ingredientName !== 'string') {
            throw new BadRequestError('Not a valid ingredient');
        };

        const checkIngredient = await db.query(
            `SELECT id, 
                    ingredient_name AS "ingredientName"
             FROM ingredients
             WHERE ingredient_name = $1`, [ingredientName]);
        
        const existingIngredient = checkIngredient.rows[0]; 

        if (existingIngredient) return existingIngredient;
        
        const result = await db.query(
            `INSERT INTO ingredients (ingredient_name)
             VALUES ($1)
             RETURNING id, ingredient_name AS "ingredientName"`,
             [ingredientName]);
        
        const ingredient = result.rows[0];

        return ingredient;
    }

    /** Create a measurement, updates db, return new measurement data.
     * 
     * data should be { measurementDescription }
     * 
     * If measurement already in database returns that measurement data
     * 
     * @param {string} measurementDescription
     * @return {Promise<string>} JSON [{ id, measurementDescription }]
     */
    static async insertMeasurements(measurementDescription) {
        if(!measurementDescription) return;

        const checkMeasurement = await db.query(
            `SELECT id, 
                    measurement_description AS "measurement"
            FROM measurement_units
            WHERE measurement_description = $1`, [measurementDescription]);
        
        const duplicateMeasurement = checkMeasurement.rows[0]; 

        if (duplicateMeasurement) return duplicateMeasurement;

        const result = await db.query(
            `INSERT INTO measurement_units (measurement_description)
             VALUES ($1)
             RETURNING id, measurement_description AS "measurement"`,
             [measurementDescription]);

        const measurement = result.rows[0];

        return measurement;
    }

    /**
     * Creates a function to direct the data needed to make measurement,
     * ingredient, and recipe ingredients
     * 
     * Intended to handle multiple ingredients in a recipe 
     * Measurement can be null, handles case if value is empty
     * 
     * @param {Object} recipeList 
     * @param {Number} recipeId 
     * @returns {Promise<string>} JSON 
     */
    static async _ingredientBuilder(recipeList, recipeId) {
        const { measurement, ingredient } = recipeList;

        const recipeMeasurement = await this.insertMeasurements(measurement);
        const recipeIngredient = await this.insertIngredients(ingredient);
        let measurementId;

        if (recipeMeasurement) {
            measurementId = recipeMeasurement.id;
        }

        const recipeData = { 
            recipeId: recipeId, 
            measurementId: measurementId,
            ingredientId: recipeIngredient.id, 
            amount: recipeList.amount 
        };

        const result = await this.insertRecipeIngredients(recipeData);
        return result;

    }

    /** Create a recipe ingredient, updates db, 
     * return new recipe ingredient data.
     * 
     * data should be { recipeId, measurementId, ingredientId, amount }
     * 
     * @param {Object} recipeData
     * @return {Promise<string>} JSON
     *  [{ recipeId, measurementId, ingredientId, amount }]
     */
    static async insertRecipeIngredients(recipeData) {
        const { recipeId, measurementId, ingredientId, amount } = recipeData;

        const result = await db.query(
            `INSERT INTO recipe_ingredients 
                (recipe_id, measurement_id, ingredient_id, amount)
             VALUES ($1, $2, $3, $4)
             RETURNING recipe_id AS "recipeId", measurement_id AS "measurementId",
             ingredient_id AS "ingredientId", amount`,
             [ recipeId, measurementId, ingredientId, amount ]);
        
        const recipeIngredient = result.rows[0];

        return recipeIngredient;
    }

    /**
     * Create WHERE clause for filters, to be used by functions that query
     * with filters.
     * 
     * searchFilters (all optional):
     * - recipeName (will find case-insensitive, partial matches)
     * - cookingTime
     * - mealType
     * 
     * @param {*} param0 
     * @returns {Object} 
     * {  where: "WHERE cooking_time <= $1 AND (recipe_name ILIKE $2" 
     *    OR meal_type ILIKE $2),
     *    vals: [25, '%Quinoa%']}
     */
    static _filterWhereBuilder({ recipeName, cookingTime, mealType }) {
        let whereParts = []; 
        let values = [];  

        if(recipeName !== undefined) {
            values.push(`%${recipeName}%`);
            whereParts.push(`
            (recipe_name ILIKE $${values.length} OR meal_type ILIKE $${values.length})
            `)
        }

        if(mealType !== undefined) {
            values.push(mealType);
            whereParts.push(`meal_type = $${values.length}}`);
        }

        if(cookingTime !== undefined) {
            values.push(cookingTime);
            whereParts.push(`cooking_time <= $${values.length}`);
        }

        const whereClaus = whereParts.length > 0 ? 
            `WHERE ${whereParts.join(" AND ")}`
            : '';;

        return { whereClaus, values };
    }

    /** 
     * Find all recipes (optional filter on searchFilters).
     * 
     * searchFilters (all optional):
     * - recipeName (will find case-insensitive, partial matches)
     * - cookingTime
     * - mealType
     * 
     * @param {Object} searchFilters 
     * @returns {Promise<string>} JSON 
     * [{id, recipeName, cookingTime, recipeImage, mealType }]
     */
    static async findAll(searchFilters = {}) { 
        const { recipeName, cookingTime, mealType } = searchFilters;

        const { whereClaus, values } = this._filterWhereBuilder({
            recipeName, cookingTime, mealType
        })

        const recipesResponse = await db.query(
            `SELECT id,
                    recipe_name AS "recipeName",
                    prep_time AS "prepTime",
                    cooking_time AS "cookingTime",
                    recipe_image AS "recipeImage",
                    meal_type AS "mealType"
            FROM recipes ${whereClaus}`, values);

        return recipesResponse.rows;
    }

    /**
     * Given the recipe data, return the recipe for readable format.
     * @param {*} recipe 
     * @returns {Object} 
     * { id: 0, 
     *   recipeName: "test recipe", 
     *   prepTime: 1, 
     *   cookingTime: 2,  
     *   image: null, 
     *   ingredients: [{ 
     *       "amount": "4.0", 
     *       "measurement": "cup", 
     *       "ingredient": "testIngredient" 
     *   }, ...]};
     */
     static _generateRecipe(recipe) {
        const recipeList = {};

        for (const ingredient of recipe) {

            let minuteStatement = ingredient.prepTime > 1 ? 'minutes' : 'minute';

            recipeList.id = ingredient.id;
            recipeList.recipeName = ingredient.recipe_name;
            recipeList.prepTime = `${ingredient.prep_time} ${minuteStatement}`; 
            recipeList.cookingTime = `${ingredient.cooking_time} minutes`; 
            recipeList.recipeImage = ingredient.recipe_image; 
            recipeList.mealType = ingredient.meal_type;
            recipeList.instructions = ingredient.instructions;

            const ingredientList =
                { 
                    amount: ingredient.amount,
                    measurement: ingredient.measurement,
                    ingredient: ingredient.ingredient_name,

                };
            
            if (recipeList.ingredients) {
                recipeList.ingredients.push(ingredientList);
            } else {
                recipeList.ingredients = [ingredientList];
            }
        }

        return recipeList;
    }

    /**
     * Given a recipe id, return data about recipe.
     * 
     * Throws NotFoundError if not found.
     * 
     * @param {*} id 
     * @returns {Promise<string>} JSON
     *  [{ id, recipeName, prepTime, cookingTime, recipeImage, mealType,
     *  amount, measurementDescription, ingredientName }]
     */
    static async getRecipe(id) {
        
        const response = await db.query(
            `SELECT rec.id,
                    rec.recipe_name,
                    rec.prep_time,
                    rec.cooking_time,
                    rec.recipe_image,
                    rec.meal_type,
                    rec.instructions,
                    ri.amount,
                    mu.measurement_description AS "measurement",
                    ingredients.ingredient_name
            FROM recipes rec
               INNER JOIN 
                  recipe_ingredients ri ON rec.id = ri.recipe_id
               INNER JOIN 
                  ingredients ON ingredients.id = ri.ingredient_id
               LEFT JOIN 
                  measurement_units mu ON mu.id = ri.measurement_id
            WHERE rec.id = $1`,[id]);

        if (!response.rows.length) throw new NotFoundError(`No recipe: ${id}`);

        const recipe = [this._generateRecipe(response.rows)];

        return recipe;
    }

    /**
     * Given a ingredient id, return data about ingredient.
     * 
     * Throws NotFoundError if not found. 
     * @param {*} id 
     * @returns {Promise<string>} JSON
     * [{id, ingredient}]
     */
    static async getIngredient(id) {
        const result = await db.query( 
            `SELECT ingredient
             FROM ingredients
             WHERE id = $1`,[id]);
        
        if(!result) throw new NotFoundError(`No ingredient: ${id}`); 

        const ingredient = result.rows[0];

        return ingredient;
    }

    /**
     * Update current recipe list based on data 
     * 
     * Partial Update -- data doesn't need all fields
     * Throws NotFoundError if recipe id not found.
     * 
     * @param {Number} id 
     * @param {Object} data 
     * @returns 
     */
    static async updateRecipe(id, data) {
       
        const columnsToSql = {
            recipeName: "recipe_name",
            cookingTime: "cooking_time",
            prepTime: "prep_time",
            recipeImage: "recipe_image",
            mealType: "meal_type"
        };
    
        const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);
        const result = await db.query(
            `UPDATE recipes
             SET ${setCols}
             WHERE id = $${values.length + 1}
             RETURNING id, recipe_name AS "recipeName"`,[...values, id]);
    
        const recipe = result.rows[0];
    
        if(!recipe) throw new NotFoundError(`No recipe: ${id}`);
    
        return recipe;
    }

    /**
     * Upate recipe Ingredient List
     * 
     * Partial Update -- data doesn't need all fields
     * Throws NotFoundError if recipe list id not found.
     * @param {*} id 
     * @param {*} data 
     * @returns 
     */
    static async updateRecipeIngredients(id, data) {

        const columnsToSql =  {
            recipeId: "recipe_id",
            measurementId: "measurement_id", 
            ingredientId: "ingredient_id"
        };

        const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);

        const result = await db.query(
            `UPDATE recipe_ingredients 
             SET ${setCols}
             WHERE recipe_id = $1
             RETURNING recipe_id AS "recipeId", 
                        measurement_id AS "measurementId",
                        ingredient_id AS "ingredientId", 
                        amount`,[id, ...values]);

        const recipeIngredient = result.rows[0];

        if(!recipeIngredient) throw new NotFoundError(`No recipe: ${id}`);

        return recipeIngredient;
    }

    /** Delete given recipe from database; returns undefined.
     * 
     * Throws NotFoundError if recipe not found.
     * @param {Number} id 
     * @return {Promise<string>} JSON
     */
     static async removeRecipe(id) {
        const result = await db.query(
            `DELETE
             FROM recipes
             WHERE id = $1
             RETURNING id`,[id]);

        const recipe = result.rows[0];

        if (!recipe) throw new NotFoundError(`No recipe: ${id}`);
    }

    /** Delete given ingredient from database; returns undefined.
     * 
     * Throws NotFoundError if ingredient not found.
     * @param {Number} id 
     */
    static async removeIngredient(id) {
        const result = await db.query(
            `DELETE
             FROM ingredients
             WHERE id = $1
             RETURNING id`,[id, ...values]);

        const ingredient = result.rows[0];

        if (!ingredient) throw new NotFoundError(`No ingredient: ${id}`);
    }

}

module.exports = Recipe; 