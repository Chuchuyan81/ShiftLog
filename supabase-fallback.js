// Альтернативная загрузка Supabase с fallback
(function() {
    console.log('🔄 Запуск альтернативной загрузки Supabase...');
    
    // Проверяем, загрузился ли Supabase из основного CDN
    if (window.supabase) {
        console.log('✅ Supabase уже загружен из основного CDN');
        return;
    }
    
    console.log('⚠️ Основной CDN недоступен, пробуем альтернативные варианты...');
    
    // Список альтернативных CDN
    const fallbackUrls = [
        'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
        'https://cdn.skypack.dev/@supabase/supabase-js@2',
        'https://esm.sh/@supabase/supabase-js@2'
    ];
    
    let currentIndex = 0;
    
    function loadNextFallback() {
        if (currentIndex >= fallbackUrls.length) {
            console.error('❌ Все альтернативные CDN недоступны');
            
            // Показываем сообщение пользователю
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <h2>⚠️ Проблема с подключением</h2>
                            <p>Не удается загрузить необходимые компоненты.</p>
                            <p>Проверьте подключение к интернету и обновите страницу.</p>
                            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Обновить страницу
                            </button>
                        </div>
                    `;
                }
            }, 1000);
            return;
        }
        
        const url = fallbackUrls[currentIndex];
        console.log(`🔄 Попытка загрузки с ${url}...`);
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url;
        
        script.onload = function() {
            console.log(`✅ Supabase успешно загружен с ${url}`);
            
            // Проверяем что библиотека действительно доступна
            if (window.supabase || window.SupabaseJS) {
                if (window.SupabaseJS && !window.supabase) {
                    window.supabase = window.SupabaseJS;
                }
                console.log('✅ Supabase готов к использованию');
            } else {
                console.warn('⚠️ Библиотека загружена, но глобальный объект недоступен');
                currentIndex++;
                loadNextFallback();
            }
        };
        
        script.onerror = function() {
            console.warn(`❌ Не удалось загрузить с ${url}`);
            currentIndex++;
            loadNextFallback();
        };
        
        // Таймаут для каждой попытки
        setTimeout(() => {
            if (!window.supabase && !window.SupabaseJS) {
                console.warn(`⏰ Таймаут загрузки с ${url}`);
                currentIndex++;
                loadNextFallback();
            }
        }, 5000);
        
        document.head.appendChild(script);
    }
    
    // Небольшая задержка перед началом fallback
    setTimeout(loadNextFallback, 2000);
})(); 