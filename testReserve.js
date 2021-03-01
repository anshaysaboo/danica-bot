require("dotenv").config();
const { attemptReserveGym } = require("./src/controllers/reserve/reserve.js");

// Force start the reserve task, without checking the date first
attemptReserveGym(3);
