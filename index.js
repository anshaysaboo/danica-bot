require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const moment = require("moment");

const {
  startReserveTask,
} = require("./src/controllers/reserve/reserveTask.js");
const {
  respondToMessage,
} = require("./src/controllers/messages/messageResponse.js");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());

// Endpoint to receive text messages
app.post("/sms-hook", (req, res) => {
  if (req.body.text.toLowerCase().trim() === "book me a session") {
    startReserveTask();
  } else {
    respondToMessage(req.body);
  }
  res.send(200);
});

// Schedule recurring task for midnight
var CronJob = require("cron").CronJob;
var job = new CronJob(
  process.env.SCHEDULE_CRON || "0 0 * * *",
  () => {
    startReserveTask();
  },
  null,
  true,
  "America/Los_Angeles"
);
job.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log("Listening on port " + PORT);
});
