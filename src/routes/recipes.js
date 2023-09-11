"use strict";

/** Routes for recipes. */
const express = require("express");
const multer  = require('multer')
const { 
    recipeCreate, 
    recipeGetAll, 
    recipeGetIndividual, 
    recipeUploadPhoto,
    recipeUpdate,
    recipeDelete 
} = require("../controller/recipe");

const upload = multer({ dest: "uploads/"});
const router = new express.Router();


/** POST / { recipe } =>  { recipe }
 * 
 * recipe req.body: { recipeName, prepTime, cookingTime, recipeImage, 
 *                instructions, mealType, ingredientList }
 *        req.fle: { recipeImage } 
 * 
 */
router.post("/", recipeCreate);

router.post("/image", upload.single('recipeImage'), recipeUploadPhoto); 

/** GET / =>  
 *
 * { recipes: [{ id, recipeName, prepTime, cookingTime, recipeImage, mealType },
 * ... ]}
 * 
 * Can filter on provided search filters:
 *  - recipeName (will find case-insensitxive, partial matches)
 *  - mealType 
 *  - cookingTime
 * 
 * Authorization required: none
 * 
 */
router.get("/", recipeGetAll);

/** GET /[id]  =>  { recipe }
 *
 *  Recipe is [{ id, recipeName, prepTime, cookingTime, recipeImage, mealType,
 *              amount, measurementDescription, ingredientName  }]
 *
 * Authorization required: none
 */
router.get("/:id", recipeGetIndividual);


/** PATCH /[id] 
 * 
 */
router.patch("/:id", recipeUpdate);

/** DELETE /[id] => { deleted: id } 
 * 
 */
router.delete("/:id", recipeDelete);

module.exports = router; 