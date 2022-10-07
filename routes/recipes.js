"use strict";

/** Routes for recipes. */
const jsonschema = require("jsonschema");
const express = require("express");
const multer  = require('multer')

const { BadRequestError } = require("../expressError");
const { uploadRecipeImage } = require("../aws/s3");
const Recipe = require("../models/recipe");

const recipeNewSchema = require("../schemas/recipeNew.json");
const recipeSearchSchema = require("../schemas/recipeSearch.json");
const upload = multer({ dest: "uploads/"});

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const router = new express.Router();


/** POST / { recipe } =>  { recipe }
 * 
 * recipe req.body: { recipeName, prepTime, cookingTime, recipeImage, 
 *                instructions, mealType, ingredientList }
 *        req.fle: { recipeImage } 
 * 
 */
router.post("/", upload.single('recipeImage'), async function (req, res, next) {
    const validator = jsonschema.validate(req.body, recipeNewSchema);

    if(!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        return res.status(400).json({ errors: errs });
    }

    const { ingredientList } = req.body; 

    const recipe = await Recipe.insertRecipe(req.body);

    recipe.ingredients = await Promise.all(ingredientList.map( 
        async (list) => await Recipe._ingredientBuilder(list, recipe.id)));
    
    return res.status(201).json({ recipe });

});

router.post("/image", upload.single('recipeImage'), async function(req, res) {
    const image = req.file || '';
    const urlResponse = await uploadRecipeImage(image);

    if (image) await unlinkFile(image.path);

    return res.status(201).json({ url: urlResponse });
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
        return res.status(400).json({ errors: errs });
    }

    if (recipeQuery?.cookingTime) {
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


/** PATCH /[id] 
 * 
 */
router.patch("/:id", async function(req, res) {
    const recipe = await Recipe.handleUpdates(req.params.id, req.body);
    return res.json({ recipe });
})

/** DELETE /[id] => { deleted: id } 
 * 
 */
router.delete("/:id", async function (req, res) {
    await Recipe.removeRecipe(req.params.id);
    return res.json({ deleted: req.params.id });
})

module.exports = router; 