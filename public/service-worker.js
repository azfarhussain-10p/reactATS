/**
 * ATS Application Service Worker
 * Provides offline capabilities and PWA functionality
 */

// Cache version - update this value when you want to invalidate the cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = `ats-app-cache-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/static/css/main.chunk.css',
  '/assets/logo.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/offline.html', // Special page shown when offline and navigating to uncached page
  '/assets/offline-image.png' // Offline fallback image
];

// API routes that should be cached with a network-first strategy
const API_CACHE_URLS = [
  '/api/dashboard',
  '/api/candidates',
  '/api/jobs',
  '/api/interviews'
];

// IndexedDB database name and version
const DB_NAME = 'offline-forms';
const DB_VERSION = 1;
const FORMS_STORE = 'forms';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Skip waiting to allow the new service worker to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('ats-app-cache-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {
        // Take control of all clients/tabs immediately
        return self.clients.claim();
      })
  );
});

// Special message to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle POST, PUT, PATCH requests (possibly offline forms)
  if (request.method !== 'GET' && !navigator.onLine) {
    // Let the app handle this through the offlineFormHandler.js
    return;
  }
  
  // Ignore non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignore browser extensions and chrome-extension requests
  if (
    url.protocol === 'chrome-extension:' ||
    url.pathname.startsWith('/extension/') ||
    url.hostname.endsWith('.extension')
  ) {
    return;
  }

  // Special handling for image requests
  if (request.headers.get('accept')?.includes('image')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((networkResponse) => {
              // Cache the new image for future use
              if (networkResponse.ok) {
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, clonedResponse);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              // If both cache and network fail, use the offline image
              return caches.match('/assets/offline-image.png');
            });
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (isApiRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Handle HTML navigation with network-first strategy + offline fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If offline, show the offline page
          return caches.match('/offline.html') || caches.match('/index.html');
        })
    );
    return;
  }
  
  // Default to network-first for everything else
  event.respondWith(networkFirstStrategy(request));
});

// Background sync event handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncOfflineForms());
  }
});

/**
 * Process all pending form submissions
 */
async function syncOfflineForms() {
  try {
    const db = await openDatabase();
    const forms = await getAllFormsFromDB(db);
    
    if (forms.length === 0) {
      console.log('No pending forms to sync');
      return;
    }
    
    console.log(`Syncing ${forms.length} pending forms...`);
    
    const results = await Promise.all(
      forms.map(async (form) => {
        try {
          const response = await fetch(form.url, {
            method: form.method,
            headers: form.headers,
            body: JSON.stringify(form.data),
            credentials: 'same-origin'
          });
          
          if (response.ok) {
            // If successful, remove the form from IndexedDB
            await deleteFormFromDB(db, form.id);
            return { id: form.id, success: true };
          } else {
            console.error(`Failed to sync form ${form.id}. Status: ${response.status}`);
            return { id: form.id, success: false, status: response.status };
          }
        } catch (error) {
          console.error(`Error syncing form ${form.id}:`, error);
          return { id: form.id, success: false, error: error.message };
        }
      })
    );
    
    db.close();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`Sync completed. Success: ${successful}, Failed: ${failed}`);
    
    // Notify clients
    if (successful > 0) {
      notifyClients({
        type: 'FORM_SYNC_COMPLETED',
        success: true,
        processed: successful,
        failed,
        results
      });
    }
    
    return results;
  } catch (error) {
    console.error('Failed to sync forms:', error);
    return [];
  }
}

/**
 * Open the IndexedDB database
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(FORMS_STORE)) {
        db.createObjectStore(FORMS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all stored forms from IndexedDB
 */
function getAllFormsFromDB(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FORMS_STORE, 'readonly');
    const store = transaction.objectStore(FORMS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a form from IndexedDB
 */
function deleteFormFromDB(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FORMS_STORE, 'readwrite');
    const store = transaction.objectStore(FORMS_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Notify all clients about an event
 */
async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage(message);
  });
}

/**
 * Check if the request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  // Check if this is one of our explicitly defined static assets
  if (STATIC_CACHE_URLS.some(staticUrl => {
    return url.pathname === staticUrl || url.pathname.endsWith(staticUrl);
  })) {
    return true;
  }
  
  // Check common static file extensions
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif',
    '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
  ];
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Check if the request is for an API endpoint
 */
function isApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this is one of our explicitly defined API URLs
  if (API_CACHE_URLS.some(apiUrl => {
    return url.pathname === apiUrl || url.pathname.startsWith(apiUrl);
  })) {
    return true;
  }
  
  // Check if the URL path starts with /api/
  return url.pathname.startsWith('/api/');
}

/**
 * Cache-first strategy:
 * 1. Try to get from cache
 * 2. If not in cache, fetch from network and cache
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response if it's valid
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If no cached response and network fails, return offline fallback
    if (request.headers.get('accept')?.includes('image')) {
      return caches.match('/assets/offline-image.png');
    }
    
    return caches.match('/offline.html');
  }
}

/**
 * Network-first strategy:
 * 1. Try to get from network
 * 2. If network fails, try to get from cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response if it's valid
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If neither network nor cache has the response, return offline fallback
    if (request.headers.get('accept')?.includes('image')) {
      return caches.match('/assets/offline-image.png');
    }
    
    return new Response(
      JSON.stringify({
        error: 'You are offline and this resource is not cached.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 