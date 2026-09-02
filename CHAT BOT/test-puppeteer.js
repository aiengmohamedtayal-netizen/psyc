const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('RESPONSE FAILED:', response.url(), response.status());
    }
  });

  await page.goto('https://psyc-17r.pages.dev', { waitUntil: 'networkidle0' });
  
  const bodyContent = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY LENGTH:', bodyContent.length);
  
  await browser.close();
})();
