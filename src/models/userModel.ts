import bcrypt from "bcrypt";
import db from "../configs/db";
import { BCRYPT_WORK_FACTOR } from "../configs/general";
import { sqlForPartialUpdate } from "../utils/sql";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../utils/expressError";

class UserModel {
  /**
   * Authenticate user with username, password.
   *
   * Throws UnauthorizedError if user not found or wrong password,
   * else returns specific data on that user
   *
   * @param {string} username - unique username to self identify
   * @param {string} password - password to login account
   * @returns {Promise<string>} JSON
   * [{ username, first_name, last_name, email, is_admin }]
   */
  public static async authenticate(
    username: string,
    password: string,
  ): Promise<{
    username: string;
    firstName: string;
    lastName: string;
    email: string | undefined;
    isAdmin: boolean;
  }> {
    const result = await db.query(
      `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
            FROM users
            WHERE username = $1`,
      [username],
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);

      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid/ username/password");
  }

  /**
   * Register user with data.
   *
   * If user already exist, Throws BadRequestError,
   * If new user registers into the database with hashed credentials
   *
   * @param {*} userData
   * @return {Promise<string>} [{ username, firstName, lastName, email, isAdmin }]
   */
  public static async register(userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string | undefined;
    isAdmin: boolean;
  }): Promise<{
    username: string;
    firstName: string;
    lastName: string;
    email: string | undefined;
  }> {
    const { username, password, firstName, lastName, email, isAdmin } =
      userData;

    const duplicateCheck = await db.query(
      `SELECT username
             FROM users
             WHERE username = $1`,
      [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
            (username, password, first_name, last_name, email, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING username, 
                    first_name AS "firstName", 
                    last_name AS "lastName", 
                    email, 
                    is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, isAdmin],
    );

    const user = result.rows[0];
    return user;
  }

  /**
   * Find all users from recipe database
   *
   * @returns {Promise<string>} JSON
   */
  public static async findAll(): Promise<
    {
      username: string;
      firstName: string;
      name: string;
      email: string;
      isAdmin: boolean;
    }[]
  > {
    const users = await db.query(
      `SELECT username,
              first_name AS "firstName",
              CONCAT (first_name, ' ', last_name) AS "name",
              email,
              is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return users.rows;
  }

  public static async findById(googleId: string) {
    const userRes = await db.query(
      `SELECT username,
              google_id AS "googleId",
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              image_url AS "imageUrl",
              is_admin AS "isAdmin"
         FROM users
         WHERE google_id = $1`,
      [googleId],
    );

    const user = userRes.rows[0];
    return user;
  }

  public static async findOrCreate(
    googleId: string,
    defaultUser: {
      googleId: string;
      firstName: string;
      lastName: string;
      email: string;
      imageUrl: string;
      isAdmin?: boolean;
    },
  ): Promise<{
    username: string;
    googleId: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    isAdmin: boolean;
  }> {
    let user = await this.findById(googleId);

    if (!user) {
      const { googleId, firstName, lastName, email, imageUrl, isAdmin } =
        defaultUser;

      const result = await db.query(
        `INSERT INTO users
              (google_id, first_name, last_name, email, image_url, is_admin)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING google_id AS "googleId", 
                      first_name AS "firstName", 
                      last_name AS "lastName", 
                      email,
                      is_admin AS "isAdmin"`,
        [googleId, firstName, lastName, email, imageUrl, isAdmin ?? false],
      );

      user = result.rows[0];
    }

    return user;
  }

  /**
   * Function grabs username and retrieves account
   * @param {string} username - unique username to self identify
   * @returns {Promise<string>} JSON
   * [{ username, first_name, last_name, email, is_admin }]
   */
  public static async get(username: string) {
    const userRes = await db.query(
      `SELECT id,
              username,
                first_name AS "firstName",
                last_name AS "lastName",
                email,
                is_admin AS "isAdmin"
         FROM users
         WHERE username = $1`,
      [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userRecipes = await db.query(
      `SELECT recipe_id
           FROM users_recipes 
           WHERE user_id = $1`,
      [user.id],
    );

    const userIngredienets = await db.query(
      `SELECT ingredient_id
           FROM users_groceries 
           WHERE user_id = $1`,
      [user.id],
    );

    user.recipes = userRecipes.rows.map(
      (u: { recipe_id: number }) => u.recipe_id,
    );
    user.groceries = userIngredienets.rows.map(
      (u: { ingredient_id: number }) => u.ingredient_id,
    );

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */
  public static async update(
    username: string,
    data: {
      username?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const columnsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };

    const { setCols, values } = sqlForPartialUpdate(data, columnsToSql);
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /**
   * Delete given user from database; returns undefined.
   * @param {string} username
   */
  public static async remove(username: string): Promise<void> {
    const result = await db.query(
      `DELETE
        FROM users
        WHERE username = $1
        RETURNING username`,
      [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /**
   * UserModel adds a recipe to their list of favorites, makes a db relationship
   * @param {string} username
   * @param {Number} recipeId
   */
  public static async addRecipe(username: string, recipeId: number) {
    const checkRecipe = await db.query(
      `SELECT id
       FROM recipes
        WHERE id = $1`,
      [recipeId],
    );

    const recipe = checkRecipe.rows[0];

    if (!recipe) throw new NotFoundError(`No recipe: ${recipeId}`);

    const checkUser = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username],
    );

    const user = checkUser.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(
      `INSERT INTO user_recipes (username, recipe_id)
       VALUES ($1, $2)`,
      [username, recipeId],
    );
  }

  /**
   * UserModel adds a grocery ingredient list, makes a db relationship
   * @param {string} username
   * @param {Number} ingredientId
   */
  public static async addGrocery(username: string, ingredientId: number) {
    const checkIngredient = await db.query(
      `SELECT id
       FROM ingredients
        WHERE id = $1`,
      [ingredientId],
    );

    const ingredient = checkIngredient.rows[0];

    if (!ingredient) throw new NotFoundError(`No ingredient: ${ingredientId}`);

    const checkUser = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username],
    );

    const user = checkUser.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(
      `INSERT INTO user_groceries (username, ingredient_id)
       VALUES ($1, $2)`,
      [username, ingredientId],
    );
  }
}

export default UserModel;
