require("dotenv").config();
const moment = require("moment");
const { reserveGym } = require("./src/reserve.js");

exports.startReserveTask = () => {
  if (
    moment().format("dddd") !== "Saturday" &&
    moment().format("dddd") !== "Sunday"
  ) {
    // Make three attempts to book a session if it fails
    reserveGym(3);
  }
};
