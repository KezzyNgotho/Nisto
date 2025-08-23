// Service Worker for ICP Push Notifications
const CACHE_NAME = 'nesto-notifications-v1';
const NOTIFICATION_TAG = 'nesto-notification';

// Install event
self.addEventListener('install', (event) => {
  console.log('Nesto Notification SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Nesto Notification SW: Cache opened');
        return cache.addAll([
          '/',
          '/favicon.ico',
          '/manifest.json'
        ]);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Nesto Notification SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Nesto Notification SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Nesto Notification SW: Push event received:', event);
  
  let notificationData = {
    title: 'Nesto Notification',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: NOTIFICATION_TAG,
    data: {},
    requireInteraction: false,
    actions: []
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Nesto Notification SW: Failed to parse push data:', error);
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    })
  );

  // Send message to main thread
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'PUSH_RECEIVED',
        payload: notificationData
      });
    });
  });
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Nesto Notification SW: Notification clicked:', event);
  
  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log('Nesto Notification SW: Action clicked:', event.action);
    
    // Handle specific actions
    switch (event.action) {
      case 'view':
        if (event.notification.data.actionUrl) {
          event.waitUntil(
            clients.openWindow(event.notification.data.actionUrl)
          );
        }
        break;
      case 'dismiss':
        // Just close the notification
        break;
      default:
        console.log('Nesto Notification SW: Unknown action:', event.action);
    }
  } else {
    // Default click behavior
    if (event.notification.data.actionUrl) {
      event.waitUntil(
        clients.openWindow(event.notification.data.actionUrl)
      );
    }
  }

  // Send message to main thread
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLICKED',
        payload: {
          notificationId: event.notification.data.id,
          actionUrl: event.notification.data.actionUrl,
          action: event.action
        }
      });
    });
  });
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Nesto Notification SW: Notification closed:', event);
  
  // Send message to main thread
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        payload: {
          notificationId: event.notification.data.id
        }
      });
    });
  });
});

// Message event - Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Nesto Notification SW: Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    default:
      console.log('Nesto Notification SW: Unknown message type:', event.data.type);
  }
});

// Background sync event (for offline notifications)
self.addEventListener('sync', (event) => {
  console.log('Nesto Notification SW: Background sync:', event);
  
  if (event.tag === 'background-notification-sync') {
    event.waitUntil(
      // Sync notifications when back online
      syncNotifications()
    );
  }
});

// Periodic background sync (for regular updates)
self.addEventListener('periodicsync', (event) => {
  console.log('Nesto Notification SW: Periodic sync:', event);
  
  if (event.tag === 'notification-update') {
    event.waitUntil(
      // Update notifications periodically
      updateNotifications()
    );
  }
});

// Sync notifications when back online
async function syncNotifications() {
  try {
    // Get stored offline notifications
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Process offline notifications
    for (const request of requests) {
      if (request.url.includes('/api/notifications')) {
        const response = await cache.match(request);
        if (response) {
          // Send to backend
          await fetch(request.url, {
            method: 'POST',
            body: await response.clone().text(),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          // Remove from cache
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('Nesto Notification SW: Sync failed:', error);
  }
}

// Update notifications periodically
async function updateNotifications() {
  try {
    // Check for new notifications
    const response = await fetch('/api/notifications/check', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const notifications = await response.json();
      
      // Show new notifications
      notifications.forEach((notification) => {
        self.registration.showNotification(notification.title, {
          body: notification.message,
          icon: notification.icon || '/favicon.ico',
          badge: notification.badge || '/favicon.ico',
          tag: `${NOTIFICATION_TAG}-${notification.id}`,
          data: notification,
          requireInteraction: notification.priority === 'critical'
        });
      });
    }
  } catch (error) {
    console.error('Nesto Notification SW: Update failed:', error);
  }
}

console.log('Nesto Notification SW: Service worker loaded');
