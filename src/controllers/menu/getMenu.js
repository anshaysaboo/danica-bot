const puppeteer = require("puppeteer");

// Function that returns the Local Point menu for the current date and time
// @param meal - the meal which menu to return, either "lunch" or "dinner"

const getMenu = async (meal) => {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "production",
    stealth: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setDefaultTimeout(15000);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
  );
  await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 2 });

  // Navigate to HFS website
  await page.goto("https://order.hfs.uw.edu/6123");
  await page.waitForSelector(
    "body > app-root > ng-component > div > div > div > ng-component > ng-component > div > ng-component:nth-child(4) > div > items-group:nth-child(1) > div"
  );

  // Parse order website to retrieve current menu items
  const menuItems = await page.evaluate(() => {
    var names = [];
    let items = document.querySelectorAll(
      "body > app-root > ng-component > div > div > div > ng-component > ng-component > div > ng-component:nth-child(4) > div > items-group:nth-child(1) > div > item"
    );
    for (var i = 0; i < items.length; i++) {
      const name = items[i].querySelector(
        "div.wo-name-description-container > div.wo-name.p-3.font-weight-bold.bg-light-yellow"
      ).innerHTML;
      names.push(name.trim());
    }
    return names;
  });

  await browser.close();

  if (!menuItems) {
    throw "No current menu found!";
  }

  return menuItems.join("\n");
};

module.exports = {
  getMenu,
};
