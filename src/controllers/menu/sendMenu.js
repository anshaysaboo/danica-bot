const { getMenu } = require("./getMenu.js");
const { sendMessage } = require("../messages/messaging.js");
const { generateGreeting } = require("../messages/greetings.js");

const RECEIVER_PHONE = process.env.USER_PHONE;

// Sends the current Local Point menu to the user via text message
exports.sendMenu = async () => {
  const menuString = await getMenu();
  sendMessage(
    generateGreeting() +
      " Here's what's cooking at Local Point now: \n" +
      menuString,
    RECEIVER_PHONE
  );
};
