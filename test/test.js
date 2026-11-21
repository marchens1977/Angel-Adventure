// Automatische Prüfung des Spiels.
// Start (im Projektordner):  node test/test.js
// Braucht Playwright mit Chromium (in Claude-Cloud-Sitzungen schon vorhanden).
// Prüft: Startbildschirm, Start-Knopf, alle Aktionen, die Rätsel im Laden (Rute, Kescher, Schlüssel,
// Lager, Schnur + Rute = Angel), keine Fehler,
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

  // Hilfsfunktion: auf eine Stelle der Spielfläche (800 x 450) tippen und warten, bis die Figur angekommen ist
  async function tippe(x, y) {
    const box = await (await page.$('canvas')).boundingBox();
    await page.mouse.click(box.x + x * box.width / 800, box.y + y * box.height / 450);
    await page.waitForTimeout(100);
    await page.waitForFunction(() => targetX === null, null, { timeout: 8000 });
  }
  const verb = v => page.click(`button[data-verb="${v}"]`);
  const gegenstand = id => page.click(`#inventory button[data-item="${id}"]`);
  const status = () => page.textContent('#status-text');
  const inventar = () => page.textContent('#inventory');

  // Alle Aktions-Knöpfe da?
  for (const v of ['Gehe', 'Schau an', 'Nimm', 'Benutze', 'Rede mit', 'Gib']) {
    pruefe(await page.isVisible(`button[data-verb="${v}"]`), `Aktion "${v}" ist da`);
  }

  // 3. Mit dem Besitzer reden
  await verb('Rede mit');
  await tippe(560, 250);
  pruefe((await status()).includes('Megabarsch'), 'Besitzer gibt die Aufgabe (Megabarsch)');

  // 4. Rute nehmen
  await verb('Nimm');
  await tippe(230, 200);
  pruefe((await inventar()).includes('Rute'), 'Rute ist im Inventar');

  // 5. Rätsel 2: Schlüssel an der Lampe
  await verb('Rede mit');
  await tippe(560, 250);
  pruefe((await status()).includes('Lager'), 'Besitzer erwähnt, dass die Schnur im Lager ist');
  await verb('Schau an');
  await tippe(516, 70);
  pruefe((await status()).includes('Schlüssel'), 'Schau an Lampe zeigt den Schlüssel');
  await verb('Benutze');
  await tippe(665, 220);
  pruefe((await status()).includes('abgeschlossen'), 'Lagertür ist zuerst abgeschlossen');
  await verb('Nimm');
  await tippe(460, 160);
  pruefe((await inventar()).includes('Kescher'), 'Kescher ist im Inventar');
  await verb('Benutze');
  await gegenstand('kescher');
  pruefe((await page.textContent('#current-verb')).includes('Kescher mit'), 'Anzeige "Benutze Kescher mit …"');
  await tippe(516, 70);
  pruefe((await inventar()).includes('Schlüssel'), 'Schlüssel mit dem Kescher von der Lampe geholt');

  // 6. Rätsel 3: Lager aufschließen, Schnur an die Rute
  await verb('Benutze');
  await gegenstand('schluessel');
  await tippe(665, 220);
  const inv3 = await inventar();
  pruefe(inv3.includes('Angelschnur') && inv3.includes('Würmerdose') && !inv3.includes('Schlüssel'),
         'Lager aufgeschlossen: Schnur und Würmerdose im Inventar');
  await verb('Schau an');
  await gegenstand('schnur');
  pruefe((await status()).includes('Angelschnur'), 'Schau an Gegenstand zeigt Beschreibung');
  await verb('Benutze');
  await gegenstand('schnur');
  await gegenstand('rute');
  const inv4 = await inventar();
  pruefe(inv4.includes('Angel') && !inv4.includes('ohne Schnur') && !inv4.includes('Angelschnur'),
         'Schnur + Rute ergibt fertige Angel');
  await verb('Rede mit');
  await tippe(560, 250);
  pruefe((await status()).includes('Würmer'), 'Besitzer schickt dich zum Ufer (Würmer)');

  pruefe(jsFehler.length === 0, 'Keine Fehler beim Laden' + (jsFehler.length ? ': ' + jsFehler.join('; ') : ''));

  await browser.close();
  server.close();
  console.log(fehler === 0 ? '\nAlle Prüfungen bestanden.' : '\n' + fehler + ' Prüfung(en) fehlgeschlagen.');
  process.exit(fehler === 0 ? 0 : 1);
})();
