// Render index.html to PDF with Chromium. Usage: node render.js <out.pdf> [toc.json]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2] || 'build/raw.pdf';
  const toc = process.argv[3] && fs.existsSync(process.argv[3]) ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : {};
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(t => { window.TOC_PAGES = t; }, toc);
  await page.goto('file://' + path.resolve(__dirname, 'index.html'), { waitUntil: 'load' });
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(async () => { await document.fonts.ready; window.buildFigures(); });
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
})();
