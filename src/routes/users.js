"use strict"; 

/** Routes for users. */
const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../error/expressError");
const UserModel = require("../models/userModel");
const { createToken } = require("../utils/tokens");
const { router } = require("../app");

router.post("/", async function (req, res, next) {
   const user = await UserModel.register(req.body);
   const token = createToken(user); 

   return res.status(201).json({ user, token });
});

router.get("/", async function (req, res, next) {
    try {
        const users = UserModel.findAll();
        return res.json({ users });
    } catch (err) {
        return next(err)
    }
});

router.get("/:username", async function(req, res, next) {
    try {
        const user = UserModel.get(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err); 
    }
});