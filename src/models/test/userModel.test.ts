// "use strict";

// import db from "../../configs/db";
// import {
//   BadRequestError,
//   NotFoundError,
//   UnauthorizedError,
// } from "../../utils/expressError";
// import UserModel from "../UserModel";

// import {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   recipeIds,
//   ingredientIds,
//   userIds,
// } from "./_testCommon";

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
// afterAll(commonAfterAll);

// /******************************* authenticate *********************************/
// describe("authenticate", function () {
//   test("works", async function () {
//     const user = await UserModel.authenticate("u1", "password1");
//     expect(user).toEqual({
//       username: "u1",
//       firstName: "U1F",
//       lastName: "U1L",
//       email: "u1@email.com",
//       isAdmin: false,
//     });
//   });

//   test("unauth if no such user", async function () {
//     try {
//       await UserModel.authenticate("nope", "password");
//       fail();
//     } catch (err) {
//       expect(err instanceof UnauthorizedError).toBeTruthy();
//     }
//   });

//   test("unauth if wrong password", async function () {
//     try {
//       await UserModel.authenticate("c1", "wrong");
//       fail();
//     } catch (err) {
//       expect(err instanceof UnauthorizedError).toBeTruthy();
//     }
//   });
// });

// /************************************** register ******************************/
// describe("register user", function () {
//   const newUser = {
//     username: "new",
//     firstName: "Test",
//     lastName: "Tester",
//     email: "test@test.com",
//     isAdmin: false,
//   };

//   test("works", async function () {
//     const user = await UserModel.register({
//       ...newUser,
//       password: "password",
//     });
//     expect(user).toEqual(newUser);
//     const found = await db.query("SELECT * FROM users WHERE username = 'new'");
//     expect(found.rows.length).toEqual(1);
//     expect(found.rows[0].is_admin).toEqual(false);
//     expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
//   });

//   test("works: adds admin", async function () {
//     const user = await UserModel.register({
//       ...newUser,
//       password: "password",
//       isAdmin: true,
//     });
//     expect(user).toEqual({ ...newUser, isAdmin: true });
//     const found = await db.query("SELECT * FROM users WHERE username = 'new'");
//     expect(found.rows.length).toEqual(1);
//     expect(found.rows[0].is_admin).toEqual(true);
//     expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
//   });

//   test("bad request with dup data", async function () {
//     try {
//       await UserModel.register({
//         ...newUser,
//         password: "password",
//       });
//       await UserModel.register({
//         ...newUser,
//         password: "password",
//       });
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** findAll *******************************/
// describe("findAll users", function () {
//   test("works", async function () {
//     const users = await UserModel.findAll();
//     expect(users).toEqual([
//       {
//         username: "u1",
//         firstName: "U1F",
//         name: "U1F U1L",
//         email: "u1@email.com",
//         isAdmin: false,
//       },
//       {
//         username: "u2",
//         firstName: "U2F",
//         name: "U2F U2L",
//         email: "u2@email.com",
//         isAdmin: false,
//       },
//     ]);
//   });
// });

// /************************************** get ***********************************/
// describe("get", function () {
//   test("works", async function () {
//     const user = await UserModel.get("u1");

//     expect(user).toEqual({
//       id: userIds[0],
//       username: "u1",
//       firstName: "U1F",
//       lastName: "U1L",
//       email: "u1@email.com",
//       isAdmin: false,
//       recipes: [recipeIds[0]],
//       groceries: [ingredientIds[0]],
//     });
//   });

//   test("not found if no such user", async function () {
//     try {
//       await UserModel.get("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update ********************************/
// describe("update", function () {
//   const updateData = {
//     firstName: "NewF",
//     lastName: "NewF",
//     email: "new@email.com",
//     isAdmin: true,
//   };

//   test("works", async function () {
//     const job = await UserModel.update("u1", updateData);
//     expect(job).toEqual({
//       username: "u1",
//       ...updateData,
//     });
//   });

//   test("works: set password", async function () {
//     const job = await UserModel.update("u1", {
//       password: "new",
//     });
//     expect(job).toEqual({
//       username: "u1",
//       firstName: "U1F",
//       lastName: "U1L",
//       email: "u1@email.com",
//       isAdmin: false,
//     });
//     const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
//     expect(found.rows.length).toEqual(1);
//     expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
//   });

//   test("not found if no such user", async function () {
//     try {
//       await UserModel.update("nope", {
//         firstName: "test",
//       });
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request if no data", async function () {
//     expect.assertions(1);
//     try {
//       await UserModel.update("c1", {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove ********************************/
// describe("remove", function () {
//   test("works", async function () {
//     await UserModel.remove("u1");
//     const res = await db.query("SELECT * FROM users WHERE username='u1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such user", async function () {
//     try {
//       await UserModel.remove("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
