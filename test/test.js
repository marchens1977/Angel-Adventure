// Automatische Prüfung des Spiels.
// Start (im Projektordner):  node test/test.js
// Braucht Playwright mit Chromium (in Claude-Cloud-Sitzungen schon vorhanden).
// Prüft: Startbildschirm, Start-Knopf, Gespräch mit dem Besitzer, Rute nehmen, keine Fehler,
// und die installierbare App (Manifest, Symbole, Hintergrund-Helfer).
// Das Spiel wird dafür über einen kleinen eigenen Webserver geöffnet (wie bei GitHub Pages).
const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require('playwright');

const ORDNER = path.resolve(__dirname, '..');
const TYPEN = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png',
                '.webmanifest': 'application/manifest+json' };
function starteServer() {
  return new Promise(res => {
    const server = http.createServer((req, antw) => {
      let datei = decodeURIComponent(req.url.split('?')[0]);
      if (datei.endsWith('/')) datei += 'index.html';
      const voll = path.join(ORDNER, datei);
      if (!voll.startsWith(ORDNER) || !fs.existsSync(voll)) { antw.writeHead(404); return antw.end(); }
      antw.writeHead(200, { 'Content-Type': TYPEN[path.extname(voll)] || 'application/octet-stream' });
      fs.createReadStream(voll).pipe(antw);
    });
    server.listen(0, () => res(server));
  });
}

let fehler = 0;
function pruefe(ok, text) {
  console.log((ok ? 'OK    ' : 'FEHLER') + '  ' + text);
  if (!ok) fehler++;
}

(async () => {
  const server = await starteServer();
  const adresse = 'http://localhost:' + server.address().port + '/';
  const browser = await chromium.launch();
  // Handy-Größe (ähnlich Samsung-Smartphone)
  const page = await browser.newPage({ viewport: { width: 412, height: 900 } });
  const jsFehler = [];
  page.on('pageerror', e => jsFehler.push(e.message));
  page.on('requestfailed', r => jsFehler.push('Datei fehlt: ' + r.url()));
  await page.goto(adresse);
  await page.waitForTimeout(1500);

  // 0. Installierbare App
  const app = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return { fehlt: true };
    const m = await (await fetch(link.href)).json();
    const icons = await Promise.all(m.icons.map(i => new Promise(res => {
      const img = new Image(); img.onload = () => res(img.naturalWidth + 'x' + img.naturalHeight === i.sizes);
      img.onerror = () => res(false); img.src = i.src;
    })));
    const reg = await navigator.serviceWorker.getRegistration();
    return { name: m.name, short: m.short_name, display: m.display, icons, sw: !!reg };
  });
  pruefe(!app.fehlt, 'App-Beschreibung (manifest.webmanifest) ist eingebunden');
  pruefe(app.name === 'Megabarsch' && app.short === 'Megabarsch', 'App heißt "Megabarsch"');
  pruefe(app.display === 'standalone', 'App öffnet ohne Browser-Leiste (standalone)');
  pruefe(app.icons && app.icons.length >= 2 && app.icons.every(x => x), 'App-Symbole 192 und 512 laden mit richtiger Größe');
  pruefe(app.sw, 'Hintergrund-Helfer (sw.js) ist angemeldet');

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
  server.close();
  console.log(fehler === 0 ? '\nAlle Prüfungen bestanden.' : '\n' + fehler + ' Prüfung(en) fehlgeschlagen.');
  process.exit(fehler === 0 ? 0 : 1);
})();
