require("dotenv").config();
const { getMenu } = require("./src/controllers/menu/getMenu.js");

// Force start the reserve task, without checking the date first
getMenu();
