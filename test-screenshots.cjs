const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });

  console.log('=== Testing Homepage ===');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'tmp/homepage.png', fullPage: true });
  console.log('Screenshot saved to tmp/homepage.png');
  
  console.log('\n=== Testing About Page ===');
  await page.goto('http://localhost:4321/about', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'tmp/about-page.png', fullPage: true });
  console.log('Screenshot saved to tmp/about-page.png');

  if (consoleErrors.length > 0) {
    console.log('\n=== Console Errors ===');
    consoleErrors.forEach(err => console.log(err));
  } else {
    console.log('\n=== No Console Errors ===');
  }

  await browser.close();
})();