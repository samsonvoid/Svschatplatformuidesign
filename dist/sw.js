const CACHE_NAME = 'collabhub-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache-first for static assets, network-first for index/APIs (avoiding WebSocket issues)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Skip cross-origin API calls and socket connection
  if (
    url.origin !== self.location.origin || 
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/socket.io')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache static JS/CSS assets dynamically
        if (
          e.request.method === 'GET' && 
          (url.pathname.includes('/assets/') || 
           url.pathname.endsWith('.png') || 
           url.pathname.endsWith('.svg') || 
           url.pathname.includes('fonts.googleapis.com') ||
           url.pathname.includes('fonts.gstatic.com'))
        ) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
