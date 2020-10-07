const axios = require("axios");
const freeClimbSDK = require("@freeclimb/sdk");

exports.sendMessage = async (text, receiver) => {
  try {
    var accountID = process.env.FREECLIMB_ACCOUNT_ID;
    var authToken = process.env.FREECLIMB_AUTH_TOKEN;
    var fc = freeClimbSDK(accountID, authToken);
    var from = process.env.FREECLIMB_PHONE_NUMBER;
    fc.api.messages.create(from, receiver, text);
  } catch (err) {
    console.error(err.response.data.message);
  }
};
