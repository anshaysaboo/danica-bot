const puppeteer = require("puppeteer");
const moment = require("moment-timezone");

const {
  loginUserToBookingSite,
  selectGymSession,
  selectDateInOneWeek,
} = require("./utils.js");

const { sendMessage } = require("./messaging.js");
const { generateGreeting } = require("./greetings.js");
const RECEIVER_PHONE = process.env.USER_PHONE;

// Main method that carries out the steps in the reservation process
const reserveGym = async (attempts) => {
  const registrationDate = moment()
    .add(7, "days")
    .tz("America/Los_Angeles")
    .format("dddd, MMMM Do");
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "production",
    stealth: true,
    args: ["--no-sandbox"],
  });
  try {
    // Send message that attempt is starting
    console.log("Starting attempt. Attempts left: " + attempts || 0);
    sendMessage(
      "DANICA: " +
        generateGreeting() +
        " I'm trying to reserve the gym for you on " +
        registrationDate +
        " now.",
      RECEIVER_PHONE
    );
    const page = await browser.newPage();
    await page.setDefaultTimeout(8000);
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );
    await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 2 });

    // SELECT LOGIN BUTTON
    await loginUserToBookingSite(
      page,
      process.env.UW_USERNAME,
      process.env.UW_PASSWORD
    );
    console.log("Logged in");

    // Wait for the reservation page to load
    const MENU_ITEM_SELECTOR =
      "body > div.container.body-content.bodyColour.contentWrapPP > div > div.col-lg-2.col-md-3.col-sm-3.hidden-xs > div > div.panel-body > ul > li:nth-child(5) > a";
    await page.waitForSelector(MENU_ITEM_SELECTOR);

    await page.waitForTimeout(4000);

    // Select FCW Weekday Mornings from the menu
    await page.click(MENU_ITEM_SELECTOR);

    await page.waitForSelector(
      "#ReservationGrid > div.col-lg-9.col-md-8.col-sm-8.col-xs-7 > div > table > thead > tr > td:nth-child(13) > div"
    );
    await page.waitForSelector(
      "#ReservationGrid > div.row > div.col-lg-6.col-md-6.col-sm-6.col-xs-12.pull-left.input-group.date > div"
    );
    await page.focus(
      "#ReservationGrid > div.row > div.col-lg-6.col-md-6.col-sm-6.col-xs-12.pull-left.input-group.date > div"
    );
    await page.waitForTimeout(2000);
    // Switch the date
    await selectDateInOneWeek(page);
    console.log("Selected date");
    await page.waitForTimeout(2000);
    // Select the gym session
    await selectGymSession(page);
    console.log("Selected session");
    // Select the reserve button and register for the session
    await page.click("#btnReserve");
    await page.waitForSelector("#alertSuccess");
    await browser.close();
    // TODO: Change text depending on which session was selected
    sendMessage(
      "DANICA: " +
        generateGreeting() +
        " I've reserved the gym for you next week from 8:00am - 9:00am. Have a nice night!",
      RECEIVER_PHONE
    );
    console.log("Successfully registered!");
  } catch (err) {
    console.log(err);
    sendMessage(
      "DANICA: " +
        generateGreeting() +
        " I was unable to register the gym for next week, due to the following problem: " +
        err,
      RECEIVER_PHONE
    );
    if (process.env.NODE_ENV === "production") {
      browser.close();
    }

    if (attempts && attempts > 0) {
      reserveGym(attempts - 1);
    }
  }
};

module.exports = {
  reserveGym,
};
