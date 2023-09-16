import db from "../configs/db";
import { BadRequestError, NotFoundError } from "../utils/expressError";
import { sqlForPartialUpdate } from "../utils/sql";

interface GetRecipe {
    id: number;
    recipeName: string;
    prepTime: string;
    cookingTime: string;
    recipeImage: string;
    mealType: string;
    instructions: string;
    amount: number;
    measurementId: number | undefined;
    measurement: string | undefined;
    ingredientId: number;
    ingredient: string;
}


class RecipeModel {
	/**
	 * Create a recipe then return new recipe data.
	 *
	 * data should be { recipeName, prepTime, cookingTime, recipeImage,
	 * instructions, mealType }
	 *
	 * @param {RecipeData} recipeData
	 * @return {Promise<{ id: number }>} JSON [{ id }]
	 */
	public static async insertRecipe(recipeData: {	
		recipeName: string;
		prepTime?: number;
		cookingTime: number;
		recipeImage?: string;
		instructions: string;
		mealType?: string; 
	}): Promise<{ id: number }> {

		const {
		  recipeName,
		  prepTime,
		  cookingTime,
		  recipeImage,
		  instructions,
		  mealType,
		} = recipeData;
	
		const result = await db.query(
		  `INSERT INTO recipes
					(recipe_name, prep_time, cooking_time, recipe_image,
					instructions, meal_type)
					VALUES
						($1, $2, $3, $4, $5, $6)
					RETURNING id`,
		  [recipeName, prepTime, cookingTime, recipeImage, instructions, mealType]
		);
	
		const recipe = result.rows[0];
		return recipe;
	}

    /**
	 * Create an ingredient and returns new ingredient data.
	 *
	 * data should be { ingredientName }
	 *
	 * If the ingredient already exists in the database, return that ingredient data.
	 *
	 * @param {string} ingredientName
	 * @return {Promise<{ id: number, ingredientName: string }>} JSON [{ id, ingredientName }]
	 */
	public static async insertIngredients(
		ingredientName: string
	): Promise<{ id: number; ingredientName: string }> {
		if (typeof ingredientName !== 'string') {
		throw new BadRequestError('Not a valid ingredient');
		}

		const checkIngredient = await db.query(
		`SELECT id,
				ingredient_name AS "ingredientName"
				FROM ingredients
				WHERE ingredient_name = $1`,
			[ingredientName]
		);

		const existingIngredient = checkIngredient.rows[0];

		if (existingIngredient) return existingIngredient;

		const result = await db.query(
		`INSERT INTO ingredients (ingredient_name)
				VALUES ($1)
				RETURNING id, ingredient_name AS "ingredientName"`,
		[ingredientName]
		);

		const ingredient = result.rows[0];

		return ingredient;
	}

    /**
	 * Creates a measurement and returns new measurement data.
	 *  If data already in database returns that measurement.
     * 
     * measurementDescription =  measurementDescription: string
     * 
	 * @param {string | null} measurementDescription
	 * @return {Promise<{ id: number, measurementDescription: string } | undefined>} 
     * JSON [{ id, measurementDescription }]
	 */
  	public static async insertMeasurements(
		measurementDescription: string | null
	  ): Promise<{ id: number; measurementDescription: string } | undefined> {
		if (!measurementDescription) return;
	
		const checkMeasurement = await db.query(
		  `SELECT id,
						measurement_description AS "measurementDescription"
				FROM measurement_units
				WHERE measurement_description = $1`,
		  [measurementDescription]
		);
	
		const duplicateMeasurement = checkMeasurement.rows[0];
	
		if (duplicateMeasurement) return duplicateMeasurement;
	
		const result = await db.query(
		  `INSERT INTO measurement_units (measurement_description)
				 VALUES ($1)
				 RETURNING id, measurement_description AS "measurementDescription"`,
		  [measurementDescription]
		);
	
		const measurement = result.rows[0];
	
		return measurement;
	}

