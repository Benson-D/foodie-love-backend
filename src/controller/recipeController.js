const jsonschema = require("jsonschema");
const { uploadImageToS3 } = require("../aws/s3");
const RecipeModel = require("../models/recipeModel.js");

const recipeNewSchema = require("../schemas/recipeNew.json");
const recipeSearchSchema = require("../schemas/recipeSearch.json");

const { BadRequestError } = require("../utils/expressError");


async function recipeCreate(req, res, next) {
    const validator = jsonschema.validate(req.body, recipeNewSchema);

    if(!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        console.log(errs, 'error');
        return res.status(400).json({ errors: errs });
    }

    const recipe = await RecipeModel.insertRecipe(req.body);
    
    const { ingredientList } = req.body; 
    const recipeIngregients = JSON.parse(ingredientList);

    recipe.ingredients = await Promise.all(recipeIngregients.map( 
        async (list) => await RecipeModel._ingredientBuilder(list, recipe.id)));
    
    return res.status(201).json({ recipe });
}

async function recipeGetAll(req, res) {
    const recipeQuery = req.query; 

    if (recipeQuery?.skip) {
        recipeQuery.skip = Number(recipeQuery.skip);
    } else {
        recipeQuery['skip'] = 0;
    }
    
    if (recipeQuery?.cookingTime) {
        recipeQuery.cookingTime = Number(recipeQuery.cookingTime);
    };

    const validator = jsonschema.validate(recipeQuery, recipeSearchSchema);

    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        return res.status(400).json({ errors: errs });
    }

    const recipes = await RecipeModel.findAll(recipeQuery);
    return res.json({ recipes });
}

async function recipeGetIndividual(req, res) {
    const recipe = await RecipeModel.getRecipe(req.params.id);
    return res.json({ recipe });
}

async function recipeUploadPhoto(req, res) {
    const image = req.file || '';
    const urlResponse = await uploadImageToS3(image);

    if (image) await unlinkFile(image.path);

    return res.status(201).json({ url: urlResponse });
}

async function recipeUpdate(req, res) {
    const recipe = await RecipeModel.handleUpdates(req.params.id, req.body);
    return res.json({ recipe });
}

async function recipeDelete(req, res) {
    await RecipeModel.removeRecipe(req.params.id);
    return res.json({ deleted: req.params.id });
}

async function _ingredientBuilder(recipeItems, recipeId){
    if (typeof recipeId !== 'number') {
        throw new BadRequestError('Not a valid id');
    }
    
    const { amount, measurement, ingredient } = recipeItems;
    
    const measurementId = await insertMeasurement(measurement);
    const ingredientId = await insertIngredient(ingredient);
    const parsedAmount = parseRecipeAmount(amount);
    
    const recipeData = { 
        recipeId: recipeId, 
        measurementId: measurementId,
        ingredientId: ingredientId, 
        amount: parsedAmount
    };
    
    const result = await RecipeModel.insertRecipeIngredients(recipeData);
    return result;
}

function parseRecipeAmount(amount) {
    if (amount.includes('/')) {
        amount = amount.split('/')
                       .reduce((total, amount) => Number(total) / Number(amount));
    }

    return parseFloat(parsedAmount);
}

async function insertIngredient(ingredient) {
    const response = await RecipeModel.insertIngredients(ingredient);
    return response.id;
}

async function insertMeasurement(measurement) {
    const response = await RecipeModel.insertMeasurements(measurement);
    return response?.id ?? '';
}



module.exports = {
    recipeCreate,
    recipeGetAll,
    recipeGetIndividual,
    recipeUploadPhoto,
    recipeUpdate,
    recipeDelete
}