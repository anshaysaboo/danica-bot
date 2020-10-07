require("dotenv").config();
const moment = require("moment");
const { reserveGym } = require("./src/reserve.js");

exports.startReserveTask = () => {
  if (
    moment().format("dddd") !== "Saturday" &&
    moment().format("dddd") !== "Sunday"
  ) {
    reserveGym();
  }
};
