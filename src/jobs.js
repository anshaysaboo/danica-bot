// Schedule recurring task for midnight
var CronJob = require("cron").CronJob;

const { startReserveTask } = require("./controllers/reserve/reserveTask.js");
const { sendMenu } = require("./controllers/menu/sendMenu.js");

const RECEIVER_PHONE = process.env.USER_PHONE;

// Reserve the gym at midnight every night
var reserveJob = new CronJob(
  process.env.SCHEDULE_CRON || "0 0 * * *",
  () => {
    startReserveTask();
  },
  null,
  true,
  "America/Los_Angeles"
);
reserveJob.start();

// Send the Local Point menu twice a day, once at 12:00pm and once at 5:45pm.
var lunchMenuJob = new CronJob(
  "00 12 * * *",
  () => {
    sendMenu();
  },
  null,
  true,
  "America/Los_Angeles"
);
lunchMenuJob.start();

var dinnerMenuJob = new CronJob(
  "45 17 * * *",
  () => {
    sendMenu();
  },
  null,
  true,
  "America/Los_Angeles"
);
dinnerMenuJob.start();
