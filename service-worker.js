// Set a new cache name for the service worker
const CACHE_NAME = 'arees-pwa-cache-v3'; // Incremented version to ensure update
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

// This event is fired when the service worker fetches content
self.addEventListener('fetch', event => {
  event.respondWith(
    // Check if the request is in the cache
    caches.match(event.request)
      .then(response => {
        // If yes, return the cached version
        if (response) {
          return response;
        }
        // If no, fetch from the network
        return fetch(event.request);
      })
  );
});

// This event is fired when a new service worker is activated
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
