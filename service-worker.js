// Set a new cache name for the service worker
// V4: Changed to "Network First" caching strategy to fix update issues.
const CACHE_NAME = 'arees-pwa-cache-v4'; 
// List the files we want to cache
// Corrected all paths to point to the 'images' folder and added all pages
const urlsToCache = [
  './',
  './index.html',
  './projects.html',
  './blog.html',
  './manifest.json',
  './images/AreeBasic.jpg',
  './images/Ann2D.jpg',
  './images/Ann3D.jpg',
  './images/AreeEngineer1.jpg',
  './images/Lisa2D.jpg',
  './images/Lisa3D.jpg',
  './images/AbbyAI.png',
  './images/AbbyDrawing.jpg',
  './images/AreeKpopDreamJob.png',
  './favicon.png'
];

// This event is fired when the service worker is installed
self.addEventListener('install', event => {
  // Wait until the promise is resolved
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all the assets to the cache
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Error adding files to cache:', err);
      })
  );
});

// --- THIS IS THE UPDATED PART ---
// This event is fired when the service worker fetches content
// We are using a "Network First" strategy
self.addEventListener('fetch', event => {
  // We only want to apply this to navigation requests (e.g., loading the page)
  // and not for images, etc. You can expand this logic later if needed.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      // 1. Try to fetch from the network (get the new version)
      fetch(event.request)
        .then(response => {
          // 2. If successful, cache the new response and return it
          return caches.open(CACHE_NAME).then(cache => {
            // Check if it's a valid response before caching
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // 3. If the network fails (offline), return the page from the cache
          return caches.match(event.request);
        })
    );
  } else {
    // For non-navigation requests (images, etc.), use "Cache First"
    // This makes the site load fast.
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // If yes, return the cached version
          if (response) {
            return response;
          }
          // If no, fetch from the network and cache it
          return fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          });
        })
    );
  }
});

// This event is fired when a new service worker is activated
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Only keep the new v4 cache
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches (v1, v2, v3, etc.)
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});