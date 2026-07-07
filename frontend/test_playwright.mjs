import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => {
  errors.push({ type: msg.type(), text: msg.text() });
  console.log('CONSOLE:', msg.type(), msg.text());
});
page.on('pageerror', err => {
  errors.push({ type: 'pageerror', text: err.message, stack: err.stack?.substring(0, 500) });
  console.log('PAGE ERROR:', err.message);
});
page.on('requestfailed', req => {
  errors.push({ type: 'requestfailed', url: req.url(), error: req.failure()?.errorText });
  console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText);
});

await page.goto('http://localhost:80/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(5000);
const html = await page.content();
const rootHtml = await page.innerHTML('#root').catch(() => 'empty');
console.log('ROOT inner HTML:', rootHtml.substring(0, 1000));
console.log('TOTAL ERRORS:', errors.length);
if (errors.length) {
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
}
await browser.close();
