"use strict";

const app = require("./app");
const { PORT } = require("./configs/general");

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
