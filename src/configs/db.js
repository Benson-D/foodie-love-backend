"use strict";

/** Database setup for foodie-love. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./general");

const db = new Client({
  connectionString: getDatabaseUri(),
});

db.connect();

module.exports = db;
