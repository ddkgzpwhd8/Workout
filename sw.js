// Bump this version string every time you redeploy index.html.
// Changing it forces the service worker to drop the old cache and fetch the new file.
const CACHE_NAME = 'gymlog-cache-v1';
const FILES_TO_CACHE = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Cache-first: serve instantly from cache, and refresh the cache in the background.
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached); // offline: fall back to whatever's cached
      return cached || networkFetch;
    })
  );
});
