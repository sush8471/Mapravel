const STATIC_CACHE = 'mapravel-static-v1';
const DYNAMIC_CACHE = 'mapravel-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/file.svg',
  '/globe.svg',
  '/window.svg',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Pre-caching static core assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-caching skipped some files:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip caching for local dev tools, admin panel, and API endpoints
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/_next/webpack-hmr') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // 2. Dynamic caching for external resources (Mapbox tiles/styles, Supabase media/music)
  const isExternal = !request.url.startsWith(self.location.origin);
  if (isExternal) {
    const shouldCacheExternal =
      request.url.includes('api.mapbox.com') ||
      request.url.includes('supabase.co') ||
      request.url.includes('.mp3') ||
      request.url.includes('.wav') ||
      request.url.includes('fonts.googleapis.com') ||
      request.url.includes('fonts.gstatic.com');

    if (shouldCacheExternal) {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          return fetch(request).then((networkResponse) => {
            // Cache successful or opaque responses (status 0 is CORS-restricted dynamic tile/asset)
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              const responseCopy = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseCopy));
            }
            return networkResponse;
          }).catch(() => {
            // Quietly fail for offline network requests
            return null;
          });
        })
      );
    }
    return;
  }

  // 3. Network-First Strategy for HTML Page Navigation (allows offline fallback to cached view)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseCopy = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // 4. Cache-First Strategy for static JS, CSS, fonts, and public assets
  const isStaticAsset =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.includes('/fonts/');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseCopy));
          }
          return networkResponse;
        });
      })
    );
  }
});
