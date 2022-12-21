"use strict";

const app = require("./app");
const { PORT } = require("./config/config");

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
