const jsonschema = require("jsonschema");
const { uploadRecipeImage } = require("../aws/s3");
const Recipe = require("../models/recipe.js");

const recipeNewSchema = require("../schemas/recipeNew.json");
const recipeSearchSchema = require("../schemas/recipeSearch.json");

async function recipeCreate(req, res, next) {
    const validator = jsonschema.validate(req.body, recipeNewSchema);

    if(!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        console.log(errs, 'error');
        return res.status(400).json({ errors: errs });
    }

    const recipe = await Recipe.insertRecipe(req.body);
    
    const { ingredientList } = req.body; 
    const recipeIngregients = JSON.parse(ingredientList);

    recipe.ingredients = await Promise.all(recipeIngregients.map( 
        async (list) => await Recipe._ingredientBuilder(list, recipe.id)));
    
    return res.status(201).json({ recipe });
}

async function recipeGet(req, res) {
    const recipeQuery = req.query; 

    const validator = jsonschema.validate(recipeQuery, recipeSearchSchema);

    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        return res.status(400).json({ errors: errs });
    }

    if (recipeQuery?.cookingTime) {
        recipeQuery.cookingTime = Number(recipeQuery.cookingTime);
    };

    if (recipeQuery?.skip) {
        recipeQuery.skip = Number(recipeQuery.skip);
    } else {
        recipeQuery['skip'] = 0;
    }

    const recipes = await Recipe.findAll(recipeQuery);
    return res.json({ recipes });
}

async function recipeGetIndividual(req, res) {
    const recipe = await Recipe.getRecipe(req.params.id);
    return res.json({ recipe });
}

async function recipeUploadPhoto(req, res) {
    const image = req.file || '';
    const urlResponse = await uploadRecipeImage(image);

    if (image) await unlinkFile(image.path);

    return res.status(201).json({ url: urlResponse });
}

async function recipeUpdate(req, res) {
    const recipe = await Recipe.handleUpdates(req.params.id, req.body);
    return res.json({ recipe });
}

async function recipeDelete(req, res) {
    await Recipe.removeRecipe(req.params.id);
    return res.json({ deleted: req.params.id });
}


module.exports = {
    recipeCreate,
    recipeGet,
    recipeGetIndividual,
    recipeUploadPhoto,
    recipeUpdate,
    recipeDelete
}