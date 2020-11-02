require("dotenv").config();
const { reserveGym } = require("./src/reserve.js");

// Force start the reserve task, without checking the date first
reserveGym();
