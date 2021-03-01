const puppeteer = require("puppeteer");
const moment = require("moment-timezone");

const {
  loginUserToBookingSite,
  selectGymSession,
  selectDateInOneWeek,
} = require("./utils.js");

const { sendMessage } = require("../messages/messaging.js");
const { generateGreeting } = require("../messages/greetings.js");
const RECEIVER_PHONE = process.env.USER_PHONE;

// Main method that carries out the steps in the reservation process
const reserveGym = async (attempts) => {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "production",
    stealth: true,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setDefaultTimeout(15000);
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
      "body > div.container.body-content.bodyColour.contentWrapPP > div > div.col-lg-2.col-md-3.col-sm-3.hidden-xs > div > div.panel-body > ul > li:nth-child(15) > a";

    await page.waitForSelector(MENU_ITEM_SELECTOR);

    await page.waitForSelector("#loadingspinner", { hidden: true });

    // Select FCW Weekday Mornings from the menu
    await page.focus(MENU_ITEM_SELECTOR);
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

    await page.waitForSelector("#loadingspinner", { hidden: true });

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

    console.log("Successfully registered!");
  } catch (err) {
    await browser.close();
    throw err;
  }
};

// Public method to call in order to begin the reservation process
const attemptReserveGym = async (attempts = 1) => {
  // Send message that attempt is starting
  const registrationDate = moment()
    .add(7, "days")
    .tz("America/Los_Angeles")
    .format("dddd, MMMM Do");
  sendMessage(
    generateGreeting() +
      " I'm trying to reserve the gym for you on " +
      registrationDate +
      " now.",
    RECEIVER_PHONE
  );

  // Attempt to register for the session
  let errors = [];
  for (var i = 0; i < attempts; i++) {
    console.log("Starting attempt. Attempts left: " + attempts - i || 0);
    try {
      await reserveGym();
      sendMessage(
        generateGreeting() +
          " I've reserved the gym for you next week from 8:00am - 9:00am. Have a nice night!",
        RECEIVER_PHONE
      );
      return;
    } catch (err) {
      console.error(err);
      errors.push(err);
    }
  }
  // Send errors to user if no attempts were successful
  sendMessage(
    generateGreeting() +
      " Failed to register for gym session, for the following reasons: \n\n" +
      errors.join("\n\n"),
    RECEIVER_PHONE
  );
};

module.exports = {
  reserveGym,
  attemptReserveGym,
};
