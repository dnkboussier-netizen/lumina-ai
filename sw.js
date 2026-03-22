// sw.js — Service Worker voor LUMINA PWA
// Dit zorgt ervoor dat de app installeerbaar is en basisbestanden worden gecached.

const CACHE_NAME = 'lumina-v1';

// De bestanden die we offline willen kunnen laden
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json'
];

// Bij installatie: cache de statische bestanden
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Bij activering: verwijder oude caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Bij fetch: probeer eerst netwerk, dan cache (network-first strategie)
// Dit is ideaal voor een AI app die altijd verse data nodig heeft
self.addEventListener('fetch', event => {
  // API calls nooit cachen — die moeten altijd live zijn
  if (event.request.url.includes('/.netlify/functions/')) {
    return; // Laat door zonder cache
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Als het netwerk werkt, update de cache en return de response
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => {
        // Als het netwerk niet werkt, gebruik de cache
        return caches.match(event.request);
      })
  );
});
