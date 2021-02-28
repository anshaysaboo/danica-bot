const { startReserveTask } = require("../controllers/reserve/reserveTask.js");

// Reserves the gym for the user
const run = async () => {
  startReserveTask();
};

// Lowercased key messages to activate this intent
const keys = ["book the gym", "book a session", "cop the gym", "gym"];

module.exports = {
  run,
  keys,
};
