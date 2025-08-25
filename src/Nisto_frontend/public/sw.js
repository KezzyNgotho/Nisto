const CACHE_NAME = 'nesto-v2';
const STATIC_CACHE = 'nesto-static-v2';
const DYNAMIC_CACHE = 'nesto-dynamic-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Nesto SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Nesto SW: Static cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Nesto SW: Static resources cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Nesto SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Nesto SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Nesto SW: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for IC canisters)
  if (!url.origin.includes('localhost') && !url.origin.includes('ic0.app')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname === '/' || url.pathname === '/index.html') {
    // For the main page, try cache first, then network
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
  } else if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/manifest.json')) {
    // For static assets, cache first
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
  } else {
    // For other requests, network first, then cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Nesto SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Nesto SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Nesto',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Nesto', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Nesto SW: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Implement background sync logic here
    console.log('Nesto SW: Background sync completed');
  } catch (error) {
    console.error('Nesto SW: Background sync failed:', error);
  }
}
