const CACHE_NAME = 'seed-organizer-v1';
const API_CACHE = 'api-cache-v1';
const IMAGE_CACHE = 'image-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE && cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Network-first strategy for API requests with fallback to cache
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for failed requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This request failed and no cached version is available' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy for images
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to load image:', error);
    
    // Return placeholder image or error response
    return new Response('', {
      status: 404,
      statusText: 'Image not found'
    });
  }
}

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to load static asset:', error);
    
    // For navigation requests, return cached index.html
    if (request.mode === 'navigate') {
      const indexResponse = await cache.match('/index.html');
      if (indexResponse) {
        return indexResponse;
      }
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'payment-sync') {
    event.waitUntil(syncOfflinePayments());
  }
  
  if (event.tag === 'suborganizer-sync') {
    event.waitUntil(syncOfflineSuborganizers());
  }
});

// Sync offline payments
async function syncOfflinePayments() {
  try {
    // Get offline payments from IndexedDB
    const offlinePayments = await getOfflinePayments();
    
    for (const payment of offlinePayments) {
      try {
        // Attempt to sync each payment
        await syncPayment(payment);
        await removeOfflinePayment(payment.id);
        console.log('Synced payment:', payment.id);
      } catch (error) {
        console.error('Failed to sync payment:', payment.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync offline suborganizers
async function syncOfflineSuborganizers() {
  try {
    // Get offline suborganizers from IndexedDB
    const offlineSuborganizers = await getOfflineSuborganizers();
    
    for (const suborganizer of offlineSuborganizers) {
      try {
        // Attempt to sync each suborganizer
        await syncSuborganizer(suborganizer);
        await removeOfflineSuborganizer(suborganizer.id);
        console.log('Synced suborganizer:', suborganizer.id);
      } catch (error) {
        console.error('Failed to sync suborganizer:', suborganizer.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations (simplified)
async function getOfflinePayments() {
  // This would interact with IndexedDB to get offline payments
  return [];
}

async function syncPayment(payment) {
  // This would make the actual API call to sync the payment
  return fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment)
  });
}

async function removeOfflinePayment(id) {
  // This would remove the payment from IndexedDB after successful sync
  console.log('Removing offline payment:', id);
}

async function getOfflineSuborganizers() {
  // This would interact with IndexedDB to get offline suborganizers
  return [];
}

async function syncSuborganizer(suborganizer) {
  // This would make the actual API call to sync the suborganizer
  return fetch('/api/suborganizers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suborganizer)
  });
}

async function removeOfflineSuborganizer(id) {
  // This would remove the suborganizer from IndexedDB after successful sync
  console.log('Removing offline suborganizer:', id);
}