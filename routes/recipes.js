"use strict";

/** Routes for recipes. */
const jsonschema = require("jsonschema");
const express = require("express");
const multer  = require('multer')

const { BadRequestError } = require("../expressError");
const { uploadRecipeImage } = require("../aws/s3");
const Recipe= require("../models/recipe");

const recipeNewSchema = require("../schemas/recipeNew.json");
const recipeSearchSchema = require("../schemas/recipeSearch.json");

const router = new express.Router();

const upload = multer({ dest: "uploads/"});

/** POST / { recipe } =>  { recipe }
 * 
 * recipe req.body: { recipeName, prepTime, cookingTime, recipeImage, 
 *                instructions, mealType, ingredientList }
 *        req.fle: { recipeImage } 
 * 
 */
router.post("/", upload.single('recipeImage'), async function (req, res) {
    const validator = jsonschema.validate(req.body, recipeNewSchema);

    if(!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const { ingredientList } = req.body;

    req.body.recipeImage = await uploadRecipeImage(req.file); 
        
    let recipe = await Recipe.insertRecipe(req.body);
    
    const recipeList = await Promise.all(ingredientList.map( async (recipeList) => {
        return await Recipe._ingredientBuilder(recipeList, recipe.id)
    }));

    return res.status(201).json({ recipeList });

});

/** GET / =>  
 *
 * { recipes: [{ id, recipeName, prepTime, cookingTime, recipeImage, mealType },
 * ... ]}
 * 
 * Can filter on provided search filters:
 *  - recipeName (will find case-insensitive, partial matches)
 *  - mealType 
 *  - cookingTime
 * 
 * Authorization required: none
 * 
 */
router.get("/", async function (req, res) {
    const recipeQuery = req.query; 

    const validator = jsonschema.validate(recipeQuery, recipeSearchSchema);

    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    if (recipeQuery.cookingTime !== undefined) {
        recipeQuery.cookingTime = Number(recipeQuery.cookingTime);
    };

    const recipes = await Recipe.findAll(recipeQuery);
    return res.json({ recipes });
});

/** GET /[id]  =>  { recipe }
 *
 *  Recipe is [{ id, recipeName, prepTime, cookingTime, recipeImage, mealType,
 *              amount, measurementDescription, ingredientName  }]
 *
 * Authorization required: none
 */
router.get("/:id", async function (req, res) {

    const recipe = await Recipe.getRecipe(req.params.id);
    return res.json({ recipe });
});

/** DELETE /[id] => { deleted: id } 
 * 
 */
router.delete("/:id", async function (req, res) {
    await Recipe.removeRecipe(req.params.id);
    
    return res.json({ deleted: req.params.id });
})

module.exports = router; 