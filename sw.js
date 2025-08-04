// Service Worker для PWA функциональности
const CACHE_NAME = 'shift-log-v1.3.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/main.js',
    '/manifest.json',
    '/icon-192.svg',
    '/icon-512.svg',
    '/favicon.ico'
    // CDN библиотеки не кэшируем принудительно
];

// Установка Service Worker
self.addEventListener('install', function(event) {
    console.log('SW: Устанавливаю Service Worker v1.3.0');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('SW: Кэширую файлы');
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.error('SW: Ошибка при кэшировании:', error);
                // Не прерываем установку из-за ошибок кэширования
                return Promise.resolve();
            })
    );
    
    // НЕ активируем принудительно - дожидаемся закрытия старых страниц
    // self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', function(event) {
    console.log('SW: Активирую Service Worker v1.3.0');
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
        })
        // НЕ берем под контроль существующие страницы сразу
        // .then(function() {
        //     return self.clients.claim();
        // })
    );
});

// Обработка запросов
self.addEventListener('fetch', function(event) {
    const url = event.request.url;
    
    // КРИТИЧЕСКИ ВАЖНО: Пропускаем ВСЕ внешние ресурсы без вмешательства
    if (url.includes('supabase.co') || 
        url.includes('cdn.jsdelivr.net') || 
        url.includes('unpkg.com') ||
        url.includes('cdnjs.cloudflare.com') ||
        !url.startsWith(self.location.origin)) {
        
        console.log('SW: Пропускаю внешний ресурс:', url);
        // НЕ используем event.respondWith для внешних ресурсов
        return;
    }
    
    // Пропускаем POST, PUT, DELETE запросы - они должны идти онлайн
    if (event.request.method !== 'GET') {
        console.log('SW: Пропускаю не-GET запрос:', event.request.method, url);
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Если есть кэшированная версия, возвращаем её
                if (response) {
                    console.log('SW: Возвращаю из кэша:', event.request.url);
                    return response;
                }
                
                // Иначе загружаем из сети
                return fetch(event.request).then(function(response) {
                    // Проверяем корректность ответа
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Кэшируем только GET запросы к нашему домену
                    if (event.request.method === 'GET' && 
                        event.request.url.startsWith(self.location.origin)) {
                        
                        // Клонируем ответ для кэширования
                        var responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    
                    return response;
                });
            })
            .catch(function(error) {
                console.error('SW: Ошибка при обработке запроса:', error);
                
                // Если офлайн, показываем кэшированную главную страницу
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                
                // Для остальных запросов возвращаем ошибку
                return new Response('Офлайн режим', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Обработка сообщений от главного потока
self.addEventListener('message', function(event) {
    console.log('SW: Получено сообщение:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'getCacheStatus') {
        event.ports[0].postMessage({
            cacheVersion: CACHE_NAME,
            cachedUrls: urlsToCache.length
        });
    }
});

// Обработка ошибок
self.addEventListener('error', function(event) {
    console.error('SW: Ошибка Service Worker:', event.error);
});

// Обработка необработанных отклонений промисов
self.addEventListener('unhandledrejection', function(event) {
    console.error('SW: Необработанное отклонение промиса:', event.reason);
});

console.log('SW: Service Worker v1.3.0 загружен'); 