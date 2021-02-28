const {
  respondToMessage,
} = require("../controllers/messages/messageResponse.js");

// Handles general responses to messages, allows bot to have "small talk"
const run = async (message, from) => {
  respondToMessage(message, from);
};

// Lowercased key messages to activate this intent
const keys = [];

module.exports = {
  run,
  keys,
};
