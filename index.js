require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const moment = require("moment");

const { activateIntent } = require("./src/intents/index.js");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());

// Endpoint to receive text messages
app.post("/sms-hook", (req, res) => {
  activateIntent(req.body);
  res.send(200);
});

// Schedule Cron Jobs
require("./src/jobs.js");

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log("Listening on port " + PORT);
});
