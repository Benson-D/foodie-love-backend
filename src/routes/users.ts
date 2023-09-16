import UserModel from "../models/userModel";
import { createToken } from "../utils/token";
import  { Router } from "express";

const router: Router = Router();

router.post("/", async function (req, res) {
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