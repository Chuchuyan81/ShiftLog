// Service Worker для PWA функциональности (v1.6.0 - Стабильная)
const CACHE_NAME = 'shift-log-v1.6.0';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './supabase-fallback.js',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg',
    './favicon.ico'
];

// Установка Service Worker
self.addEventListener('install', function(event) {
    console.log('SW: Устанавливаю Service Worker v1.6.0');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('SW: Кэширую файлы по одному (отказоустойчиво)...');
                return Promise.allSettled(
                    urlsToCache.map(url => {
                        return cache.add(url).then(() => {
                            console.log(`SW: Закешировано: ${url}`);
                        }).catch(err => {
                            console.warn(`SW: Не удалось закешировать ${url}:`, err);
                        });
                    })
                );
            })
    );
    self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', function(event) {
    console.log('SW: Активирую Service Worker v1.6.0');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Удаляю старый кэш:', cacheName);
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
            })
    );
});

// Сообщения
self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') self.skipWaiting();
});