    /**
	 * Create a recipe ingredient and returns new recipe ingredient data.
	 * 
	 * @param {Object} recipeData
	 * @return {Promise<string>} JSON
	 *  [{ recipeId, measurementId, ingredientId, amount }]
	 */
	static async insertRecipeIngredients(recipeData: {
		recipeId: number;
		measurementId?: number;
		ingredientId: number;
		amount: number;
	}): Promise<{
		recipeId: number;
		measurementId?: number;
		ingredientId: number;
		amount: number;
	}> {
		const { recipeId, measurementId, ingredientId, amount } = recipeData;
	
		let recipeMeasurement: number | undefined;
	
		if (measurementId) {
		recipeMeasurement = measurementId;
		}
	
		const result = await db.query(
		`INSERT INTO recipe_ingredients 
				(recipe_id, measurement_id, ingredient_id, amount)
			VALUES ($1, $2, $3, $4)
			RETURNING recipe_id AS "recipeId", measurement_id AS "measurementId",
			ingredient_id AS "ingredientId", amount`,
		[recipeId, recipeMeasurement, ingredientId, amount]
		);
	
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
	 * @param {Object} filterOptions
	 * @returns {Object} 
	 * {  where: "WHERE cooking_time <= $1 AND (recipe_name ILIKE $2" 
	 *    OR meal_type ILIKE $2),
	 *    vals: [25, '%Quinoa%']}
	 */
	private static _filterWhereBuilder(filterOptions: {
		recipeName?: string;
		cookingTime?: number;
		mealType?: string;
	}): { whereClause: string; values:((string | number)[]) } {
		let whereParts: string[] = [];
		let values: ((string | number)[]) = [];
	
		if (filterOptions.recipeName !== undefined) {
			values.push(`%${filterOptions.recipeName}%`);
			whereParts.push(`
				(recipe_name ILIKE $${values.length} OR meal_type ILIKE $${values.length})
			`);
		}
	
		if (filterOptions.mealType !== undefined) {
			values.push(filterOptions.mealType);
			whereParts.push(`meal_type = $${values.length}`);
		}
	
		if (filterOptions.cookingTime !== undefined) {
			values.push(filterOptions.cookingTime);
			whereParts.push(`cooking_time <= $${values.length}`);
		}
	
		const whereClause = whereParts.length > 0
			? `WHERE ${whereParts.join(" AND ")}`
			: '';
	
		return { whereClause, values };
	}

    /**
	 * Find all recipes (optional filter on searchFilters).
	 * 
	 * @param {Object} searchFilters 
	 * @returns {Promise<string>} JSON 
	 * [{ id, recipeName, cookingTime, recipeImage, mealType }]
	 */
	public static async findAll(searchFilters: {
		recipeName?: string;
		cookingTime?: number;
		mealType?: string;
		skip?: number;
	} = {}): Promise<Array<{
		id: number;
		recipeName: string;
		cookingTime: number;
		recipeImage: string | null;
		mealType: string;
	}>> {
		const { recipeName, cookingTime, mealType, skip } = searchFilters;
	
		const { whereClause, values } = this._filterWhereBuilder({
		recipeName,
		cookingTime,
		mealType,
		});
	
		const recipesResponse = await db.query(
		`SELECT id,
				recipe_name AS "recipeName",
				prep_time AS "prepTime",
				cooking_time AS "cookingTime",
				recipe_image AS "recipeImage",
				meal_type AS "mealType"
		FROM recipes ${whereClause}
		ORDER BY id 
		LIMIT 10
		OFFSET $${values.length + 1}`,
		[...values, skip]
		);
	
		return recipesResponse.rows;
	}

    /**
     * Given a recipe id, return data about recipe.
     * 
     * Throws NotFoundError if not found.
     * 
     * @param {number} id 
     * @returns {Promise<GetRecipe[]>}
     */
    public static async getRecipe(id: number): Promise<GetRecipe[]> {
        const response = await db.query(
            `SELECT rec.id,
                    rec.recipe_name AS "recipeName",
                    rec.prep_time AS "prepTime",
                    rec.cooking_time AS "cookingTime",
                    rec.recipe_image AS "recipeImage",
                    rec.meal_type AS "mealType",
                    rec.instructions,
                    ri.amount,
                    mu.id AS "measurementId",
                    mu.measurement_description AS "measurement",
                    ingredients.id AS "ingredientId",
                    ingredients.ingredient_name AS "ingredient"
            FROM recipes rec
                INNER JOIN 
                    recipe_ingredients ri ON rec.id = ri.recipe_id
                INNER JOIN 
                    ingredients ON ingredients.id = ri.ingredient_id
                LEFT JOIN 
                    measurement_units mu ON mu.id = ri.measurement_id
            WHERE rec.id = $1`,[id]);

        if (!response.rows.length) throw new NotFoundError(`No recipe: ${id}`);

        return response.rows;
    }

