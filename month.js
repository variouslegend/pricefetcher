const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeCheapestRateForMonth(page, year, month) {
    let cheapestRate = Infinity;
    let cheapestDate = '';

    for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month - 1, day);
        // Check if the date is valid
        if (date.getMonth() + 1 !== month) continue;

        const url = `https://all.accor.com/ssr/app/accor/rates/C089/index.en.shtml?dateIn=${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}&nights=4&compositions=2-0-2&stayplus=false&snu=false&accessibleRooms=false&hideWDR=false&hideHotelDetails=true`;
        await page.goto(url);

        // Wait for the page to load
        try {
            await page.waitForSelector('span[data-v-2f20e2ee].booking-price__number.mcp-price-number', { timeout: 15000 });
        } catch (error) {
            // If the selector is not found within 5 seconds, skip this day
            continue;
        }

        // Extract the price
        const price = await page.evaluate(() => {
            const priceElement = document.querySelector('span[data-v-2f20e2ee].booking-price__number.mcp-price-number');
            return priceElement ? parseFloat(priceElement.textContent.replace(/[^\d.-]/g, '')) : Infinity;
        });

        if (price < cheapestRate) {
            cheapestRate = price;
            cheapestDate = date.toISOString().split('T')[0];
        }
    }

    return { cheapestDate, cheapestRate };
}

async function scrapeCheapestRateForYear() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const year = 2025;
    const results = [];

    for (let month = 1; month <= 12; month++) {
        const { cheapestDate, cheapestRate } = await scrapeCheapestRateForMonth(page, year, month);
        if (cheapestDate) {
            results.push(`Cheapest rate in ${year}-${month.toString().padStart(2, '0')}: ${cheapestDate} for €${cheapestRate}`);
            console.log(`Cheapest rate in ${year}-${month.toString().padStart(2, '0')}: ${cheapestDate} for €${cheapestRate}`);
        }
    }

    await browser.close();

    // Write results to monthly.txt
    fs.writeFileSync('monthly.txt', results.join('\n'), 'utf-8');
}

scrapeCheapestRateForYear()
    .then(() => {
        console.log('Cheapest dates and rates per month have been written to monthly.txt');
    })
    .catch(error => {
        console.error('Error:', error);
    });
