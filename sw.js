// Service Worker для PWA функциональности (v1.6.5)
const CACHE_NAME = 'shift-log-v1.6.5';
const urlsToCache = [
    './',
    './index.html',
    './style.css?v=2.6.2',
    './main.js?v=4.0.6',
    './supabase-fallback.js?v=1.6.3',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg',
    './favicon.ico'
];

// Установка Service Worker
self.addEventListener('install', function(event) {
    console.log('SW: Install v1.6.5');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                // Заменяем Promise.allSettled на Promise.all для совместимости
                return Promise.all(
                    urlsToCache.map(function(url) {
                        return cache.add(url).catch(function(err) {
                            console.error('SW: Cache add failed for ' + url, err);
                        });
                    })
                );
            })
    );
    self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', function(event) {
    console.log('SW: Activate v1.6.5');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Обработка запросов
self.addEventListener('fetch', function(event) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/43a37d4b-67d1-4fad-974c-8b3c59a3c233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sw.js:fetch',message:'SW intercepting fetch',data:{url:event.request.url},timestamp:Date.now(),sessionId:'mobile-debug',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const url = event.request.url;
    
    // Пропускаем внешние ресурсы (Supabase, CDN)
    if (url.includes('supabase.co') || 
        url.includes('cdn.jsdelivr.net') || 
        url.includes('unpkg.com') ||
        url.includes('cdnjs.cloudflare.com') ||
        !url.startsWith(self.location.origin)) {
        return;
    }
    
    // Только GET запросы
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) return response;
                
                return fetch(event.request).then(function(response) {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                });
            }).catch(function() {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return Response.error();
            })
    );
});

// Сообщения
self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') self.skipWaiting();
});
