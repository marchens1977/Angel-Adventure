// Service Worker (Hintergrund-Helfer) für die installierbare App.
// Holt immer zuerst die neueste Version aus dem Internet; ohne Internet wird die gespeicherte Kopie genommen.
const CACHE = 'megabarsch-v1';
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/start.jpg', 'assets/shop.jpg', 'assets/owner.png',
  'assets/player_1.png', 'assets/player_2.png', 'assets/player_3.png',
  'assets/player_4.png', 'assets/player_5.png', 'assets/player_6.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request))
  );
});
