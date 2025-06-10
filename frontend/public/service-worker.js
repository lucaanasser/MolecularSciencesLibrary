const CACHE_NAME = 'biblioteca-cm-v4';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Message event - handle skip waiting
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }
  
  // Skip Vite assets during development (they change frequently)
  if (event.request.url.includes('/assets/') && event.request.url.includes('-')) {
    console.log('Service Worker: Skipping Vite asset', event.request.url);
    return;
  }
  
  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Found in Cache', event.request.url);
          return response;
        }
        
        // Clone the request because it's a one time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(function(response) {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Only cache specific file types (not Vite assets)
          const url = event.request.url;
          const shouldCache = urlsToCache.some(cachedUrl => url.endsWith(cachedUrl)) ||
                             url.match(/\.(png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/);
          
          if (shouldCache) {
            // Clone the response because it's a one time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        }).catch(function(error) {
          console.log('Service Worker: Network request failed', error);
          // You could return a custom offline page here
          return caches.match('/');
        });
      })
  );
});

// Handle background sync
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background Sync', event.tag);
});

// Handle push notifications
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push Received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação da Biblioteca CM',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/images/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/images/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Biblioteca CM', options)
  );
});
