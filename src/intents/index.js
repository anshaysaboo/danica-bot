// Calls the correct intent based on the input text file
const Menu = require("./menu.js");
const Reserve = require("./reserve.js");
const SmallTalk = require("./smalltalk.js");

const INTENTS = [Menu, Reserve];

exports.activateIntent = ({ text, from }) => {
  message = text.toLowerCase().trim();
  for (let i = 0; i < INTENTS.length; i++) {
    if (INTENTS[i].keys.includes(message)) {
      INTENTS[i].run(message, from);
      return;
    }
  }

  SmallTalk.run(text, from);
};
