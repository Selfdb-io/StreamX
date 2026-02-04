// StreamX Service Worker
const CACHE_NAME = 'streamx-v3';
const STATIC_CACHE = 'streamx-static-v3';
const DYNAMIC_CACHE = 'streamx-dynamic-v3';
const MEDIA_CACHE = 'streamx-media-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except for fonts)
  if (url.origin !== location.origin && !url.hostname.includes('fonts')) {
    return;
  }

  // For API requests, use network only (don't cache API calls)
  if (url.pathname.includes('/api/') || url.pathname.includes('/v1/')) {
    return;
  }

  // For audio/video files, use cache first strategy
  if (request.destination === 'audio' || 
      request.destination === 'video' ||
      /\.(mp3|mp4|m4a|wav|ogg|flac|webm)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Media cache hit:', url.pathname);
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(MEDIA_CACHE).then((cache) => {
              cache.put(request, responseClone);
              console.log('[SW] Cached media:', url.pathname);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // For static assets, use cache first
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // For HTML pages, use network first with cache fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Clear all caches
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }
  
  // Clear only media cache
  if (event.data && event.data.type === 'CLEAR_MEDIA_CACHE') {
    event.waitUntil(
      caches.delete(MEDIA_CACHE).then(() => {
        console.log('[SW] Media cache cleared');
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }
});

// Background sync for offline queue actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-playback-state') {
    console.log('[SW] Syncing playback state...');
    // Sync logic would go here
  }
});
