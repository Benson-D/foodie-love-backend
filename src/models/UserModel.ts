import { prisma } from "../configs/prismaClient";
import { NotFoundError } from "../utils/expressError";

class UserModel {
  private static userGeneralSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    email: true,
    imageUrl: true,
    role: true,
  };

  public static async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: this.userGeneralSelect,
    });

    return user;
  }

  public static async findByGoogleId(googleId: string) {
    const user = await prisma.user.findUnique({
      where: {
        googleId: googleId,
      },
      select: this.userGeneralSelect,
    });

    return user;
  }

  public static async createGoogleUser(defaultUser: {
    googleId: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
  }) {
    const createdGoogleUser = await prisma.user.create({
      data: {
        googleId: defaultUser.googleId,
        firstName: defaultUser.firstName,
        lastName: defaultUser.lastName,
        email: defaultUser.email,
        imageUrl: defaultUser.imageUrl,
        role: "CLIENT",
      },
      select: this.userGeneralSelect,
    });

    return createdGoogleUser;
  }

  public static async findOrCreateGoogleUser(
    googleId: string,
    defaultUser: {
      googleId: string;
      firstName: string;
      lastName: string;
      email: string;
      imageUrl: string;
    },
  ) {
    const foundGoogleUser = await this.findByGoogleId(googleId);

    if (foundGoogleUser) {
      return foundGoogleUser;
    }

    const createGoogleUser = await this.createGoogleUser(defaultUser);
    return createGoogleUser;
  }

  /**
   * Adds a users favorite recipe to `UserFavoriteRecipe` table
   * @param id
   * @param recipeId
   * @returns
   */
  public static async addFavoriteRecipe(id: string, recipeId: string) {
    const foundUserId = await this.findById(id);
    const foundRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!foundUserId)
      throw new NotFoundError(`No user with found with id: ${id}`);
    if (!foundRecipe) throw new NotFoundError(`No recipe with id: ${recipeId}`);

    const addFavorite = await prisma.userFavoriteRecipe.create({
      data: {
        userId: foundUserId.id,
        recipeId: foundRecipe.id,
      },
    });

    return addFavorite;
  }

  /**
   * Adds a users grocery item to `UserGrocery` table
   * @param id
   * @param ingredientId
   * @returns
   */
  public static async addGroceryItem(id: string, ingredientId: string) {
    const foundUserId = await this.findById(id);
    const foundRecipe = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!foundUserId)
      throw new NotFoundError(`No user with found with id: ${id}`);
    if (!foundRecipe)
      throw new NotFoundError(`No ingredient with id: ${ingredientId}`);

    const addGroceryItem = await prisma.userGrocery.create({
      data: {
        userId: foundUserId.id,
        itemId: ingredientId,
      },
    });

    return addGroceryItem;
  }
}

export default UserModel;
