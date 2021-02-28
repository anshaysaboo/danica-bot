const { getMenu } = require("../controllers/menu/getMenu.js");

const { sendMessage } = require("../controllers/messages/messaging.js");
const { generateGreeting } = require("../controllers/messages/greetings.js");
const RECEIVER_PHONE = process.env.USER_PHONE;

// Handles intents related to retreving the menu at Local Point
// Fetches the current menu and sends it to the user
const run = async () => {
  try {
    const menuString = await getMenu();
    sendMessage(
      generateGreeting() +
        " Here's what's cooking at Local Point now: \n" +
        menuString,
      RECEIVER_PHONE
    );
  } catch (err) {
    console.error("FAILED TO GET MENU: " + err.message);
    sendMessage("No current menu found!", RECEIVER_PHONE);
  }
};

// Lowercased key messages to activate this intent
const keys = ["menu", "whats cooking", "what's cooking"];

module.exports = {
  run,
  keys,
};
