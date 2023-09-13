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
} = require("../controller/recipeController");

const upload = multer({ dest: "uploads/"});
const router = new express.Router();

router.get("/", recipeGetAll);
router.get("/:id", recipeGetIndividual);

router.post("/", recipeCreate);
router.post("/image", upload.single('recipeImage'), recipeUploadPhoto); 

router.patch("/:id", recipeUpdate);

router.delete("/:id", recipeDelete);

module.exports = router; 