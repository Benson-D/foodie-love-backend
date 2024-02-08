import { type Request, type Response } from "express";
import UserModel from "../models/UserModel";
import { validate } from "jsonschema";
import * as favoriteRecipe from "../schemas/favoriteRecipe.json";

class UserController {
  /**
   * Adds or deletes a users favorite recipe to the db.
   * @param req
   * @param res
   * @returns
   */
  public static async addOrDeleteFavoriteRecipe(req: Request, res: Response) {
    const validator = validate(req.query, favoriteRecipe);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      console.log(errs, "error");
      return res.status(400).json({ errors: errs });
    }

    const userId = req.query.userId as string;
    const recipeId = req.query.recipeId as string;

    const findFavoriteRecipe = await UserModel.findFavoriteRecipe(
      userId,
      recipeId,
    );

    if (findFavoriteRecipe) {
      const deleteFavoriteRecipe = await UserModel.deleteFavoriteRecipe(
        userId,
        recipeId,
      );
      return res.status(201).json({ deleted: deleteFavoriteRecipe });
    } else {
      const addFavoriteRecipe = await UserModel.addFavoriteRecipe(
        userId,
        recipeId,
      );
      return res.status(201).json({ added: addFavoriteRecipe });
    }
  }
}

export default UserController;
