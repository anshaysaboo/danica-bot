require("dotenv").config();
const moment = require("moment");
const { attemptReserveGym } = require("./reserve.js");

exports.startReserveTask = () => {
  if (
    moment().format("dddd") !== "Saturday" &&
    moment().format("dddd") !== "Sunday"
  ) {
    // Make three attempts to book a session if it fails
    attemptReserveGym(5);
  }
};
