const CACHE_NAME = 'Greenlife Tv Africa-pwa-cache-v2';
const urlsToCache = [
    '/greenlife-tv-africa/',
    '/greenlife-tv-africa/index.html',
    '/greenlife-tv-africa/manifest.json',
    '/greenlife-tv-africa/icon-192x192.png',
    '/greenlife-tv-africa/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    (response) => {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                if (!event.request.url.startsWith('chrome-extension://')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        return response;
                    }
                );
            }).catch(() => {
                // Handle cache and network failures silently
            })
    );
});