    /**
     * Given a ingredient id, return data about ingredient.
     * 
     * Throws NotFoundError if not found. 
     * @param {number} id 
     * @returns {Promise<{ ingredient: string }>}
     */
    public static async getIngredient(id: number): Promise<{ ingredient: string }> {
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
    public static async updateRecipe(id: number, data: {
        recipeName: string;
        prepTime: string;
        cookingTime: string;
        recipeImage: string;
        mealType: string;
        instructions: string;
    }): Promise<{ id: number; recipeName: string }> {
       
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
    public static async updateRecipeIngredients(id: number, data: {
        amount: number;
        measurementId?: number;
        measurement?: string;
        ingredientId: number;
        ingredient: string;
    }) {

        const columnsToSql =  {
            recipeId: "recipe_id",
            measurementId: "measurement_id", 
            ingredientId: "ingredient_id"
        };

        const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);

        const result = await db.query(
            `UPDATE recipe_ingredients 
             SET ${setCols}
             WHERE recipe_id = $${values.length + 1}
             RETURNING recipe_id AS "recipeId", 
                    measurement_id AS "measurementId",
                    ingredient_id AS "ingredientId", 
                    amount`,[...values, id]);

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
    public static async removeRecipe(id: number): Promise<void> {
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
    public static async removeIngredient(id: number): Promise<void> {
        const result = await db.query(
            `DELETE
             FROM ingredients
             WHERE id = $1
             RETURNING id`,[id]);

        const ingredient = result.rows[0];

        if (!ingredient) throw new NotFoundError(`No ingredient: ${id}`);
    }

    /** Delete given ingredient from database; returns undefined.
     * 
     * Throws NotFoundError if ingredient not found.
     * @param {Object} data 
     */
     public static async removeRecipeIngredients(data : {    
        amount: number;
        measurementId?: number;
        measurement?: string;
        ingredientId?: number;
        ingredient: string;}): Promise<void> {

        const columnsToSql = {
            recipeId: "recipe_id",
            measurementId: "measurement_id",
            ingredientId: "ingredient_id"
        };

        const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);
        const deleteCols = setCols.split(',');

        const result = await db.query(
            `DELETE
             FROM recipe_ingredients
             WHERE ${deleteCols.join(' AND ')}
             RETURNING recipe_id`,[...values]);

        const recipeIngredient = result.rows[0];
       
        if (!recipeIngredient) throw new NotFoundError(`No recipeIngredient`);
    }


    // static async handleUpdates(recipeId, data) {
    //     const ingredientList = data?.ingredients; 

    //     delete data?.ingredients; 

    //     const updatedRecipe = await this.updateRecipe(recipeId, data); 

    //     if (updatedRecipe && ingredientList.length) {
    //         await Promise.all(ingredientList.map( async (recipeList) => {

    //             let updateWhere = ''; 
    //             let values = [recipeId, recipeList.ingredientId];

    //             if (recipeList?.measurementId) {
    //                 updateWhere = ' AND measurement_id = $3';
    //                 values.push(recipeList.measurementId);
    //             }

    //             const response = await db.query(
    //                 `SELECT recipe_id, 
    //                         measurement_id,
    //                         ingredient_id
    //                 FROM recipe_ingredients 
    //                 WHERE recipe_id = $1 AND ingredient_id = $2 ${updateWhere}`,
    //                 [...values]);

    //             if (response) {
    //                 await this.updateRecipeIngredients(recipeList, recipeId);
    //             }
                
    //         }));
    //     }


    //     return data;
    // }

}

export default RecipeModel;