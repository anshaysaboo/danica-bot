const { sendMessage } = require("./messaging.js");
const { generateGreeting } = require("./greetings.js");

exports.respondToMessage = ({ text, from }) => {
  text = text.toLowerCase().trim();
  if (text === "thank you danica") {
    sendMessage("DANICA: At your service, Mr. Saboo.", from);
  } else if (text === "hey danica" || text === "hey" || text === "Hello") {
    sendMessage(
      "DANICA: " + generateGreeting() + " What can I do for you today?",
      from
    );
  } else if (text === "hello there") {
    sendMessage("General Kenobi?", from);
  }
};
