// Vorschaubild vom Spiel machen (nur die Spielfläche).
// Start (im Projektordner):  node werkzeuge/screenshot.js [ausgabe.png]
// Braucht Playwright mit Chromium (in Claude-Cloud-Sitzungen schon vorhanden).
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const html = path.resolve(__dirname, '..', 'index.html');
  const out = process.argv[2] || 'vorschau.png';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
  await page.goto('file://' + html);
  await page.waitForTimeout(800); // warten, bis die Bilder geladen sind
  await (await page.$('canvas')).screenshot({ path: out });
  await browser.close();
  console.log('Vorschaubild gespeichert: ' + out);
})();
