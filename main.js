const puppeteer = require('puppeteer');

async function scrapeCheapestRate() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-javascript',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--allow-running-insecure-content',
        ],
    });
    const page = await browser.newPage();

    const baseUrl = 'https://all.accor.com/ssr/app/accor/rates/C089/index.en.shtml?';
    const year = 2025;
    const month = 3; // March
    const startDay = 13;
    const endDay = 17;

    const url = `${baseUrl}dateIn=${year}-${month.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}&nights=${endDay - startDay}&compositions=2-0-2&stayplus=false&snu=false&accessibleRooms=false&hideWDR=false&hideHotelDetails=true`;
    await page.goto(url);

    // Wait for the price element to be visible
    await page.waitForSelector('span.booking-price__number.mcp-price-number');

    // Extract the price
    const price = await page.evaluate(() => {
        const priceElement = document.querySelectorAll('.booking-price__number.mcp-price-number')[7].textContent;
        return priceElement;
    });

    console.log(`€${price}`);

  //  await browser.close();
    return price;
}

scrapeCheapestRate()
    .then(price => {
        console.log(`€${price}`);
    })
    .catch(error => {
        console.error('Error:', error);
    });
