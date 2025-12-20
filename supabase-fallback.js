// Альтернативная загрузка Supabase с fallback (Улучшенная версия)
(function() {
    console.log('🔄 Запуск системы загрузки Supabase...');
    
    // Проверяем, загрузился ли Supabase уже
    if (window.supabase) {
        console.log('✅ Supabase уже доступен');
        return;
    }
    
    // Список надежных UMD CDN (только UMD версии, чтобы избежать проблем с 'export'/'import')
    const fallbackUrls = [
        'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
        'https://cdnjs.cloudflare.com/ajax/libs/supabase/2.39.8/supabase.js'
    ];
    
    let currentIndex = 0;
    let loadingTimeout = null;
    
    // Функция для очистки кэша (перенесена из index.html)
    window.clearCacheAndReload = function() {
        console.log('🧹 Очистка кэша и перезагрузка...');
        if ('caches' in window) {
            caches.keys().then(names => {
                return Promise.all(names.map(name => caches.delete(name)));
            }).then(() => {
                if ('serviceWorker' in navigator) {
                    return navigator.serviceWorker.getRegistrations().then(registrations => {
                        return Promise.all(registrations.map(reg => reg.unregister()));
                    });
                }
            }).then(() => {
                window.location.reload(true);
            }).catch(err => {
                console.error('Ошибка при очистке кэша:', err);
                window.location.reload(true);
            });
        } else {
            window.location.reload(true);
        }
    };

    function loadNextFallback() {
        if (currentIndex >= fallbackUrls.length) {
            console.error('❌ Все источники Supabase недоступны');
            showErrorScreen();
            return;
        }
        
        const url = fallbackUrls[currentIndex];
        console.log(`🔄 Попытка загрузки [${currentIndex + 1}/${fallbackUrls.length}]: ${url}`);
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url;
        
        script.onload = function() {
            if (loadingTimeout) clearTimeout(loadingTimeout);
            
            // Проверяем наличие библиотеки
            if (window.supabase || window.SupabaseJS) {
                if (window.SupabaseJS && !window.supabase) {
                    window.supabase = window.SupabaseJS;
                }
                console.log(`✅ Supabase успешно загружен из: ${url}`);
                
                // Уведомляем основное приложение, если оно ждет
                window.dispatchEvent(new CustomEvent('supabase-loaded'));
            } else {
                console.warn('⚠️ Скрипт загружен, но объект window.supabase не найден');
                tryNext();
            }
        };
        
        script.onerror = function() {
            if (loadingTimeout) clearTimeout(loadingTimeout);
            console.warn(`❌ Ошибка загрузки из: ${url}`);
            tryNext();
        };
        
        // Таймаут для текущей попытки (7 секунд)
        loadingTimeout = setTimeout(() => {
            if (!window.supabase && !window.SupabaseJS) {
                console.warn(`⏰ Таймаут (7с) для: ${url}`);
                tryNext();
            }
        }, 7000);
        
        document.head.appendChild(script);
    }
    
    function tryNext() {
        currentIndex++;
        loadNextFallback();
    }
    
    function showErrorScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 90%; margin: 20px auto;">
                        <h2 style="color: #dc2626; margin-bottom: 16px;">⚠️ Ошибка подключения</h2>
                        <p style="color: #4b5563; margin-bottom: 20px;">Не удалось загрузить необходимые компоненты системы. Это может быть связано с блокировкой CDN или отсутствием интернета.</p>
                        <button onclick="location.reload()" style="display: block; width: 100%; margin-bottom: 10px; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            🔄 Попробовать снова
                        </button>
                        <button onclick="clearCacheAndReload()" style="display: block; width: 100%; padding: 12px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            🧹 Очистить кэш и обновить
                        </button>
                    </div>
                `;
            }
        }, 500);
    }
    
    // Запуск первой попытки
    loadNextFallback();
})();