const puppeteer = require("puppeteer");

// Logs in the User with given credentials to the provided page
exports.loginUserToBookingSite = async (page, username, password) => {
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
exports.selectDateInOneWeek = async (page) => {
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

// Opens the confirmation dialog for the desired gym session on the provided page
exports.selectGymSession = async (page) => {
  const slotSelector = await page.evaluate(() => {
    for (var row = 2; row <= 3; row++) {
      const row = 2;
      var slots = document.querySelectorAll(
        `#ReservationGrid > div.col-lg-9.col-md-8.col-sm-8.col-xs-7 > div > table > tbody > tr:nth-child(${row}) > td`
      );
      for (var i = 9; i < slots.length; i++) {
        console.log(slots[i].innerText);
        if (slots[i].innerText === "Reserve") {
          // Attempt to reserve this session
          return `#ReservationGrid > div.col-lg-9.col-md-8.col-sm-8.col-xs-7 > div > table > tbody > tr:nth-child(${row}) > td:nth-child(${
            i + 1
          })`;
        }
      }
    }
    return "";
  });
  if (!slotSelector) {
    throw "No available gym sessions for the given time.";
  }
  await page.click(slotSelector);
  await page.waitForSelector("#btnReserve");
  await page.waitForTimeout(500);
};
