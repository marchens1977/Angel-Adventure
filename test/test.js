// Automatische Prüfung des Spiels.
// Start (im Projektordner):  node test/test.js
// Braucht Playwright mit Chromium (in Claude-Cloud-Sitzungen schon vorhanden).
// Prüft: Startbildschirm, Start-Knopf, Gespräch mit dem Besitzer, Rute nehmen, keine Fehler.
const path = require('path');
const { chromium } = require('playwright');

let fehler = 0;
function pruefe(ok, text) {
  console.log((ok ? 'OK    ' : 'FEHLER') + '  ' + text);
  if (!ok) fehler++;
}

(async () => {
  const html = path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch();
  // Handy-Größe (ähnlich Samsung-Smartphone)
  const page = await browser.newPage({ viewport: { width: 412, height: 900 } });
  const jsFehler = [];
  page.on('pageerror', e => jsFehler.push(e.message));
  page.on('requestfailed', r => jsFehler.push('Datei fehlt: ' + r.url()));
  await page.goto('file://' + html);
  await page.waitForTimeout(800);

  // 1. Startbildschirm
  pruefe(await page.isVisible('#start-screen'), 'Startbildschirm ist sichtbar');
  pruefe(await page.isVisible('#start-btn'), 'Knopf "Spiel starten" ist sichtbar');
  pruefe(!(await page.isVisible('#ui-bar')), 'Aktions-Leiste ist auf dem Startbildschirm versteckt');
  const bildOk = await page.evaluate(() => new Promise(res => {
    const i = new Image(); i.onload = () => res(i.naturalWidth > 0); i.onerror = () => res(false);
    i.src = 'assets/start.jpg';
  }));
  pruefe(bildOk, 'Startbild assets/start.jpg lädt');

  // 2. Spiel starten
  await page.click('#start-btn');
  pruefe(!(await page.isVisible('#start-screen')), 'Nach dem Tippen ist der Startbildschirm weg');
  pruefe(await page.isVisible('#ui-bar'), 'Aktions-Leiste ist im Spiel sichtbar');

  // Hilfsfunktion: auf eine Stelle der Spielfläche (800 x 450) tippen
  async function tippe(x, y) {
    const box = await (await page.$('canvas')).boundingBox();
    await page.mouse.click(box.x + x * box.width / 800, box.y + y * box.height / 450);
    await page.waitForTimeout(2500); // Figur laufen lassen
  }

  // 3. Mit dem Besitzer reden
  await page.click('button[data-verb="Rede mit"]');
  await tippe(560, 250);
  const status1 = await page.textContent('#status-text');
  pruefe(status1.includes('Megabarsch'), 'Besitzer gibt die Aufgabe (Megabarsch)');

  // 4. Rute nehmen
  await page.click('button[data-verb="Nimm"]');
  await tippe(230, 200);
  const inv = await page.textContent('#inventory');
  pruefe(inv.includes('Rute'), 'Rute ist im Inventar');

  pruefe(jsFehler.length === 0, 'Keine Fehler beim Laden' + (jsFehler.length ? ': ' + jsFehler.join('; ') : ''));

  await browser.close();
  console.log(fehler === 0 ? '\nAlle Prüfungen bestanden.' : '\n' + fehler + ' Prüfung(en) fehlgeschlagen.');
  process.exit(fehler === 0 ? 0 : 1);
})();
