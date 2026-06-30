const CACHE_NAME = 'collabhub-cache-v6';
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

  // Network-first strategy for the root HTML and manifest files to ensure they are always fresh!
  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/manifest.json') {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
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

// ----------------------------------------------------
// Web Push & Quick Reply Handlers
// ----------------------------------------------------

self.addEventListener('push', (e) => {
  if (!e.data) return;

  try {
    const payload = e.data.json();
    const title = payload.title || 'CollabHub';
    
    const options = {
      body: payload.body || 'New message received',
      icon: payload.icon || '/icons/icon.svg',
      badge: payload.badge || '/icons/icon.svg',
      vibrate: payload.vibrate ? [100, 50, 100] : undefined,
      data: payload.data || {},
      tag: payload.tag || 'chat-notification',
      renotify: true,
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          type: 'text',
          placeholder: 'Type reply...'
        },
        {
          action: 'open',
          title: 'Open Chat'
        }
      ]
    };

    e.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[SW] Error parsing push data:', err);
  }
});

self.addEventListener('notificationclick', (e) => {
  const notification = e.notification;
  const action = e.action;
  const data = notification.data || {};

  notification.close();

  if (action === 'reply' && e.reply) {
    const replyText = e.reply;
    const chatId = data.chatId;

    if (!chatId || !replyText) return;

    // Dispatch background quick-reply REST call
    const promise = fetch('/api/notifications/quick-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatId: chatId,
        content: replyText
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error('SW Quick Reply failed status code: ' + res.status);
      return res.json();
    })
    .catch((err) => {
      console.error('[SW] Quick reply submission error:', err);
    });

    e.waitUntil(promise);
  } else {
    // Open application and focus the correct chat room
    const promise = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TO_CHAT',
            chatId: data.chatId
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const destUrl = data.chatId ? `/?chatId=${data.chatId}` : '/';
        return self.clients.openWindow(destUrl);
      }
    });

    e.waitUntil(promise);
  }
});
