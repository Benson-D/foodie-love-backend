const request = require("supertest");
const app = require("../app");
const db = require("../config/db.js");

describe("test connection of app", function() {
    test("not found site 404", async function() {
        const response = await request(app).get('/no-link');
        expect(response.statusCode).toEqual(404);
    })
});

afterAll(function () {
    db.end();
  });
  