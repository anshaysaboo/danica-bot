const puppeteer = require("puppeteer");
const moment = require("moment-timezone");

const { sendMessage } = require("./messaging.js");
const { generateGreeting } = require("./greetings.js");
const RECEIVER_PHONE = process.env.USER_PHONE;

// Logs in the User with given credentials to the provided page
const loginUserToBookingSite = async (page, username, password) => {
  // LOAD COURT RESERVATION SITE
  await page.goto("https://reg.hfs.uw.edu/CourtReservation");
  await page.waitForSelector("#Shibboleth");
  await page.click("#Shibboleth");
  await page.waitForSelector("#weblogin_netid");

  // FILL OUT LOGIN
  await page.type("#weblogin_netid", username);
  await page.type("#weblogin_password", password);
  await page.keyboard.press("Enter");

  // WAIT FOR NAVIGATION
  await page.waitForSelector(
    "body > div.container.body-content.bodyColour.contentWrapPP > div > div.TitleDiv > h3"
  );
};

// Opens the datepicker and selects the correct date we want to view on the given page
const selectDateInOneWeek = async (page) => {
  await page.click(
    "#ReservationGrid > div.row > div.col-lg-6.col-md-6.col-sm-6.col-xs-12.pull-left.input-group.date > div"
  );
  // body > div.datepicker.datepicker-dropdown.dropdown-menu.datepicker-orient-left.datepicker-orient-bottom > div.datepicker-days > table
  await page.waitForSelector(
    "body > div.datepicker.datepicker-dropdown.dropdown-menu > div.datepicker-days > table"
  );

  const dateSelector = await page.evaluate(() => {
    var rows = document.querySelectorAll(
      "body > div.datepicker.datepicker-dropdown.dropdown-menu > div.datepicker-days > table > tbody > tr"
    );
    for (var row = 0; row < rows.length; row++) {
      let data = rows[row].querySelectorAll("td");
      for (var col = 0; col < data.length; col++) {
        if (data[col].className === "active day") {
          //row = 1;
          //col = 1;
          return `body > div.datepicker.datepicker-dropdown.dropdown-menu > div.datepicker-days > table > tbody > tr:nth-child(${
            row + 2
          }) > td:nth-child(${col + 1})`;
        }
      }
    }
    return "";
  });
  if (!dateSelector) {
    throw "Error while trying to select next week's date";
  }
  await page.click(dateSelector);
};

// Opens the confirmation dialog for the desired gym session
const selectGymSession = async (page, time) => {
  // TODO: Change the row based on parameter
  const slotSelector = await page.evaluate(() => {
    const row = 2;
    var slots = document.querySelectorAll(
      `#ReservationGrid > div.col-lg-9.col-md-8.col-sm-8.col-xs-7 > div > table > tbody > tr:nth-child(${row}) > td`
    );
    for (var i = 9; i < slots.length; i++) {
      if (slots[i].innerText === "Reserve") {
        // Attempt to reserve this session
        return `#ReservationGrid > div.col-lg-9.col-md-8.col-sm-8.col-xs-7 > div > table > tbody > tr:nth-child(${row}) > td:nth-child(${
          i + 1
        })`;
      }
    }
    return "";
  });
  if (!slotSelector) {
    throw "No available gym sessions for the given time.";
  }
  await page.click(slotSelector);
  await page.waitForSelector("#btnReserve");
  await page.waitFor(500);
};

// Main method that carries out the steps in the reservation process
const reserveGym = async () => {
  const registrationDate = moment()
    .add(7, "days")
    .tz("America/Los_Angeles")
    .format("dddd, MMMM Do");
  const browser = await puppeteer.launch({
    headless: true,
    stealth: true,
    args: ["--no-sandbox"],
  });
  try {
    // Send message that attempt is starting
    sendMessage(
      "DANICA: " +
        generateGreeting() +
        " I'm trying to reserve the gym for you on " +
        registrationDate +
        " now.",
      RECEIVER_PHONE
    );
    const page = await browser.newPage();
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

    await page.waitFor(4000);

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
    await page.waitFor(3000);
    // Switch the date
    await selectDateInOneWeek(page);
    console.log("Selected date");
    await page.waitFor(2000);
    // Select the gym session
    await selectGymSession(page);
    console.log("Selected session");
    // Select the reserve button and register for the session
    await page.click("#btnReserve");
    await page.waitForSelector("#alertSuccess");
    await browser.close();
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
    browser.close();
  }
};

module.exports = {
  reserveGym,
};
