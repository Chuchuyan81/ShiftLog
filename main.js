// Конфигурация Supabase - ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ
const SUPABASE_URL = 'https://ukuhwaulkvpqkwqbqqag.supabase.co'; // https://your-project-id.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWh3YXVsa3ZwcWt3cWJxcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDUzMDgsImV4cCI6MjA2NjQyMTMwOH0.dzSK4aP-QB8QjkZ_JrTc-DHEehLwce2Y2leK_VslBqY'; // ваш anon ключ из Settings > API

// ЭКСТРЕННЫЕ ФУНКЦИИ ДИАГНОСТИКИ - создаются сразу
console.log('🆘 Создаем экстренные функции диагностики...');

window.emergencyDiagnose = function() {
    console.log('=== ЭКСТРЕННАЯ ДИАГНОСТИКА ===');
    console.log('timestamp:', new Date().toISOString());
    console.log('window.supabase:', !!window.supabase);
    console.log('DOM readyState:', document.readyState);
    console.log('Загрузка экран hidden:', document.getElementById('loading-screen')?.classList.contains('hidden'));
    console.log('Главное приложение hidden:', document.getElementById('main-app')?.classList.contains('hidden'));
    console.log('Экран авторизации hidden:', document.getElementById('auth-screen')?.classList.contains('hidden'));
    console.log('Глобальные переменные определены:', {
        currentUser: typeof window.currentUser !== 'undefined',
        isInitializing: typeof window.isInitializing !== 'undefined',
        isInitialized: typeof window.isInitialized !== 'undefined'
    });
};

window.emergencyReload = function() {
    console.log('=== ЭКСТРЕННАЯ ПЕРЕЗАГРУЗКА ===');
    // Очищаем ВСЕ кэши
    localStorage.clear();
    sessionStorage.clear();
    // Принудительная перезагрузка с очисткой кэша
    window.location.reload(true);
};

window.emergencyHideLoading = function() {
    console.log('=== ЭКСТРЕННОЕ СКРЫТИЕ ЗАГРУЗКИ ===');
    const loading = document.getElementById('loading-screen');
    if (loading) {
        loading.classList.add('hidden');
        loading.style.display = 'none';
    }
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.classList.remove('hidden');
    }
};

// Создаем базовые функции диагностики сразу (дубликаты основных)
window.checkAppState = function() {
    console.log('=== БАЗОВОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===');
    console.log('timestamp:', new Date().toISOString());
    console.log('currentUser определен:', typeof window.currentUser !== 'undefined');
    console.log('isInitializing определен:', typeof window.isInitializing !== 'undefined');
    console.log('isInitialized определен:', typeof window.isInitialized !== 'undefined');
    try {
        console.log('Loading screen hidden:', document.getElementById('loading-screen')?.classList.contains('hidden'));
        console.log('Main app hidden:', document.getElementById('main-app')?.classList.contains('hidden'));
        console.log('Auth screen hidden:', document.getElementById('auth-screen')?.classList.contains('hidden'));
    } catch (e) {
        console.log('DOM элементы недоступны:', e.message);
    }
};

window.forceInitialize = function() {
    console.log('=== БАЗОВАЯ ПРИНУДИТЕЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ===');
    if (typeof window.isInitializing !== 'undefined') {
        window.isInitializing = false;
    }
    if (typeof window.isInitialized !== 'undefined') {
        window.isInitialized = false;
    }
    if (typeof window.initializeApp === 'function') {
        window.initializeApp().catch(e => console.error('Ошибка принуд. инициализации:', e));
    } else {
        console.log('initializeApp еще не определена');
    }
};

console.log('✅ Экстренные функции созданы: emergencyDiagnose(), emergencyReload(), emergencyHideLoading()');
console.log('✅ Базовые функции созданы: checkAppState(), forceInitialize()');

// PWA ФУНКЦИОНАЛЬНОСТЬ
let deferredPrompt;
let installButton;

// Обработка события beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 PWA: Событие beforeinstallprompt получено');
    
    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    
    // Сохраняем событие для последующего использования
    deferredPrompt = e;
    
    // Показываем кнопку установки
    showInstallButton();
});

// Обработка успешной установки PWA
window.addEventListener('appinstalled', (e) => {
    console.log('🎉 PWA: Приложение установлено');
    
    // Скрываем кнопку установки
    hideInstallButton();
    
    // Сбрасываем сохраненное событие
    deferredPrompt = null;
    
    // Показываем уведомление пользователю
    showMessage('Успешно!', 'Приложение установлено на ваше устройство');
});

// Функция показа кнопки установки
function showInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'flex';
        console.log('✅ PWA: Кнопка установки показана');
    }
}

// Функция скрытия кнопки установки
function hideInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
        console.log('✅ PWA: Кнопка установки скрыта');
    }
}

// Функция показа кнопки обновления
function showUpdateButton() {
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.style.display = 'flex';
        console.log('✅ PWA: Кнопка обновления показана');
    }
}

// Функция скрытия кнопки обновления
function hideUpdateButton() {
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.style.display = 'none';
        console.log('✅ PWA: Кнопка обновления скрыта');
    }
}

// Функция обработки клика на кнопку установки
async function handleInstallClick() {
    console.log('🔄 PWA: Обработка клика на кнопку установки');
    
    if (!deferredPrompt) {
        console.log('⚠️ PWA: Событие beforeinstallprompt недоступно');
        showMessage('Информация', 'Приложение уже установлено или не поддерживается вашим браузером');
        return;
    }
    
    try {
        // Показываем диалог установки
        deferredPrompt.prompt();
        
        // Ожидаем ответ пользователя
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`📱 PWA: Выбор пользователя: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('✅ PWA: Пользователь принял установку');
        } else {
            console.log('❌ PWA: Пользователь отклонил установку');
        }
        
        // Сбрасываем сохраненное событие
        deferredPrompt = null;
        
        // Скрываем кнопку установки
        hideInstallButton();
        
    } catch (error) {
        console.error('❌ PWA: Ошибка при установке:', error);
        showMessage('Ошибка', 'Не удалось установить приложение');
    }
}

// Функция обработки клика на кнопку обновления
async function handleUpdateClick() {
    console.log('🔄 PWA: Обработка клика на кнопку обновления');
    
    try {
        // Обновляем Service Worker
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                console.log('🔄 PWA: Обновляю Service Worker...');
                await registration.update();
                
                // Перезагружаем страницу для применения обновлений
                window.location.reload();
            } else {
                console.log('⚠️ PWA: Service Worker не найден, перезагружаю страницу');
                window.location.reload();
            }
        } else {
            console.log('⚠️ PWA: Service Worker не поддерживается, перезагружаю страницу');
            window.location.reload();
        }
        
    } catch (error) {
        console.error('❌ PWA: Ошибка при обновлении:', error);
        showMessage('Ошибка', 'Не удалось обновить приложение. Попробуйте перезагрузить страницу.');
    }
}

// Регистрация Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            console.log('🔄 PWA: Регистрация Service Worker...');
            
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('✅ PWA: Service Worker зарегистрирован:', registration.scope);
            
            // Проверяем обновления
            registration.addEventListener('updatefound', () => {
                console.log('🔄 PWA: Найдено обновление Service Worker');
                
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('🔄 PWA: Новая версия доступна');
                            showMessage('Обновление', 'Доступна новая версия приложения. Перезагрузите страницу.');
                        }
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ PWA: Ошибка регистрации Service Worker:', error);
        }
    } else {
        console.log('⚠️ PWA: Service Worker не поддерживается');
    }
}

// Функция для полной очистки кэша и переустановки приложения
async function clearAllCachesAndReload() {
    console.log('🔄 Начинаю полную очистку кэша...');
    
    try {
        // Очищаем все кэши
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log('Найдено кэшей:', cacheNames.length);
            
            for (const cacheName of cacheNames) {
                console.log(`Удаляю кэш: ${cacheName}`);
                await caches.delete(cacheName);
            }
        }
        
        // Удаляем все Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('Найдено Service Workers:', registrations.length);
            
            for (const registration of registrations) {
                console.log('Удаляю Service Worker:', registration.scope);
                await registration.unregister();
            }
        }
        
        // Очищаем localStorage
        localStorage.clear();
        sessionStorage.clear();
        
        console.log('✅ Кэш полностью очищен');
        
        // Принудительная перезагрузка
        window.location.reload(true);
        
    } catch (error) {
        console.error('❌ Ошибка при очистке кэша:', error);
        // Все равно перезагружаем
        window.location.reload(true);
    }
}

// Делаем функцию глобальной для доступа из HTML
window.clearAllCachesAndReload = clearAllCachesAndReload;

// Функция для повторной загрузки библиотеки Supabase
async function ensureSupabaseLoaded() {
    if (window.supabase) {
        console.log('✅ PWA: Библиотека Supabase уже загружена');
        return true;
    }
    
    console.log('🔄 PWA: Библиотека Supabase не найдена');
    
    // Если Supabase не загружен, предлагаем пользователю очистить кэш
    showMessage('Ошибка загрузки', 'Библиотека Supabase не загружена. Попробуйте очистить кэш и обновить страницу.');
    return false;
}

// Функция инициализации PWA
function initializePWA() {
    console.log('🚀 PWA: Инициализация PWA функций...');
    
    // Проверяем, установлено ли приложение
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 PWA: Приложение запущено в standalone режиме');
        hideInstallButton();
        showUpdateButton();
        
        // Дополнительная диагностика для PWA режима
        setTimeout(() => {
            testSupabaseConnectionInPWA();
        }, 2000);
    } else {
        console.log('🌐 PWA: Приложение запущено в браузере');
        hideUpdateButton();
    }
    
    // Обрабатываем URL параметры для шорткатов
    handlePWAShortcuts();
    
    // ВРЕМЕННО ОТКЛЮЧЕН Service Worker для устранения проблем с загрузкой
    // setTimeout(() => {
    //     registerServiceWorker();
    // }, 3000);
    
    console.log('⚠️ PWA: Service Worker временно отключен для устранения проблем');
}

// Обработка URL параметров для PWA шорткатов
function handlePWAShortcuts() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const screen = urlParams.get('screen');
    
    if (action === 'add-shift') {
        console.log('🔥 PWA: Обработка шортката добавления смены');
        // Устанавливаем флаг для открытия модального окна после загрузки
        window.pwaShortcutAction = 'add-shift';
    }
    
    if (screen) {
        console.log(`🔥 PWA: Обработка шортката перехода на экран: ${screen}`);
        // Устанавливаем флаг для переключения экрана после загрузки
        window.pwaShortcutScreen = screen;
    }
}

// Выполнение отложенных PWA действий
function executePWAShortcuts() {
    if (window.pwaShortcutAction === 'add-shift') {
        console.log('🔥 PWA: Выполняем отложенное действие - добавление смены');
        setTimeout(() => {
            const addShiftBtn = document.getElementById('add-shift-btn');
            if (addShiftBtn) {
                addShiftBtn.click();
            }
        }, 1000);
        window.pwaShortcutAction = null;
    }
    
    if (window.pwaShortcutScreen) {
        console.log(`🔥 PWA: Выполняем отложенное действие - переход на экран: ${window.pwaShortcutScreen}`);
        setTimeout(() => {
            switchScreen(window.pwaShortcutScreen);
        }, 500);
        window.pwaShortcutScreen = null;
    }
}

// Диагностика подключения к Supabase в PWA режиме
async function testSupabaseConnectionInPWA() {
    console.log('🔍 PWA: Тестирую подключение к Supabase...');
    
    try {
        // Проверяем, загружена ли библиотека Supabase
        if (!window.supabase) {
            console.warn('⚠️ PWA: Библиотека Supabase не загружена, пытаюсь перезагрузить...');
            
            const loaded = await ensureSupabaseLoaded();
            if (!loaded) {
                showMessage('Ошибка PWA', 'Библиотека Supabase не загружена. Проверьте интернет-соединение и попробуйте обновить приложение.');
                return;
            }
        }
        
        // Проверяем, создан ли клиент Supabase
        if (!supabase) {
            console.warn('⚠️ PWA: Клиент Supabase не создан, пытаюсь создать...');
            
            try {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                        flowType: 'pkce'
                    }
                });
                console.log('✅ PWA: Клиент Supabase создан');
            } catch (createError) {
                console.error('❌ PWA: Ошибка создания клиента Supabase:', createError);
                showMessage('Ошибка PWA', 'Не удается создать клиент Supabase. Попробуйте обновить приложение.');
                return;
            }
        }
        
        // Проверяем подключение к Supabase
        const { data, error } = await supabase.from('venues').select('count', { count: 'exact' });
        
        if (error) {
            console.error('❌ PWA: Ошибка подключения к Supabase:', error);
            showMessage('Ошибка подключения', 'Не удается подключиться к базе данных. Проверьте интернет-соединение.');
            return;
        }
        
        console.log('✅ PWA: Подключение к Supabase успешно');
        
    } catch (error) {
        console.error('❌ PWA: Критическая ошибка при тестировании Supabase:', error);
        showMessage('Критическая ошибка', 'Возникла ошибка при подключении к базе данных. Попробуйте перезапустить приложение.');
    }
}

// Запускаем инициализацию PWA
initializePWA();

// Проверяем загрузку библиотеки Supabase
console.log('Проверка загрузки Supabase:', {
    windowSupabase: !!window.supabase,
    windowSupabaseType: typeof window.supabase
});

// ПРИНУДИТЕЛЬНЫЙ ТАЙМАУТ ДЛЯ СКРЫТИЯ ЗАГРУЗКИ
setTimeout(() => {
    console.log('🚨 ПРИНУДИТЕЛЬНОЕ СКРЫТИЕ ЗАГРУЗКИ ЧЕРЕЗ 15 СЕКУНД');
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        console.log('🔧 Загрузка все еще видна - принудительно скрываем');
        loadingScreen.classList.add('hidden');
        
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app');
        
        // Если есть авторизованный пользователь - показываем приложение
        if (window.currentUser) {
            console.log('👤 Есть пользователь - показываем приложение');
            authScreen?.classList.add('hidden');
            mainApp?.classList.remove('hidden');
        } else {
            console.log('👤 Нет пользователя - показываем авторизацию');
            authScreen?.classList.remove('hidden');
            mainApp?.classList.add('hidden');
        }
        
        console.log('✅ Принудительное скрытие загрузки выполнено');
    }
}, 15000);

// Создаем клиент Supabase с улучшенной инициализацией
let supabase = null;

// Функция для создания клиента Supabase с повторными попытками
async function initSupabaseClient() {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 секунда
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Попытка ${attempt}/${maxRetries} создания клиента Supabase...`);
            
            if (window.supabase) {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                        flowType: 'pkce',
                        refreshThreshold: 5400,
                        storage: window.localStorage,
                        storageKey: 'sb-auth-token'
                    },
                    global: {
                        headers: {
                            'X-Client-Info': 'shiftlog-app'
                        }
                    },
                    realtime: {
                        params: {
                            eventsPerSecond: 10
                        }
                    }
                });
                
                console.log('✅ Supabase клиент создан успешно');
                return supabase;
            }
            
            console.log(`⚠️ window.supabase недоступен, попытка ${attempt}/${maxRetries}`);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            
        } catch (error) {
            console.error(`❌ Ошибка создания клиента Supabase на попытке ${attempt}:`, error);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
    
    // Если не удалось создать клиент, показываем ошибку
    console.error('❌ Не удалось создать клиент Supabase после всех попыток');
    return null;
}

// Инициализируем клиент при загрузке
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            refreshThreshold: 5400,
            storage: window.localStorage,
            storageKey: 'sb-auth-token'
        },
        global: {
            headers: {
                'X-Client-Info': 'shiftlog-app'
            }
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    });
}

console.log('Клиент Supabase создан:', {
    supabaseExists: !!supabase,
    supabaseType: typeof supabase
});

console.log('🚀 Начало загрузки скрипта main.js (НОВАЯ ВЕРСИЯ)');

// ПРИНУДИТЕЛЬНАЯ ПРОВЕРКА АВТОРИЗАЦИИ ПОСЛЕ ЗАГРУЗКИ
setTimeout(async () => {
    console.log('🔐 ПРИНУДИТЕЛЬНАЯ ПРОВЕРКА АВТОРИЗАЦИИ...');
    try {
        const { data: session, error } = await supabase.auth.getSession();
        console.log('🔍 Результат проверки сессии:', { session: !!session?.session, error });
        
        if (session?.session && !currentUser) {
            console.log('🔄 Найдена активная сессия, но currentUser = null. Восстанавливаем...');
            currentUser = session.session.user;
            
            // Принудительно запускаем загрузку данных
            if (!isInitialized && !isInitializing) {
                console.log('🚀 Запускаем инициализацию приложения...');
                await initializeApp();
            }
        }
    } catch (error) {
        console.error('❌ Ошибка проверки авторизации:', error);
    }
}, 3000);

// ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА ИНИЦИАЛИЗАЦИИ ЧЕРЕЗ 5 СЕКУНД
setTimeout(async () => {
    console.log('🔍 ПРОВЕРКА СОСТОЯНИЯ ЧЕРЕЗ 5 СЕКУНД...');
    console.log('Флаги:', { isInitialized, isInitializing, currentUser: !!currentUser });
    
    // Если пользователь не определен, но может быть активная сессия
    if (!currentUser && !isInitializing) {
        console.log('⚠️ Пользователь не определен. Пробуем восстановить...');
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session?.user) {
                console.log('🔄 Восстанавливаем пользователя и инициализируем...');
                await window.restoreAuth();
            } else {
                console.log('❌ Сессия не найдена. Показываем авторизацию.');
                hideLoading();
                showAuthScreen();
            }
        } catch (error) {
            console.error('❌ Ошибка при проверке сессии:', error);
            hideLoading();
            showAuthScreen();
        }
    }
}, 5000);

// ДОПОЛНИТЕЛЬНАЯ ПРИНУДИТЕЛЬНАЯ ЗАЩИТА НА СЛУЧАЙ ЗАВИСАНИЯ
setTimeout(() => {
    console.log('🚨 РЕЗЕРВНАЯ ЗАЩИТА: Проверяем загрузку через 8 секунд');
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        console.log('⚠️ РЕЗЕРВНАЯ ЗАЩИТА СРАБОТАЛА - скрываем загрузку');
        loadingScreen.classList.add('hidden');
        
        if (window.currentUser) {
            document.getElementById('main-app')?.classList.remove('hidden');
            document.getElementById('auth-screen')?.classList.add('hidden');
        } else {
            document.getElementById('auth-screen')?.classList.remove('hidden');
            document.getElementById('main-app')?.classList.add('hidden');
        }
    }
}, 8000);

// Состояние приложения
let currentUser = null;
let currentMonth = new Date();
console.log('🗓️ Инициализация currentMonth:', currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }));
let venues = [];
let products = [];
let shifts = [];
let currency = '₽';
let editingShift = null;
let editingVenue = null;
let editingProduct = null;

// Флаг для предотвращения дублирования инициализации
let isInitializing = false;
let isInitialized = false;

// Переменные для управления сессией
let sessionCheckInterval = null;
let sessionExpirationTime = null;
let lastActivityTime = null;
let isUserActive = true;
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 часа в миллисекундах
const IDLE_TIMEOUT = 60 * 1000; // 1 минута простоя
const SESSION_CHECK_INTERVAL = 30 * 1000; // Проверка каждые 30 секунд
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus'];

// Добавляем CSS-стили для полей продуктов
if (!document.getElementById('product-fields-styles')) {
    const style = document.createElement('style');
    style.id = 'product-fields-styles';
    style.textContent = `
        .product-input-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 5px;
        }
        
        .product-input-group input {
            flex: 1;
            min-width: 80px;
        }
        
        .product-sum {
            min-width: 80px;
            padding: 8px 12px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            text-align: right;
            font-weight: 500;
            color: #374151;
            font-size: 14px;
        }
        
        .product-sum.has-value {
            background: #d1fae5;
            border-color: #10b981;
            color: #059669;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}

// Добавляем CSS-стили для карточек смен
if (!document.getElementById('shift-cards-styles')) {
    const style = document.createElement('style');
    style.id = 'shift-cards-styles';
    style.textContent = `
        .shift-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .shift-card:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-1px);
        }
        
        .shift-card.holiday {
            background: #fef3c7;
            border-color: #f59e0b;
        }
        
        .shift-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .shift-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 60px;
        }
        
        .date-day {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1;
        }
        
        .date-month {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            margin-top: 2px;
        }
        
        .shift-venue {
            flex: 1;
            font-size: 16px;
            font-weight: 500;
            color: #374151;
            margin: 0 16px;
            min-width: 120px;
        }
        
        .shift-amounts {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .amount-item {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            min-width: 80px;
        }
        
        .amount-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 2px;
        }
        
        .amount-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
        }
        
        .shift-products {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 12px;
        }
        
        .products-header {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .product-item:last-child {
            border-bottom: none;
        }
        
        .product-name {
            font-size: 14px;
            color: #374151;
            flex: 1;
        }
        
        .product-details {
            font-size: 14px;
            color: #6b7280;
            font-family: monospace;
            font-weight: 500;
        }
        
        .shifts-container {
            padding: 0;
        }
        
        .shifts-list {
            padding: 0;
            margin: 0;
        }
        
        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
            .shift-header {
                flex-direction: column;
                align-items: stretch;
            }
            
            .shift-date {
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                gap: 8px;
            }
            
            .shift-venue {
                margin: 8px 0;
                text-align: left;
            }
            
            .shift-amounts {
                justify-content: space-between;
            }
            
            .amount-item {
                align-items: flex-start;
            }
        }
    `;
    document.head.appendChild(style);
}

// Инициализация приложения v2.2.0 - ИСПРАВЛЕНИЕ БЕСКОНЕЧНОЙ ЗАГРУЗКИ
console.log('🚀 Начало загрузки скрипта app.js v2.2.0 - ИСПРАВЛЕНИЕ БЕСКОНЕЧНОЙ ЗАГРУЗКИ');
console.log('🕐 Timestamp загрузки:', new Date().toISOString());
console.log('🌐 Среда выполнения:', {
    host: window.location.host,
    protocol: window.location.protocol,
    userAgent: navigator.userAgent.substring(0, 100),
    isLocalhost: window.location.hostname === 'localhost',
    timestamp: new Date().toISOString()
});

console.log('🔧 Доступные функции диагностики в консоли:');
console.log('  • diagnoseConnection() - проверка соединения с Supabase');
console.log('  • testUserAuth() - тест аутентификации пользователя');
console.log('  • retryDataLoad() - повторная загрузка данных');
console.log('  • refreshUserData() - принудительное обновление всех данных');
console.log('  • debugCurrentUser() - отладка текущего пользователя');
console.log('  • testShiftProducts() - тест сохранения продуктов смены');
console.log('  • checkAppState() - проверка состояния приложения');
console.log('  • forceInitialize() - принудительная инициализация приложения');
console.log('  • forceReload() - принудительная перезагрузка страницы');

function initApp() {
    console.log('🚀 Инициализация приложения начата');
    console.log('📊 Состояние перед инициализацией:', {
        supabaseExists: !!supabase,
        currentUser: currentUser,
        documentReady: document.readyState,
        isInitializing: isInitializing,
        isInitialized: isInitialized
    });
    
    try {
        // Принудительно скрываем все модальные окна при загрузке
        console.log('🔄 Закрываем модальные окна...');
        closeAllModals();
        console.log('✅ Модальные окна закрыты');
        
        console.log('🔄 Проверяем состояние перед initializeApp...');
        console.log('   DOM готов:', document.readyState);
        console.log('   supabase клиент:', !!supabase);
        console.log('   isInitializing:', isInitializing);
        console.log('   isInitialized:', isInitialized);
        
        console.log('🔄 Запуск initializeApp...');
        const initPromise = initializeApp();
        console.log('📝 initializeApp Promise создан');
        
        initPromise.then(() => {
            console.log('✅ initializeApp завершена успешно');
        }).catch(error => {
            console.error('❌ Критическая ошибка в initializeApp:', error);
            hideLoading();
            showMessage('Ошибка', 'Критическая ошибка инициализации: ' + error.message);
        });
        
        console.log('✅ initApp завершена, ожидаем initializeApp');
        
    } catch (error) {
        console.error('❌ Ошибка в initApp:', error);
        hideLoading();
        showMessage('Ошибка', 'Ошибка инициализации приложения: ' + error.message);
    }
}

// Устанавливаем таймаут для инициализации
const initTimeout = setTimeout(() => {
    console.error('⏰ Таймаут инициализации! Принудительно показываем интерфейс');
    hideLoading();
    showAuthScreen();
    showMessage('Предупреждение', 'Загрузка заняла слишком много времени. Возможны проблемы с подключением к интернету.');
}, 10000); // 10 секунд

function initAppWithTimeout() {
    clearTimeout(initTimeout);
    initApp();
}

if (document.readyState === 'loading') {
    console.log('DOM еще загружается, ждем DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initAppWithTimeout);
} else {
    console.log('DOM уже загружен, запускаем инициализацию');
    initAppWithTimeout();
}

async function initializeApp() {
    console.log('🔧 initializeApp запущена - START');
    console.log('📊 Начальное состояние:', {
        isInitializing: isInitializing,
        isInitialized: isInitialized,
        supabaseExists: !!supabase,
        timestamp: new Date().toISOString()
    });
    
    // Проверяем, не идет ли уже инициализация
    if (isInitializing) {
        console.log('⚠️ Инициализация уже идет, пропускаем повторный вызов');
        return;
    }
    
    if (isInitialized) {
        console.log('✅ Приложение уже инициализировано');
        return;
    }
    
    isInitializing = true;
    console.log('🔒 Устанавливаем флаг инициализации - isInitializing = true');
    
    // Проверяем наличие Supabase клиента
    console.log('🔍 Шаг 1: Проверяем Supabase клиент...');
    if (!supabase) {
        console.log('⚠️ Supabase клиент недоступен, пытаемся инициализировать...');
        
        // Пытаемся создать клиент повторно
        supabase = await initSupabaseClient();
        
        if (!supabase) {
            console.error('❌ Не удалось создать клиент Supabase');
            hideLoading();
            showMessage('Ошибка', 'Не удалось подключиться к базе данных. Проверьте интернет-соединение.');
            showAuthScreen();
            isInitializing = false;
            return;
        }
    }

    console.log('✅ Supabase клиент доступен');
    console.log('🔍 Шаг 2: Проверяем сессию...');
    
    try {
        // Проверяем текущую сессию
        console.log('🔍 Шаг 3: Получаем сессию из Supabase...');
        const sessionResult = await supabase.auth.getSession();
        console.log('📝 Сырой результат getSession:', sessionResult);
        
        const { data: { session } } = sessionResult;
        console.log('📝 Обработанная сессия:', { session: !!session, userId: session?.user?.id });
        
        if (session) {
            console.log('🔍 Шаг 4: Пользователь авторизован, настраиваем...');
            currentUser = session.user;
            console.log('✅ currentUser установлен:', currentUser.id);
            
            // Запускаем проверку сессии только для авторизованных пользователей
            console.log('🔍 Шаг 5: Запускаем проверку сессии...');
            startSessionCheck();
            console.log('✅ Проверка сессии запущена');
            
            // Загружаем данные пользователя с таймаутом
            console.log('🔍 Шаг 6: Начинаем загрузку данных пользователя...');
            const loadTimeout = setTimeout(() => {
                console.error('⏰ ТАЙМАУТ! Загрузка данных заняла слишком много времени');
                hideLoading();
                showMainApp();
                showMessage('Предупреждение', 'Загрузка данных заняла слишком много времени. Некоторые данные могут быть недоступны.');
            }, 30000); // 30 секунд таймаут
            
            try {
                console.log('🔍 Шаг 7: Вызываем loadUserData()...');
                await loadUserData();
                console.log('✅ loadUserData() завершена успешно');
            } catch (error) {
                console.error('❌ Ошибка при загрузке данных пользователя:', error);
                showMessage('Предупреждение', 'Произошла ошибка при загрузке данных. Приложение работает в ограниченном режиме.');
            } finally {
                clearTimeout(loadTimeout);
                console.log('🔍 Шаг 8: Очищен таймаут загрузки');
            }
            
            // Скрываем загрузку и показываем основное приложение
            console.log('🔍 Шаг 9: Скрываем загрузку и показываем приложение...');
            hideLoading();
            showMainApp();
            console.log('✅ Основное приложение показано');
            
        } else {
            console.log('ℹ️ Пользователь не авторизован');
            console.log('🔍 Шаг 4alt: Показываем экран авторизации...');
            // Скрываем загрузку и показываем экран авторизации
            hideLoading();
            showAuthScreen();
            console.log('✅ Экран авторизации показан');
        }

        console.log('🔍 Шаг 10: Настраиваем обработчики событий...');
        setupEventListeners();
        console.log('✅ Обработчики событий настроены');
        
        console.log('🔍 Шаг 11: Настраиваем auth listener...');
        // Настраиваем auth listener ПОСЛЕ основной инициализации
        setupAuthStateListener();
        console.log('✅ Auth listener настроен');
        
        console.log('🔍 Шаг 12: Инициализируем PWA...');
        // Инициализируем PWA ПОСЛЕ основной инициализации
        initializePWA();
        console.log('✅ PWA инициализирован');
        
        console.log('🔍 Шаг 13: Отмечаем инициализацию как завершенную...');
        // Отмечаем, что инициализация завершена
        isInitialized = true;
        console.log('✅ isInitialized = true');
        console.log('🎉 ИНИЦИАЛИЗАЦИЯ ПОЛНОСТЬЮ ЗАВЕРШЕНА!');
        
    } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при инициализации:', error);
        console.error('Stack trace:', error.stack);
        console.log('🔍 Состояние при ошибке:', {
            isInitializing: isInitializing,
            isInitialized: isInitialized,
            currentUser: !!currentUser
        });
        hideLoading();
        showMessage('Ошибка', 'Произошла ошибка при инициализации приложения: ' + error.message);
        showAuthScreen();
    } finally {
        console.log('🔍 Finally блок: Сбрасываем isInitializing...');
        isInitializing = false;
        console.log('✅ isInitializing = false');
        console.log('🔍 Финальное состояние:', {
            isInitializing: isInitializing,
            isInitialized: isInitialized,
            timestamp: new Date().toISOString()
        });
    }
}

// Функции управления сессией
function startSessionCheck() {
    console.log('🔄 Запуск проверки сессии с отслеживанием активности');
    
    // Инициализируем время последней активности
    lastActivityTime = Date.now();
    isUserActive = true;
    
    // Очищаем предыдущий интервал, если он есть
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    
    // Настраиваем отслеживание активности
    setupActivityTracking();
    
    // Запускаем периодическую проверку
    sessionCheckInterval = setInterval(checkSessionExpiration, SESSION_CHECK_INTERVAL);
}

function stopSessionCheck() {
    console.log('🛑 Остановка проверки сессии');
    
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
    
    // Очищаем отслеживание активности
    removeActivityTracking();
    
    sessionExpirationTime = null;
    lastActivityTime = null;
    isUserActive = false;
}

async function checkSessionExpiration() {
    try {
        // Проверяем наличие активной сессии
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            // Если нет сессии, но пользователь был авторизован - значит сессия истекла
            if (currentUser) {
                console.log('⚠️ Сессия истекла для авторизованного пользователя');
                handleSessionExpired();
            } else {
                console.log('ℹ️ Нет активной сессии (пользователь не авторизован)');
                // Не делаем ничего - это нормально для неавторизованного пользователя
            }
            return;
        }
        
        // Проверяем срок истечения токена
        const tokenExpiresAt = session.expires_at * 1000; // Конвертируем в миллисекунды
        const now = Date.now();
        
        if (now >= tokenExpiresAt) {
            console.log('⚠️ Токен истек, перенаправляем на авторизацию');
            handleSessionExpired();
            return;
        }
        
        // Проверяем активность пользователя
        const timeSinceLastActivity = now - lastActivityTime;
        
        if (timeSinceLastActivity >= IDLE_TIMEOUT) {
            // Пользователь неактивен больше минуты
            if (isUserActive) {
                console.log('😴 Пользователь неактивен, запускаем отсчет сессии');
                isUserActive = false;
                sessionExpirationTime = now + SESSION_DURATION; // Начинаем отсчет с этого момента
            }
            
            // Проверяем истечение сессии после начала отсчета
            if (sessionExpirationTime && now >= sessionExpirationTime) {
                console.log('⚠️ Сессия истекла после простоя, перенаправляем на авторизацию');
                handleSessionExpired();
                return;
            }
            
            // Если до истечения осталось меньше 5 минут, показываем предупреждение
            if (sessionExpirationTime) {
                const timeLeft = sessionExpirationTime - now;
                if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
                    console.log('⚠️ Сессия истекает через 5 минут');
                    showMessage('Предупреждение', 'Ваша сессия истекает через 5 минут. Сохраните важные данные.');
                }
            }
        } else {
            // Пользователь активен, сбрасываем отсчет
            if (!isUserActive) {
                console.log('🎯 Пользователь снова активен, сбрасываем отсчет сессии');
                isUserActive = true;
                sessionExpirationTime = null;
            }
        }
        
    } catch (error) {
        console.error('❌ Ошибка при проверке сессии:', error);
        handleSessionExpired();
    }
}

function handleSessionExpired() {
    console.log('🔐 Обработка истечения сессии');
    
    // Проверяем, был ли пользователь действительно авторизован
    const wasUserLoggedIn = currentUser !== null;
    
    // Останавливаем проверку сессии
    stopSessionCheck();
    
    // Очищаем данные пользователя
    currentUser = null;
    venues = [];
    products = [];
    shifts = [];
    
    // Выходим из системы
    if (supabase) {
        supabase.auth.signOut();
    }
    
    // Показываем экран авторизации
    showAuthScreen();
    
    // Показываем сообщение только если пользователь был авторизован
    if (wasUserLoggedIn) {
        showMessage('Сессия истекла', 'Ваша сессия истекла. Войдите в систему заново.');
    }
}

// Функции отслеживания активности пользователя
function setupActivityTracking() {
    console.log('🎯 Настройка отслеживания активности');
    
    // Добавляем слушатели для всех событий активности
    ACTIVITY_EVENTS.forEach(eventName => {
        document.addEventListener(eventName, handleUserActivity, true);
    });
    
    // Отслеживаем фокус/потерю фокуса окна
    window.addEventListener('focus', handleUserActivity);
    window.addEventListener('blur', handleUserInactive);
}

function removeActivityTracking() {
    console.log('🛑 Удаление отслеживания активности');
    
    // Удаляем слушатели событий активности
    ACTIVITY_EVENTS.forEach(eventName => {
        document.removeEventListener(eventName, handleUserActivity, true);
    });
    
    window.removeEventListener('focus', handleUserActivity);
    window.removeEventListener('blur', handleUserInactive);
}

function handleUserActivity() {
    lastActivityTime = Date.now();
    
    // Если пользователь был неактивен, отмечаем его как активного
    if (!isUserActive) {
        console.log('🎯 Пользователь снова активен');
        isUserActive = true;
        sessionExpirationTime = null; // Сбрасываем отсчет сессии
    }
}

function handleUserInactive() {
    console.log('😴 Окно потеряло фокус');
    // Не изменяем lastActivityTime, чтобы начать отсчет неактивности
}

// Показать/скрыть экраны
function showLoading() {
    document.getElementById('loading-screen').classList.remove('hidden');
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function hideLoading() {
    console.log('🎯 hideLoading вызвана');
    console.log('🎯 Скрываем экран загрузки...');
    document.getElementById('loading-screen').classList.add('hidden');
    console.log('✅ Экран загрузки скрыт');
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
    console.log('🎯 showMainApp вызвана');
    console.log('🎯 Скрываем экран авторизации...');
    document.getElementById('auth-screen').classList.add('hidden');
    console.log('🎯 Показываем главное приложение...');
    document.getElementById('main-app').classList.remove('hidden');
    console.log('🎯 Обновляем отображение месяца...');
    updateMonthDisplay();
    console.log('🎯 Выполняем PWA шорткаты...');
    executePWAShortcuts();
    console.log('✅ showMainApp завершена');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Аутентификация
    setupAuthListeners();
    
    // Навигация
    setupNavigationListeners();
    
    // Смены
    setupShiftsListeners();
    
    // Настройки
    setupSettingsListeners();
    
    // Отчеты
    setupReportsListeners();
    
    // Модальные окна
    setupModalListeners();
    
    // PWA установка
    setupPWAListeners();
}

function setupAuthListeners() {
    // Переключение вкладок аутентификации
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const isLogin = e.target.dataset.tab === 'login';
            document.getElementById('confirm-password-group').classList.toggle('hidden', isLogin);
            document.querySelector('#auth-form button[type="submit"]').textContent = isLogin ? 'Войти' : 'Зарегистрироваться';
        });
    });
    
    // Форма аутентификации
    document.getElementById('auth-form').addEventListener('submit', handleAuth);
    
    // Восстановление пароля
    document.getElementById('forgot-password-btn').addEventListener('click', handleForgotPassword);
    
    // Выход
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

function setupNavigationListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screen = e.target.dataset.screen;
            if (screen) {
                switchScreen(screen);
            }
        });
    });
}

function setupPWAListeners() {
    // Обработчик кнопки установки PWA
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', handleInstallClick);
        console.log('✅ PWA: Обработчик кнопки установки добавлен');
    }
    
    // Обработчик кнопки обновления PWA
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', handleUpdateClick);
        console.log('✅ PWA: Обработчик кнопки обновления добавлен');
    }
}

function setupShiftsListeners() {
    // Навигация по месяцам
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateMonthDisplay();
        loadShifts();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateMonthDisplay();
        loadShifts();
    });
    
    // Добавление смены
    document.getElementById('add-shift-btn').addEventListener('click', async () => await openShiftModal());
    
    // Форма смены
    document.getElementById('shift-form').addEventListener('submit', handleShiftSubmit);
    
    // Переключение рабочий день/выходной
    document.querySelectorAll('input[name="workday"]').forEach(radio => {
        radio.addEventListener('change', toggleWorkFields);
    });
    
    // Автоматический расчет при изменении полей
    ['shift-venue', 'shift-payout', 'shift-tips'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateShiftTotals);
    });
}

function setupSettingsListeners() {
    // Заведения
    document.getElementById('add-venue-btn').addEventListener('click', () => openVenueModal());
    document.getElementById('venue-form').addEventListener('submit', handleVenueSubmit);
    
    // Позиции
    document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    
    // Тип комиссии
    document.getElementById('commission-type').addEventListener('change', updateCommissionLabel);
    
    // Валюта
    document.getElementById('currency-select').addEventListener('change', (e) => {
        currency = e.target.value;
        localStorage.setItem('currency', currency);
        updateCurrencyDisplay();
    });
    
    // Очистка кэша
    document.getElementById('clear-cache-btn').addEventListener('click', () => {
        if (confirm('Это действие очистит весь кэш и перезагрузит приложение. Продолжить?')) {
            clearAllCachesAndReload();
        }
    });
    

    
    // Добавляем глобальную функцию для теста кнопки сохранения
    window.testSaveButton = function() {
        console.log('=== ТЕСТ КНОПКИ СОХРАНЕНИЯ ===');
        
        const form = document.getElementById('shift-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const modal = document.getElementById('shift-modal');
        
        console.log('Форма shift-form:', form);
        console.log('Кнопка submit:', submitBtn);
        console.log('Модальное окно открыто?', !modal.classList.contains('hidden'));
        
        // Проверяем обработчики событий
        const listeners = getEventListeners(form);
        console.log('Обработчики событий формы:', listeners);
        
        // Попробуем программно запустить submit
        console.log('Пробуем программный submit...');
        try {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        } catch (error) {
            console.error('Ошибка при программном submit:', error);
        }
    };
    
    // Добавляем глобальные функции для диагностики
    window.diagnoseConnection = diagnoseConnection;
    window.testUserAuth = async function() {
        console.log('=== ТЕСТ АУТЕНТИФИКАЦИИ ПОЛЬЗОВАТЕЛЯ ===');
        try {
            const result = await getCurrentUser();
            console.log('Результат:', result);
            return result;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    };
    window.retryDataLoad = async function() {
        console.log('=== ПОВТОРНАЯ ЗАГРУЗКА ДАННЫХ ===');
        if (currentUser) {
            await refreshUserData();
            console.log('Данные перезагружены');
        } else {
            console.log('Нет авторизованного пользователя');
        }
    };
    
    // Добавляем глобальную функцию для теста значений из консоли
    window.testProductValues = function() {
        console.log('=== ТЕСТ ЗНАЧЕНИЙ ПОЛЕЙ ПРОДУКТОВ ===');
        const allInputs = document.querySelectorAll('#product-fields .product-input');
        console.log(`Найдено ${allInputs.length} полей продуктов:`);
        
        allInputs.forEach((input, index) => {
            console.log(`Поле ${index + 1}:`, {
                id: input.id,
                'data-product-id': input.getAttribute('data-product-id'),
                value: input.value,
                element: input
            });
        });
        
        // Тестируем поиск по селекторам
        const testProductId = allInputs[0]?.getAttribute('data-product-id');
        if (testProductId) {
            const byGlobalSelector = document.querySelector(`[data-product-id="${testProductId}"]`);
            const shiftModal = document.getElementById('shift-modal');
            const byModalSelector = shiftModal.querySelector(`[data-product-id="${testProductId}"]`);
            const byId = document.getElementById(`product-${testProductId}`);
            console.log('Тест поиска для первого продукта:');
            console.log('По глобальному селектору (НЕПРАВИЛЬНО):', byGlobalSelector);
            console.log('По селектору в модальном окне (ПРАВИЛЬНО):', byModalSelector);
            console.log('По ID:', byId);
            console.log('Модальный селектор = ID?', byModalSelector === byId);
        }
    };
}

function setupReportsListeners() {
    // Навигация по месяцам в отчетах
    document.getElementById('reports-prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateReportsMonth();
        generateReports();
    });
    
    document.getElementById('reports-next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateReportsMonth();
        generateReports();
    });
    
    // Премия
    document.getElementById('bonus-input').addEventListener('input', calculateNetEarnings);
    
    // Экспорт
    document.getElementById('export-btn').addEventListener('click', exportData);
}

function setupModalListeners() {
    // Закрытие основных модальных окон
    ['close-shift-modal', 'cancel-shift', 'close-venue-modal', 'cancel-venue', 
     'close-product-modal', 'cancel-product'].forEach(id => {
        document.getElementById(id).addEventListener('click', closeAllModals);
    });
    
    // Закрытие ТОЛЬКО информационного сообщения (не затрагивает другие модальные окна)
    ['close-message-modal', 'close-message'].forEach(id => {
        document.getElementById(id).addEventListener('click', closeMessageModal);
    });
    
    // Удаление
    document.getElementById('delete-shift').addEventListener('click', deleteShift);
    document.getElementById('delete-venue').addEventListener('click', deleteVenue);
    document.getElementById('delete-product').addEventListener('click', deleteProduct);
    
    // Кнопка добавления позиции в заведение
    document.getElementById('add-venue-product').addEventListener('click', addVenueProduct);
    
    // Закрытие по клику вне модального окна отключено
    // Модальные окна закрываются только по кнопкам "Сохранить" или "Отмена"
}

// Аутентификация
async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isLogin = document.querySelector('.tab-btn.active').dataset.tab === 'login';
    
    if (!isLogin) {
        const confirmPassword = document.getElementById('confirm-password').value;
        if (password !== confirmPassword) {
            showMessage('Ошибка', 'Пароли не совпадают');
            return;
        }
    }
    
    try {
        let result;
        if (isLogin) {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            result = await supabase.auth.signUp({ email, password });
        }
        
        if (result.error) {
            throw result.error;
        }
        
        if (!isLogin && !result.data.user.email_confirmed_at) {
            showMessage('Успех', 'Проверьте email для подтверждения регистрации');
            return;
        }
        
        currentUser = result.data.user;
        console.log('Пользователь после входа:', currentUser.id);
        
        // Запускаем проверку сессии
        startSessionCheck();
        
        await loadUserData();
        showMainApp();
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('email').value;
    if (!email) {
        showMessage('Ошибка', 'Введите email для восстановления пароля');
        return;
    }
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        
        showMessage('Успех', 'Инструкции по восстановлению пароля отправлены на email');
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

async function handleLogout() {
    try {
        // Останавливаем проверку сессии
        stopSessionCheck();
        
        // Очищаем кэш данных
        clearDataCache();
        
        await supabase.auth.signOut();
        currentUser = null;
        venues = [];
        products = [];
        shifts = [];
        showAuthScreen();
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

// Навигация
function switchScreen(screenName) {
    // Обновляем активную кнопку навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenName);
    });
    
    // Показываем нужный экран
    document.querySelectorAll('.content-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(`${screenName}-screen`).classList.remove('hidden');
    
    // Загружаем данные для экрана
    switch (screenName) {
        case 'shifts':
            loadShifts();
            break;
        case 'reports':
            generateReports();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}



// Загрузка данных пользователя с оптимизацией для слабого интернета
async function loadUserData() {
    console.log('🔄 loadUserData начата с улучшенной загрузкой');
    
    try {
        console.log('💰 Загружаем настройки валюты...');
        currency = localStorage.getItem('currency') || '₽';
        document.getElementById('currency-select').value = currency;
        console.log('✅ Валюта установлена:', currency);
        
        // Проверяем текущего пользователя
        console.log('🔧 Получаем текущего пользователя...');
        currentUser = await getCurrentUser();
        
        if (!currentUser) {
            console.log('ℹ️ Пользователь не найден');
            return;
        }
        
        console.log('✅ Пользователь найден:', currentUser.id);
        
        // Используем кэшированные данные если доступны
        loadCachedData();
        
        // Загружаем критически важные данные последовательно
        console.log('1️⃣ Загружаем заведения...');
        await loadVenuesOptimized();
        updateVenueSelects();
        
        console.log('2️⃣ Загружаем продукты...');
        await loadProductsOptimized();
        
        console.log('3️⃣ Загружаем смены...');
        await loadShiftsOptimized();
        
        console.log('✅ Все данные загружены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка при загрузке данных пользователя:', error);
        
        // КРИТИЧЕСКИ ВАЖНО: скрываем загрузку и показываем приложение
        console.log('🔧 Принудительно скрываем загрузку и показываем приложение...');
        hideLoading();
        showMainApp();
        
        // Показываем предупреждение, но не прерываем работу
        showMessage('Предупреждение', 'Произошла ошибка при загрузке данных. Приложение работает в ограниченном режиме.');
        console.log('✅ Приложение показано несмотря на ошибку загрузки данных');
    }
}

// Функции для оптимизированной загрузки данных
function loadCachedData() {
    console.log('📦 Загружаем кэшированные данные...');
    
    try {
        // Загружаем кэшированные заведения
        const cachedVenues = localStorage.getItem('cached_venues');
        if (cachedVenues) {
            venues = JSON.parse(cachedVenues);
            console.log('✅ Загружено кэшированных заведений:', venues.length);
        }
        
        // Загружаем кэшированные продукты
        const cachedProducts = localStorage.getItem('cached_products');
        if (cachedProducts) {
            products = JSON.parse(cachedProducts);
            console.log('✅ Загружено кэшированных продуктов:', products.length);
        }
        
        // Обновляем интерфейс с кэшированными данными
        if (venues.length > 0) {
            updateVenueSelects();
            renderVenuesList();
        }
        
        if (products.length > 0) {
            renderProductsList();
        }
        
    } catch (error) {
        console.error('❌ Ошибка при загрузке кэшированных данных:', error);
    }
}

async function loadVenuesOptimized() {
    console.log('🏢 Оптимизированная загрузка заведений с retry');
    
    if (!currentUser?.id) {
        console.error('❌ Нет авторизованного пользователя');
        return;
    }
    
    const maxRetries = 2;
    const baseTimeout = 5000; // Увеличиваем базовый таймаут
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timeout = baseTimeout * Math.pow(1.5, attempt - 1);
            console.log(`🔄 Загрузка заведений, попытка ${attempt}/${maxRetries}, таймаут: ${timeout}ms`);
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Таймаут загрузки заведений (${timeout}ms)`)), timeout)
            );
            
            const venuesPromise = supabase
                .from('venues')
                .select('id, name, user_id, default_fixed_payout') // Загружаем нужные поля
                .eq('user_id', currentUser.id)
                .order('name');
            
            const { data, error } = await Promise.race([venuesPromise, timeoutPromise]);
            
            if (error) {
                throw error;
            }
            
            venues = data || [];
            console.log(`✅ Заведения загружены на попытке ${attempt}:`, venues.length);
            
            // Кэшируем данные
            localStorage.setItem('cached_venues', JSON.stringify(venues));
            
            // Обновляем интерфейс
            updateVenueSelects();
            renderVenuesList();
            
            return; // Успешно загружено
            
        } catch (error) {
            if (attempt === maxRetries) {
                console.warn('⚠️ Не удалось загрузить заведения после всех попыток:', error);
                // Используем кэшированные данные если есть
                if (venues.length === 0) {
                    console.log('📦 Используем кэшированные заведения');
                    loadCachedData();
                }
            } else {
                console.warn(`⚠️ Попытка ${attempt} загрузки заведений неудачна:`, error.message);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}

async function loadProductsAndShiftsInBackground() {
    console.log('🔄 Фоновая загрузка продуктов и смен');
    
    // Загружаем с задержкой, чтобы не блокировать интерфейс
    setTimeout(async () => {
        try {
            console.log('📦 Загружаем продукты в фоне...');
            await loadProductsOptimized();
            
            console.log('📅 Загружаем смены в фоне...');
            await loadShiftsOptimized();
            
            console.log('✅ Фоновая загрузка завершена');
        } catch (error) {
            console.error('❌ Ошибка фоновой загрузки:', error);
        }
    }, 500); // Задержка 500мс
}

async function loadProductsOptimized() {
    if (!currentUser?.id) return;
    
    const maxRetries = 2;
    const baseTimeout = 6000;
    
    console.log('📦 Оптимизированная загрузка продуктов с retry');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timeout = baseTimeout * Math.pow(1.5, attempt - 1);
            console.log(`🔄 Загрузка продуктов, попытка ${attempt}/${maxRetries}, таймаут: ${timeout}ms`);
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Таймаут загрузки продуктов (${timeout}ms)`)), timeout)
            );
            
            const productsPromise = supabase
                .from('venue_products')
                .select('id, name, price_per_unit, commission_type, commission_value, venue_id')
                .in('venue_id', venues.map(v => v.id))
                .order('name')
                .limit(100); // Увеличиваем лимит
            
            const { data, error } = await Promise.race([productsPromise, timeoutPromise]);
            
            if (error) {
                throw error;
            }
            
            if (data) {
                products = data;
                console.log(`✅ Продукты загружены на попытке ${attempt}:`, products.length);
                
                // Кэшируем данные
                localStorage.setItem('cached_products', JSON.stringify(products));
                
                // Обновляем интерфейс
                renderProductsList();
                updateProductFields();
                
                return; // Успешно загружено
            }
            
        } catch (error) {
            if (attempt === maxRetries) {
                console.warn('⚠️ Не удалось загрузить продукты после всех попыток:', error);
            } else {
                console.warn(`⚠️ Попытка ${attempt} загрузки продуктов неудачна:`, error.message);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}

async function loadShiftsOptimized() {
    if (!currentUser?.id) {
        console.log('⚠️ Нет авторизованного пользователя для загрузки смен');
        return;
    }
    
    const maxRetries = 3;
    const baseTimeout = 8000; // Увеличиваем базовый таймаут
    
    console.log('📅 Загружаем смены с оптимизацией и retry');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timeout = baseTimeout * Math.pow(1.2, attempt - 1);
            console.log(`🔄 Загрузка смен, попытка ${attempt}/${maxRetries}, таймаут: ${timeout}ms`);
            
            // Используем более широкий диапазон дат для гарантированной загрузки
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
            
            // Добавляем диагностику параметров запроса
            console.log('📋 Параметры запроса смен:', {
                userId: currentUser.id,
                startDate: startOfMonth.toISOString().split('T')[0],
                endDate: endOfMonth.toISOString().split('T')[0],
                currentMonth: currentMonth.toISOString().split('T')[0]
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Таймаут загрузки смен (${timeout}ms)`)), timeout)
            );
            
            const shiftsPromise = supabase
                .from('shifts')
                .select('id, shift_date, is_workday, venue_id, fixed_payout, tips, revenue_generated, earnings, user_id')
                .eq('user_id', currentUser.id)
                .gte('shift_date', startOfMonth.toISOString().split('T')[0])
                .lte('shift_date', endOfMonth.toISOString().split('T')[0])
                .order('shift_date', { ascending: false });
            
            const { data, error } = await Promise.race([shiftsPromise, timeoutPromise]);
            
            if (error) {
                throw error;
            }
            
            shifts = data || [];
            console.log(`✅ Смены загружены на попытке ${attempt}:`, shifts.length);
            console.log('📋 ПОДРОБНЫЕ ДАННЫЕ СМЕН:', data);
            console.log('📅 Период загрузки:', {
                start: startOfMonth.toISOString().split('T')[0],
                end: endOfMonth.toISOString().split('T')[0],
                currentMonth: currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
            });
            
            // Немедленно обновляем интерфейс
            renderShiftsList();
            
            // Если смен нет, показываем информативное сообщение
            if (shifts.length === 0) {
                console.log('ℹ️ Нет смен за текущий месяц');
                const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
                showMessage('Информация', `Нет смен за ${monthName}. Добавьте первую смену!`);
            }
            
            return; // Успешно загружено
            
        } catch (error) {
            console.warn(`⚠️ Попытка ${attempt} загрузки смен неудачна:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('❌ Не удалось загрузить смены после всех попыток:', error);
                
                // Показываем пустой список с информативным сообщением
                shifts = [];
                renderShiftsList();
                
                showMessage('Предупреждение', 'Не удалось загрузить смены. Проверьте интернет-соединение.');
            } else {
                // Задержка перед следующей попыткой
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}

// Функция для очистки кэша
function clearDataCache() {
    console.log('🧹 Очистка кэша данных');
    localStorage.removeItem('cached_venues');
    localStorage.removeItem('cached_products');
}

// Функция для обновления кэша
function updateDataCache() {
    try {
        if (venues.length > 0) {
            localStorage.setItem('cached_venues', JSON.stringify(venues));
        }
        if (products.length > 0) {
            localStorage.setItem('cached_products', JSON.stringify(products));
        }
        console.log('📦 Кэш обновлен');
    } catch (error) {
        console.error('❌ Ошибка обновления кэша:', error);
    }
}

// Функция диагностики соединения
async function diagnoseConnection() {
    console.log('🔧 Диагностика соединения с Supabase...');
    
    // Проверяем основные параметры
    console.log('📋 Основные параметры:', {
        onlineStatus: navigator.onLine,
        supabaseUrl: SUPABASE_URL,
        hasSupabaseClient: !!supabase,
        currentUser: !!currentUser,
        timestamp: new Date().toISOString()
    });
    
    // Простой тест соединения
    try {
        const startTime = Date.now();
        const { data, error } = await supabase.from('venues').select('count').limit(1);
        const elapsed = Date.now() - startTime;
        
        console.log(`✅ Тест соединения успешен (${elapsed}ms):`, { data, error });
        return { success: true, latency: elapsed };
    } catch (error) {
        console.error('❌ Тест соединения неудачен:', error);
        return { success: false, error: error.message };
    }
}

async function loadVenues() {
    console.log('🏢 loadVenues начата');
    
    if (!currentUser || !currentUser.id) {
        console.error('❌ Пользователь не авторизован для загрузки заведений');
        return;
    }
    
    console.log('👤 Загружаем заведения для пользователя:', currentUser.id);
    
    // Диагностика Supabase соединения
    console.log('🔍 Диагностика Supabase:');
    console.log('📡 Supabase URL:', supabase?.supabaseUrl || 'не определен');
    console.log('🔑 Supabase Key:', supabase?.supabaseKey ? 'установлен' : 'не установлен');
    console.log('⚡ Supabase auth:', supabase?.auth ? 'доступен' : 'недоступен');
    
    // Проверка интернет соединения
    console.log('🌐 Проверяем интернет соединение...');
    console.log('📱 Online status:', navigator.onLine ? 'подключен' : 'отключен');
    
    if (!navigator.onLine) {
        console.warn('⚠️ Нет интернет соединения');
        showMessage('Предупреждение', 'Нет интернет соединения. Приложение работает в автономном режиме.');
        venues = [];
        updateVenueSelects();
        renderVenuesList();
        return;
    }
    
    try {
        console.log('🔍 Выполняем запрос к таблице venues...');
        
        // Разумные таймауты
        const timeoutDuration = window.location.hostname === 'localhost' ? 15000 : 10000;
        console.log(`⏱️ Используем таймаут: ${timeoutDuration/1000} секунд`);
        
        // Пробуем несколько раз с retry
        let lastError = null;
        let data = null;
        
        for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`🔄 Попытка ${attempt}/2 загрузки venues...`);
            
            try {
                const venuesPromise = supabase
                    .from('venues')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('name');
                    
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Таймаут запроса venues (попытка ${attempt})`)), timeoutDuration)
                );
                
                const result = await Promise.race([venuesPromise, timeoutPromise]);
                
                if (result.error) {
                    lastError = result.error;
                    console.warn(`⚠️ Ошибка в попытке ${attempt}:`, result.error);
                    if (attempt < 3) {
                        console.log('⏳ Ждем 2 секунды перед повтором...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                } else {
                    data = result.data;
                    console.log(`✅ Успех в попытке ${attempt}!`);
                    break;
                }
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Исключение в попытке ${attempt}:`, error);
                if (attempt < 3) {
                    console.log('⏳ Ждем 2 секунды перед повтором...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
            }
        }
        
        console.log('📋 Финальный результат venues:', { data, error: lastError });
        
        if (lastError) {
            console.error('❌ Все попытки загрузки venues неудачны:', lastError);
            console.log('🔄 Переходим в fallback режим без заведений');
            venues = [];
            
            // Показываем предупреждение вместо критической ошибки  
            showMessage('Предупреждение', 'Не удалось загрузить заведения. Вы можете добавлять смены без указания заведения.');
            
            console.log('🔄 Обновляем селекты заведений...');
            updateVenueSelects();
            console.log('🎨 Рендерим список заведений...');
            renderVenuesList();
            console.log('✅ loadVenues завершена в fallback режиме');
            return; // Не бросаем ошибку, продолжаем работу
        }
        
        venues = data || [];
        console.log('✅ Загружено заведений:', venues.length);
        venues.forEach((venue, index) => {
            if (!venue.id || venue.id === 'undefined') {
                console.error(`❌ Некорректное заведение #${index}:`, venue);
            }
        });
        
        console.log('🔄 Обновляем селекты заведений...');
        updateVenueSelects();
        console.log('🎨 Рендерим список заведений...');
        renderVenuesList();
        console.log('✅ loadVenues завершена успешно');
        
    } catch (error) {
        console.error('❌ Критическая ошибка загрузки заведений:', error);
        console.log('🔄 Переходим в критический fallback режим');
        venues = [];
        
        // Показываем предупреждение вместо блокирующей ошибки
        showMessage('Предупреждение', 'Произошла критическая ошибка при загрузке заведений. Приложение работает в ограниченном режиме.');
        
        // Все равно обновляем интерфейс
        updateVenueSelects();
        renderVenuesList();
        console.log('✅ loadVenues завершена в критическом fallback режиме');
        // НЕ бросаем ошибку - позволяем приложению продолжить работу
    }
}

async function loadProducts() {
    console.log('🛍️ loadProducts начата');
    
    if (!currentUser || !currentUser.id) {
        console.error('❌ Пользователь не авторизован для загрузки продуктов');
        return;
    }
    
    console.log('👤 Загружаем продукты для пользователя:', currentUser.id);
    
    try {
        console.log('🔍 Выполняем упрощенный запрос к таблице venue_products...');
        
        // Разумные таймауты
        const timeoutDuration = window.location.hostname === 'localhost' ? 15000 : 10000;
        console.log(`⏱️ Используем таймаут для products: ${timeoutDuration/1000} секунд`);
        
        // Пробуем несколько раз с retry
        let lastError = null;
        let allProducts = null;
        
        for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`🔄 Попытка ${attempt}/2 загрузки products...`);
            
            try {
                const productsPromise = supabase
                    .from('venue_products')
                    .select('*')
                    .order('name');
                    
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Таймаут запроса products (попытка ${attempt})`)), timeoutDuration)
                );
                
                const result = await Promise.race([productsPromise, timeoutPromise]);
                
                if (result.error) {
                    lastError = result.error;
                    console.warn(`⚠️ Ошибка в попытке ${attempt}:`, result.error);
                    if (attempt < 3) {
                        console.log('⏳ Ждем 2 секунды перед повтором...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                } else {
                    allProducts = result.data;
                    console.log(`✅ Успех в попытке ${attempt}!`);
                    break;
                }
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Исключение в попытке ${attempt}:`, error);
                if (attempt < 3) {
                    console.log('⏳ Ждем 2 секунды перед повтором...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
            }
        }
        
        console.log('📋 Финальный результат products:', { count: allProducts?.length, error: lastError });
        
        if (lastError) {
            console.error('❌ Все попытки загрузки products неудачны:', lastError);
            console.log('🔄 Переходим в fallback режим без продуктов');
            products = [];
            
            // Показываем предупреждение вместо критической ошибки  
            showMessage('Предупреждение', 'Не удалось загрузить позиции. Вы можете создавать позиции в настройках.');
            
            console.log('🎨 Рендерим пустой список продуктов...');
            renderProductsList();
            updateProductFields();
            console.log('✅ loadProducts завершена в fallback режиме');
            return; // Не бросаем ошибку, продолжаем работу
        }
        
        // Фильтруем продукты по заведениям пользователя после загрузки
        console.log('🔍 Фильтруем продукты по заведениям пользователя...');
        const userVenueIds = venues.map(v => v.id);
        const data = allProducts ? allProducts.filter(product => 
            userVenueIds.includes(product.venue_id)
        ) : [];
        
        console.log('📋 Отфильтрованные продукты:', { count: data.length });
        
        products = data || [];
        
        console.log('✅ Загружено продуктов:', products.length);  
        products.forEach((product, index) => {
            if (!product.id || product.id === 'undefined') {
                console.error(`❌ Некорректный продукт #${index}:`, product);
            }
        });
        
        console.log('🎨 Рендерим список продуктов...');
        renderProductsList();
        console.log('🔄 Обновляем поля продуктов...');
        updateProductFields();
        console.log('✅ loadProducts завершена успешно');
        
    } catch (error) {
        console.error('❌ Критическая ошибка загрузки позиций:', error);
        console.log('🔄 Переходим в критический fallback режим для продуктов');
        products = [];
        
        // Показываем предупреждение вместо блокирующей ошибки
        showMessage('Предупреждение', 'Произошла критическая ошибка при загрузке позиций. Вы можете создавать позиции в настройках.');
        
        // Все равно обновляем интерфейс
        renderProductsList();
        updateProductFields();
        console.log('✅ loadProducts завершена в критическом fallback режиме');
        // НЕ бросаем ошибку - позволяем приложению продолжить работу
    }
}

async function loadShifts() {
    console.log('📅 loadShifts начата');
    
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    console.log('👤 Загрузка смен для пользователя:', currentUser?.id);
    console.log('📅 Период:', startOfMonth.toISOString().split('T')[0], 'до', endOfMonth.toISOString().split('T')[0]);
    
    try {
        console.log('🔍 Выполняем базовый запрос смен с таймаутом...');
        
        // Разумные таймауты
        const timeoutDuration = window.location.hostname === 'localhost' ? 15000 : 10000;
        console.log(`⏱️ Используем таймаут для shifts: ${timeoutDuration/1000} секунд`);
        
        // Пробуем несколько раз с retry
        let lastError = null;
        let basicShifts = null;
        
        for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`🔄 Попытка ${attempt}/2 загрузки shifts...`);
            
            try {
                const basicShiftsPromise = supabase
                    .from('shifts')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .gte('shift_date', startOfMonth.toISOString().split('T')[0])
                    .lte('shift_date', endOfMonth.toISOString().split('T')[0])
                    .order('shift_date');
                    
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Таймаут запроса shifts (попытка ${attempt})`)), timeoutDuration)
                );
                
                const result = await Promise.race([basicShiftsPromise, timeoutPromise]);
                
                if (result.error) {
                    lastError = result.error;
                    console.warn(`⚠️ Ошибка в попытке ${attempt}:`, result.error);
                    if (attempt < 3) {
                        console.log('⏳ Ждем 2 секунды перед повтором...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                } else {
                    basicShifts = result.data;
                    console.log(`✅ Успех в попытке ${attempt}!`);
                    break;
                }
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Исключение в попытке ${attempt}:`, error);
                if (attempt < 3) {
                    console.log('⏳ Ждем 2 секунды перед повтором...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
            }
        }
        
        console.log('📋 Финальный результат shifts:', { count: basicShifts?.length, error: lastError });
        
        if (lastError) {
            console.error('❌ Все попытки загрузки shifts неудачны:', lastError);
            console.log('🔄 Переходим в fallback режим без смен');
            shifts = [];
            
            // Показываем предупреждение вместо критической ошибки  
            showMessage('Предупреждение', 'Не удалось загрузить смены. Попробуйте обновить страницу.');
            
            console.log('🎨 Рендерим пустой список смен...');
            renderShiftsList();
            console.log('✅ loadShifts завершена в fallback режиме');
            return; // Не бросаем ошибку, продолжаем работу
        }
        
        // Используем только базовые данные для ускорения
        console.log('✅ Используем базовые данные смен (без JOIN)');
        shifts = basicShifts || [];
        console.log('📋 Количество смен:', shifts.length);
        
        console.log('🎨 Рендерим список смен...');
        renderShiftsList();
        console.log('✅ loadShifts завершена успешно');
        
    } catch (error) {
        console.error('❌ Критическая ошибка загрузки смен:', error);
        console.log('🔄 Переходим в критический fallback режим для смен');
        shifts = [];
        
        // Показываем предупреждение вместо блокирующей ошибки
        showMessage('Предупреждение', 'Произошла критическая ошибка при загрузке смен. Попробуйте обновить страницу.');
        
        // Все равно обновляем интерфейс
        renderShiftsList();
        console.log('✅ loadShifts завершена в критическом fallback режиме');
        // НЕ бросаем ошибку - позволяем приложению продолжить работу
    }
}

// Отображение данных
function updateMonthDisplay() {
    console.log('📅 updateMonthDisplay начата');
    
    try {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        const monthText = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
        
        console.log('📅 Устанавливаем текст месяца:', monthText);
        const monthElement = document.getElementById('current-month');
        if (monthElement) {
            monthElement.textContent = monthText;
            console.log('✅ updateMonthDisplay завершена успешно');
        } else {
            console.error('❌ Элемент current-month не найден');
        }
        
    } catch (error) {
        console.error('❌ Ошибка в updateMonthDisplay:', error);
    }
}

function updateReportsMonth() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const monthText = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    document.getElementById('reports-current-month').textContent = monthText;
}

// Функция для загрузки продуктов конкретной смены с именами
async function loadShiftProducts(shiftId) {
    try {
        const { data: shiftProducts, error } = await supabase
            .from('shift_products')
            .select(`
                id,
                quantity,
                price_snapshot,
                commission_snapshot,
                product_id,
                venue_products (
                    name
                )
            `)
            .eq('shift_id', shiftId);
            
        if (error) {
            console.error('❌ Ошибка загрузки продуктов смены:', error);
            return [];
        }
        
        return shiftProducts || [];
    } catch (error) {
        console.error('❌ Исключение при загрузке продуктов смены:', error);
        return [];
    }
}

async function renderShiftsList() {
    console.log('🎨 === НАЧАЛО РЕНДЕРА СМЕН ===');
    const container = document.getElementById('shifts-list');
    
    console.log('📋 Контейнер shifts-list найден:', !!container);
    console.log('👤 Текущий пользователь:', !!currentUser);
    console.log('📅 Количество смен в массиве:', shifts.length);
    console.log('📅 Данные смен:', shifts);
    console.log('🏢 Количество заведений:', venues.length);
    console.log('🏢 Данные заведений:', venues);
    console.log('📅 Текущий месяц:', currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }));
    
    container.innerHTML = '';
    
    console.log('🎨 Отображение смен:', { count: shifts.length, currentUser: !!currentUser });
    
    if (!currentUser) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;">Войдите в систему для просмотра смен</div>';
        return;
    }
    
    if (shifts.length === 0) {
        const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #6b7280;">
                <div style="font-size: 18px; margin-bottom: 10px;">📅 Нет смен за ${monthName}</div>
                <div style="font-size: 14px; color: #9ca3af;">Добавьте первую смену, нажав кнопку "Добавить смену"</div>
            </div>
        `;
        return;
    }
    
    // Загружаем продукты для всех смен параллельно
    const shiftsWithProducts = await Promise.all(
        shifts.map(async (shift) => {
            const shiftProducts = await loadShiftProducts(shift.id);
            return { ...shift, products: shiftProducts };
        })
    );
    
    shiftsWithProducts.forEach(shift => {
        console.log('🎯 Отображаем смену с продуктами:', shift);
        
        const shiftElement = document.createElement('div');
        shiftElement.className = `shift-card ${!shift.is_workday ? 'holiday' : ''}`;
        shiftElement.onclick = async () => await editShift(shift);
        
        const date = new Date(shift.shift_date);
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        
        // Получаем название заведения из массива venues
        const venue = venues.find(v => v.id === shift.venue_id);
        const venueName = venue?.name || 'Не указано';
        
        // Формируем список продуктов
        let productsHtml = '';
        if (shift.products && shift.products.length > 0) {
            productsHtml = '<div class="shift-products">';
            productsHtml += '<div class="products-header">📦 Позиции:</div>';
            
            shift.products.forEach(sp => {
                // Получаем имя позиции из JOIN'а или из массива products как fallback
                const productName = sp.venue_products?.name || 
                                  products.find(p => p.id === sp.product_id)?.name || 
                                  'Неизвестная позиция';
                const totalPrice = sp.quantity * sp.price_snapshot;
                
                productsHtml += `
                    <div class="product-item">
                        <span class="product-name">${productName}</span>
                        <span class="product-details">
                            ${sp.quantity} × ${formatCurrency(sp.price_snapshot)} = ${formatCurrency(totalPrice)}
                        </span>
                    </div>
                `;
            });
            
            productsHtml += '</div>';
        }
        
        shiftElement.innerHTML = `
            <div class="shift-header">
                <div class="shift-date">
                    <div class="date-day">${dayNames[date.getDay()]} ${date.getDate()}</div>
                    <div class="date-month">${date.toLocaleDateString('ru-RU', { month: 'short' })}</div>
                </div>
                <div class="shift-venue">${venueName}</div>
                <div class="shift-amounts">
                    <div class="amount-item">
                        <span class="amount-label">Чаевые:</span>
                        <span class="amount-value">${formatCurrency(shift.tips || 0)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Выручка:</span>
                        <span class="amount-value">${formatCurrency(shift.revenue_generated || 0)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Заработок:</span>
                        <span class="amount-value">${formatCurrency(shift.earnings || 0)}</span>
                    </div>
                </div>
            </div>
            ${productsHtml}
        `;
        
        container.appendChild(shiftElement);
    });
    
    console.log('✅ === РЕНДЕР СМЕН ЗАВЕРШЕН ===');
    console.log('📋 HTML контент контейнера:', container.innerHTML.length > 0 ? 'ЗАПОЛНЕН' : 'ПУСТОЙ');
    console.log('📋 Количество элементов в контейнере:', container.children.length);
}

function renderVenuesList() {
    const container = document.getElementById('venues-list');
    container.innerHTML = '';
    
    venues.forEach(venue => {
        // Проверяем корректность данных заведения
        if (!venue.id || venue.id === 'undefined') {
            console.error('Некорректные данные заведения в списке:', venue);
            return; // Пропускаем это заведение
        }
        
        const venueElement = document.createElement('div');
        venueElement.className = 'list-item';
        venueElement.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${venue.name || 'Без названия'}</div>
                <div class="list-item-subtitle">Ставка: ${formatCurrency(venue.default_fixed_payout || 0)}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary" data-action="edit" data-venue-id="${venue.id}">Изменить</button>
                <button class="btn btn-danger" data-action="delete" data-venue-id="${venue.id}">Удалить</button>
            </div>
        `;
        
        // Добавляем обработчики событий
        const editBtn = venueElement.querySelector('[data-action="edit"]');
        const deleteBtn = venueElement.querySelector('[data-action="delete"]');
        
        editBtn.addEventListener('click', () => {
            console.log('Клик по кнопке редактирования, venueId:', venue.id);
            editVenue(venue.id);
        });
        
        deleteBtn.addEventListener('click', () => {
            console.log('Клик по кнопке удаления, venueId:', venue.id);
            confirmDeleteVenue(venue.id);
        });
        
        container.appendChild(venueElement);
    });
}

function renderProductsList() {
    const container = document.getElementById('products-list');
    container.innerHTML = '';
    
    products.forEach(product => {
        // Проверяем корректность данных продукта
        if (!product.id || product.id === 'undefined') {
            console.error('Некорректные данные продукта в списке:', product);
            return; // Пропускаем этот продукт
        }
        
        const productElement = document.createElement('div');
        productElement.className = 'list-item';
        
        const commissionText = product.commission_type === 'fixed' 
            ? formatCurrency(product.commission_value || 0)
            : `${product.commission_value || 0}%`;
            
        productElement.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${product.name || 'Без названия'}</div>
                <div class="list-item-subtitle">Цена: ${formatCurrency(product.price_per_unit || 0)}, Комиссия: ${commissionText}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary" data-action="edit" data-product-id="${product.id}">Изменить</button>
                <button class="btn btn-danger" data-action="delete" data-product-id="${product.id}">Удалить</button>
            </div>
        `;
        
        // Добавляем обработчики событий
        const editBtn = productElement.querySelector('[data-action="edit"]');
        const deleteBtn = productElement.querySelector('[data-action="delete"]');
        
        editBtn.addEventListener('click', () => {
            console.log('Клик по кнопке редактирования продукта, productId:', product.id);
            editProduct(product.id);
        });
        
        deleteBtn.addEventListener('click', () => {
            console.log('Клик по кнопке удаления продукта, productId:', product.id);
            confirmDeleteProduct(product.id);
        });
        
        container.appendChild(productElement);
    });
}

// Модальные окна для смен
async function openShiftModal(shift = null) {
    editingShift = shift;
    const modal = document.getElementById('shift-modal');
    const title = document.getElementById('shift-modal-title');
    const deleteBtn = document.getElementById('delete-shift');
    
    if (shift) {
        title.textContent = 'Редактировать смену';
        deleteBtn.classList.remove('hidden');
        console.log('🔄 Загружаем данные смены для редактирования...');
        await populateShiftForm(shift);
    } else {
        title.textContent = 'Добавить смену';
        deleteBtn.classList.add('hidden');
        resetShiftForm();
    }
    
    // Добавляем обработчики событий для радиокнопок рабочий/выходной день
    const workdayRadios = document.querySelectorAll('input[name="workday"]');
    workdayRadios.forEach(radio => {
        radio.addEventListener('change', toggleWorkFields);
    });
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // Для новых смен обновляем поля продуктов
    if (!shift) {
        console.log('Открытие модального окна - начальное обновление полей');
        updateProductFields();
        calculateShiftTotals(); // Начальный расчет
    }
}

async function populateShiftForm(shift) {
    document.getElementById('shift-date').value = shift.shift_date;
    document.querySelector(`input[name="workday"][value="${shift.is_workday}"]`).checked = true;
    document.getElementById('shift-venue').value = shift.venue_id;
    document.getElementById('shift-payout').value = shift.fixed_payout;
    document.getElementById('shift-tips').value = shift.tips;
    
    toggleWorkFields();
    
    // НОВАЯ ЛОГИКА: Сначала загружаем данные продуктов, потом создаем поля
    let shiftProductsData = [];
    
    if (shift.id && shift.id !== 'undefined') {
        console.log('🔍 Загружаем данные продуктов для смены ID:', shift.id);
        
        try {
            const { data: shiftProducts, error } = await supabase
                .from('shift_products')
                .select('*')
                .eq('shift_id', shift.id);
                
            console.log('📋 Результат запроса shift_products:', {
                data: shiftProducts,
                error: error,
                shiftId: shift.id,
                count: shiftProducts?.length || 0
            });
            
            if (error) {
                console.error('❌ Ошибка загрузки продуктов смены:', error);
            } else {
                shiftProductsData = shiftProducts || [];
                console.log(`📦 Найдено ${shiftProductsData.length} продуктов для смены ${shift.id}`);
            }
            
        } catch (error) {
            console.error('❌ Исключение при загрузке продуктов смены:', error);
        }
    }
    
    // Создаем поля продуктов с загруженными данными
    console.log('🔄 Создаем поля продуктов с данными смены');
    updateProductFieldsWithData(shiftProductsData);
    
    // Обновляем суммы и итоги
    setTimeout(() => {
        updateAllProductSums();
        calculateShiftTotals();
    }, 100);
}

function resetShiftForm() {
    document.getElementById('shift-form').reset();
    document.getElementById('shift-date').value = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="workday"][value="true"]').checked = true;
    toggleWorkFields();
    // Очищаем значения полей продуктов при сбросе формы
    updateProductFields(true);
}

function toggleWorkFields() {
    const isWorkday = document.querySelector('input[name="workday"]:checked').value === 'true';
    const workFields = document.getElementById('work-fields');
    
    if (isWorkday) {
        workFields.style.display = 'block';
        // Обновляем поля продуктов при переключении на рабочий день
        updateProductFields();
    } else {
        workFields.style.display = 'none';
        // Обнуляем поля при выборе выходного
        document.getElementById('shift-venue').value = '';
        document.getElementById('shift-payout').value = 0;
        document.getElementById('shift-tips').value = 0;
        document.querySelectorAll('#product-fields input').forEach(input => {
            input.value = 0;
        });
        // Очищаем контейнер продуктов
        const container = document.getElementById('product-fields');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    calculateShiftTotals();
}

// Функция для обновления суммы конкретного продукта
function updateProductSum(productId, pricePerUnit) {
    const input = document.getElementById(`product-${productId}`);
    const sumElement = document.getElementById(`product-sum-${productId}`);
    
    if (input && sumElement) {
        const quantity = parseInt(input.value) || 0;
        const sum = quantity * pricePerUnit;
        sumElement.textContent = formatCurrency(sum);
        
        // Добавляем/убираем CSS-класс для выделения
        if (quantity > 0) {
            sumElement.classList.add('has-value');
        } else {
            sumElement.classList.remove('has-value');
        }
    }
}

// Функция для обновления сумм всех продуктов
function updateAllProductSums() {
    const allInputs = document.querySelectorAll('#product-fields .product-input');
    
    allInputs.forEach(input => {
        const productId = input.getAttribute('data-product-id');
        if (productId) {
            // Находим продукт в массиве products
            const product = products.find(p => p.id === productId);
            if (product) {
                updateProductSum(productId, product.price_per_unit);
            }
        }
    });
}

// Новая функция для создания полей продуктов с данными смены
function updateProductFieldsWithData(shiftProductsData = []) {
    const container = document.getElementById('product-fields');
    if (!container) {
        console.error('Контейнер product-fields не найден');
        return;
    }
    
    console.log('=== СОЗДАНИЕ ПОЛЕЙ ПРОДУКТОВ С ДАННЫМИ СМЕНЫ ===');
    console.log('Данные продуктов смены:', shiftProductsData);
    
    container.innerHTML = '';
    
    // Получаем выбранное заведение
    const selectedVenueId = document.getElementById('shift-venue')?.value;
    
    if (!selectedVenueId) {
        container.innerHTML = '<div class="form-group"><label>Сначала выберите заведение для отображения позиций</label></div>';
        calculateShiftTotals();
        return;
    }
    
    // Фильтруем продукты по выбранному заведению
    console.log('🏢 Выбранное заведение:', selectedVenueId);
    console.log('📦 Все доступные продукты:', products);
    
    const venueProducts = products.filter(product => product.venue_id === selectedVenueId);
    console.log('📦 Продукты для заведения:', venueProducts);
    
    if (venueProducts.length === 0) {
        container.innerHTML = '<div class="form-group"><label>У выбранного заведения нет позиций</label></div>';
        calculateShiftTotals();
        return;
    }
    
    venueProducts.forEach(product => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'form-group';
        
        // Ищем количество для этого продукта в данных смены
        const shiftProduct = shiftProductsData.find(sp => sp.product_id === product.id);
        const quantity = shiftProduct ? shiftProduct.quantity : 0;
        
        console.log(`Продукт ${product.name}: сохраненное количество = ${quantity}`);
        
        // Рассчитываем сумму
        const sum = quantity * product.price_per_unit;
        
        fieldGroup.innerHTML = `
            <label>${product.name} (${formatCurrency(product.price_per_unit)}):</label>
            <div class="product-input-group">
                <input type="number" data-product-id="${product.id}" min="0" step="1" value="${quantity}" class="product-input" id="product-${product.id}" placeholder="Количество">
                <span class="product-sum ${quantity > 0 ? 'has-value' : ''}" id="product-sum-${product.id}">${formatCurrency(sum)}</span>
            </div>
        `;
        container.appendChild(fieldGroup);
        
        console.log(`Создано поле для продукта ${product.name} с количеством: ${quantity}`);
        
        // Добавляем слушатели событий для автоматического пересчета
        const input = fieldGroup.querySelector('.product-input');
        input.addEventListener('input', (e) => {
            console.log(`Введено значение ${e.target.value} для продукта ${product.name}`);
            updateProductSum(product.id, product.price_per_unit);
            calculateShiftTotals();
        });
        input.addEventListener('change', (e) => {
            console.log(`Изменено значение ${e.target.value} для продукта ${product.name}`);
            updateProductSum(product.id, product.price_per_unit);
            calculateShiftTotals();
        });
    });
    
    // Пересчитываем итоги после создания полей
    calculateShiftTotals();
    
    console.log('✅ === ПОЛЯ ПРОДУКТОВ СОЗДАНЫ С ДАННЫМИ СМЕНЫ ===');
}

function updateProductFields(clearValues = false) {
    const container = document.getElementById('product-fields');
    if (!container) {
        console.error('Контейнер product-fields не найден');
        return;
    }
    
    console.log('=== ОБНОВЛЕНИЕ ПОЛЕЙ ПРОДУКТОВ ===');
    console.log('Режим очистки значений:', clearValues);
    console.log('Старое содержимое контейнера:', container.innerHTML);
    
    // Сохраняем значения существующих полей перед очисткой (только если не режим очистки)
    const existingValues = {};
    if (!clearValues) {
        const existingInputs = container.querySelectorAll('.product-input');
        existingInputs.forEach(input => {
            const productId = input.getAttribute('data-product-id');
            if (productId && input.value) {
                existingValues[productId] = input.value;
                console.log(`Сохранено значение ${input.value} для продукта ${productId}`);
            }
        });
    } else {
        console.log('🔄 Очищаем сохраненные значения полей продуктов');
    }
    
    container.innerHTML = '';
    
    // Получаем выбранное заведение
    const selectedVenueId = document.getElementById('shift-venue')?.value;
    
    if (!selectedVenueId) {
        container.innerHTML = '<div class="form-group"><label>Сначала выберите заведение для отображения позиций</label></div>';
        calculateShiftTotals(); // Пересчитываем при отсутствии заведения
        return;
    }
    
    // Фильтруем продукты по выбранному заведению
    console.log('🏢 Выбранное заведение:', selectedVenueId);
    console.log('📦 Все доступные продукты:', products);
    
    const venueProducts = products.filter(product => product.venue_id === selectedVenueId);
    console.log('📦 Продукты для заведения:', venueProducts);
    
    if (venueProducts.length === 0) {
        container.innerHTML = '<div class="form-group"><label>У выбранного заведения нет позиций</label></div>';
        calculateShiftTotals(); // Пересчитываем при отсутствии продуктов
        return;
    }
    
    venueProducts.forEach(product => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'form-group';
        
        // Восстанавливаем сохраненное значение или используем 0
        const savedValue = existingValues[product.id] || '0';
        
        // Рассчитываем начальную сумму
        const initialQuantity = parseInt(savedValue) || 0;
        const initialSum = initialQuantity * product.price_per_unit;
        
        fieldGroup.innerHTML = `
            <label>${product.name} (${formatCurrency(product.price_per_unit)}):</label>
            <div class="product-input-group">
                <input type="number" data-product-id="${product.id}" min="0" step="1" value="${savedValue}" class="product-input" id="product-${product.id}" placeholder="Количество">
                <span class="product-sum" id="product-sum-${product.id}">${formatCurrency(initialSum)}</span>
            </div>
        `;
        container.appendChild(fieldGroup);
        
        console.log(`Создано поле для продукта ${product.name} с ID: ${product.id}, значение: ${savedValue}`);
        
        // Добавляем слушатели событий для автоматического пересчета
        const input = fieldGroup.querySelector('.product-input');
        input.addEventListener('input', (e) => {
            console.log(`Введено значение ${e.target.value} для продукта ${product.name}`);
            updateProductSum(product.id, product.price_per_unit);
            calculateShiftTotals();
        });
        input.addEventListener('change', (e) => {
            console.log(`Изменено значение ${e.target.value} для продукта ${product.name}`);
            updateProductSum(product.id, product.price_per_unit);
            calculateShiftTotals();
        });
        
        // Проверяем количество элементов с таким же data-product-id
        setTimeout(() => {
            const allSameId = document.querySelectorAll(`[data-product-id="${product.id}"]`);
            console.log(`Элементов с data-product-id="${product.id}": ${allSameId.length}`);
            if (allSameId.length > 1) {
                console.warn(`⚠️ НАЙДЕНО ${allSameId.length} элементов с одинаковым ID!`, allSameId);
            }
        }, 100);
    });
    
    // Пересчитываем итоги после обновления полей
    calculateShiftTotals();
    
    // Обновляем суммы всех продуктов
    setTimeout(() => updateAllProductSums(), 50);
}

// Функция для принудительного сохранения всех значений полей продуктов
function saveAllProductValues() {
    const savedValues = {};
    const allInputs = document.querySelectorAll('#product-fields .product-input');
    
    allInputs.forEach(input => {
        const productId = input.getAttribute('data-product-id');
        if (productId) {
            savedValues[productId] = input.value;
            console.log(`Принудительно сохранено: ${productId} = ${input.value}`);
        }
    });
    
    return savedValues;
}

function updateVenueSelects() {
    const select = document.getElementById('shift-venue');
    select.innerHTML = '<option value="">Выберите заведение</option>';
    
    venues.forEach(venue => {
        const option = document.createElement('option');
        option.value = venue.id;
        option.textContent = venue.name;
        option.dataset.payout = venue.default_fixed_payout;
        select.appendChild(option);
    });
    
    // Автозаполнение ставки при выборе заведения и обновление продуктов
    select.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption.dataset.payout) {
            document.getElementById('shift-payout').value = selectedOption.dataset.payout;
        }
        // Обновляем поля продуктов для выбранного заведения
        console.log('Изменение заведения - обновляем поля продуктов');
        updateProductFields();
        calculateShiftTotals();
    });
    
    // Добавляем слушатели для автоматического пересчета при изменении ставки и чаевых
    const payoutField = document.getElementById('shift-payout');
    const tipsField = document.getElementById('shift-tips');
    
    if (payoutField) {
        payoutField.addEventListener('input', calculateShiftTotals);
        payoutField.addEventListener('change', calculateShiftTotals);
    }
    
    if (tipsField) {
        tipsField.addEventListener('input', calculateShiftTotals);
        tipsField.addEventListener('change', calculateShiftTotals);
    }
}

function calculateShiftTotals() {
    const isWorkday = document.querySelector('input[name="workday"]:checked')?.value === 'true';
    
    console.log('Расчет итогов смены. Рабочий день:', isWorkday);
    
    // Обновляем суммы всех продуктов
    updateAllProductSums();
    
    if (!isWorkday) {
        document.getElementById('shift-revenue').value = 0;
        document.getElementById('shift-earnings').value = 0;
        return;
    }
    
    let revenue = 0;
    let earnings = 0;
    
    // Расчет по продуктам выбранного заведения
    const selectedVenueId = document.getElementById('shift-venue')?.value;
    console.log('Выбранное заведение:', selectedVenueId);
    
    if (selectedVenueId) {
        const venueProducts = products.filter(product => product.venue_id === selectedVenueId);
        console.log('Продукты заведения:', venueProducts);
        
        venueProducts.forEach(product => {
            // Ищем только внутри модального окна смены, чтобы избежать конфликта с кнопками в настройках
            const shiftModal = document.getElementById('shift-modal');
            let input = shiftModal.querySelector(`[data-product-id="${product.id}"]`);
            
            // Альтернативный поиск если не найден
            if (!input) {
                input = document.getElementById(`product-${product.id}`);
            }
            
            if (input) {
                const quantity = parseInt(input.value) || 0;
                console.log(`Продукт ${product.name}: количество=${quantity}, цена=${product.price_per_unit}, input.value='${input.value}'`);
                
                if (quantity > 0) {
                    const productRevenue = quantity * product.price_per_unit;
                    revenue += productRevenue;
                    
                    const commission = product.commission_type === 'fixed' 
                        ? product.commission_value
                        : product.price_per_unit * (product.commission_value / 100);
                    const productEarnings = quantity * commission;
                    earnings += productEarnings;
                    
                    console.log(`  Выручка: ${productRevenue}, Заработок: ${productEarnings}`);
                }
            } else {
                console.log(`❌ Input не найден для продукта ${product.name} (id: ${product.id})`);
            }
        });
    }
    
    // Добавляем фиксированную ставку и чаевые
    const payout = parseFloat(document.getElementById('shift-payout').value) || 0;
    const tips = parseFloat(document.getElementById('shift-tips').value) || 0;
    earnings += payout + tips;
    
    console.log(`Итоговая выручка: ${revenue}, Итоговый заработок: ${earnings}`);
    
    // Сохраняем числовые значения без форматирования для корректной отправки
    document.getElementById('shift-revenue').value = revenue;
    document.getElementById('shift-earnings').value = earnings;
    
    // Показываем форматированные значения в специальных полях для отображения
    const revenueDisplay = document.getElementById('shift-revenue-display');
    const earningsDisplay = document.getElementById('shift-earnings-display');
    
    if (revenueDisplay) revenueDisplay.textContent = formatCurrency(revenue);
    if (earningsDisplay) earningsDisplay.textContent = formatCurrency(earnings);
}

// Флаг для предотвращения множественных отправок
let isSubmittingShift = false;

async function handleShiftSubmit(e) {
    console.log('=== ОБРАБОТЧИК СОХРАНЕНИЯ СМЕНЫ ВЫЗВАН ===');
    console.log('Event:', e);
    
    e.preventDefault();
    
    // Объявляем переменную для пользователя, которая будет использоваться в блоке try-catch
    let user;
    
    // Защита от множественных нажатий
    if (isSubmittingShift) {
        console.log('⚠️ Сохранение уже в процессе, игнорируем повторное нажатие');
        return;
    }
    
    isSubmittingShift = true;
    console.log('🔒 Блокируем повторные нажатия');
    
    console.log('preventDefault() выполнен, начинаем сохранение...');
    
    // Проверяем форму на валидность
    const form = e.target;
    if (!form.checkValidity()) {
        console.log('❌ Форма не прошла валидацию');
        form.reportValidity();
        isSubmittingShift = false;
        return;
    }
    console.log('✅ Форма прошла валидацию');
    
    // Получаем актуального пользователя из Supabase
    console.log('Получаем текущего пользователя...');
    
    try {
        console.log('Вызываем supabase.auth.getUser()...');
        const userResult = await Promise.race([
            supabase.auth.getUser(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Таймаут получения пользователя')), 5000))
        ]);
        
        console.log('Результат получения пользователя:', userResult);
        
        const { data: { user: authUser }, error: userError } = userResult;
        
        if (!authUser || userError || !authUser.id) {
            console.error('Ошибка получения пользователя:', userError);
            showMessage('Ошибка', 'Сессия устарела. Войдите в систему заново.');
            isSubmittingShift = false;
            return;
        }
        console.log('✅ Пользователь получен:', authUser.id);
        
        // Используем пользователя из глобальной переменной как запасной вариант
        const actualUser = authUser || currentUser;
        if (!actualUser || !actualUser.id) {
            console.error('Нет доступного пользователя:', { authUser, currentUser });
            showMessage('Ошибка', 'Пользователь не найден. Попробуйте перезайти в систему.');
            isSubmittingShift = false;
            return;
        }
        
        console.log('✅ Используем пользователя:', actualUser.id);
        
        // Сохраняем пользователя для дальнейшего использования
        user = actualUser;
    } catch (error) {
        console.error('Критическая ошибка получения пользователя:', error);
        
        // Пробуем использовать глобальную переменную currentUser
        if (currentUser && currentUser.id) {
            console.log('⚠️ Используем глобальную переменную currentUser:', currentUser.id);
            user = currentUser;
        } else {
            showMessage('Ошибка', 'Не удалось получить данные пользователя: ' + error.message);
            isSubmittingShift = false;
            return;
        }
    }
    
    // Определяем финального пользователя для использования
    const finalUser = user;
    console.log('Текущий пользователь при добавлении смены:', finalUser.id);
    
    const shiftData = {
        user_id: finalUser.id, // Используем актуального пользователя
        shift_date: document.getElementById('shift-date').value,
        is_workday: document.querySelector('input[name="workday"]:checked').value === 'true',
        venue_id: document.getElementById('shift-venue').value || null,
        fixed_payout: parseFloat(document.getElementById('shift-payout').value) || 0,
        tips: parseFloat(document.getElementById('shift-tips').value) || 0
    };
    
    console.log('Данные смены для отправки:', shiftData);
    
    // Рассчитываем итоги
    let revenue = 0;
    let earnings = shiftData.fixed_payout + shiftData.tips;
    const shiftProducts = [];
    
    if (shiftData.is_workday && shiftData.venue_id) {
        // Работаем только с продуктами выбранного заведения
        const venueProducts = products.filter(product => product.venue_id === shiftData.venue_id);
        console.log('Продукты для обработки:', venueProducts);
        console.log('Все доступные продукты:', products);
        
        venueProducts.forEach(product => {
            // Ищем только внутри модального окна смены, чтобы избежать конфликта с кнопками в настройках
            const shiftModal = document.getElementById('shift-modal');
            let input = shiftModal.querySelector(`[data-product-id="${product.id}"]`);
            
            if (!input) {
                // Альтернативный поиск по ID
                input = document.getElementById(`product-${product.id}`);
                console.log(`Поиск по ID product-${product.id}:`, input);
            }
            
            if (!input) {
                // Поиск среди всех input с классом product-input в модальном окне
                const allInputs = shiftModal.querySelectorAll('.product-input');
                console.log('Все найденные input.product-input в модальном окне:', allInputs);
                
                // Показываем их атрибуты
                allInputs.forEach((inp, index) => {
                    console.log(`Input ${index}:`, {
                        id: inp.id,
                        'data-product-id': inp.getAttribute('data-product-id'),
                        value: inp.value,
                        element: inp
                    });
                });
            }
            
            console.log(`Поиск input для продукта ${product.name} (id: ${product.id}):`);
            console.log('Найденный input:', input);
            console.log('Значение input:', input?.value);
            
            const quantity = parseInt(input?.value) || 0;
            console.log(`Количество для ${product.name}: ${quantity}`);
            
            if (quantity > 0) {
                const productRevenue = quantity * product.price_per_unit;
                revenue += productRevenue;
                
                const commission = product.commission_type === 'fixed' 
                    ? product.commission_value
                    : product.price_per_unit * (product.commission_value / 100);
                const productEarnings = quantity * commission;
                earnings += productEarnings;
                
                const productData = {
                    product_id: product.id,
                    quantity: quantity,
                    price_snapshot: product.price_per_unit,
                    commission_snapshot: commission
                };
                
                shiftProducts.push(productData);
                console.log(`Добавлен продукт в смену:`, productData);
            }
        });
    } else {
        console.log('Не рабочий день или не выбрано заведение. is_workday:', shiftData.is_workday, 'venue_id:', shiftData.venue_id);
    }
    
    shiftData.revenue_generated = revenue;
    shiftData.earnings = earnings;
    
    console.log('Окончательные данные смены:', shiftData);
    console.log('Продукты для сохранения:', shiftProducts);
    
    try {
        let shiftId;
        
        if (editingShift && editingShift.id) {
            // Проверяем, что у редактируемой смены есть корректный ID
            if (!editingShift.id || editingShift.id === 'undefined') {
                console.error('Некорректный ID смены:', editingShift);
                showMessage('Ошибка', 'Некорректный ID смены. Попробуйте перезагрузить страницу.');
                return;
            }
            
            // Обновляем смену
            const { error } = await supabase
                .from('shifts')
                .update(shiftData)
                .eq('id', editingShift.id);
            
            if (error) throw error;
            shiftId = editingShift.id;
            
            // Удаляем старые продукты
            await supabase
                .from('shift_products')
                .delete()
                .eq('shift_id', shiftId);
        } else {
            // Создание новой смены - сначала проверяем на дубликаты
            // Проверяем существование смены с такими же параметрами
            let query = supabase
                .from('shifts')
                .select('id')
                .eq('user_id', shiftData.user_id)
                .eq('shift_date', shiftData.shift_date);
            
            // Добавляем проверку venue_id только если он указан
            if (shiftData.venue_id) {
                query = query.eq('venue_id', shiftData.venue_id);
            } else {
                query = query.is('venue_id', null);
            }
            
            const { data: existingShift, error: checkError } = await query.maybeSingle();
            
            if (checkError) {
                console.error('Ошибка проверки существующих смен:', checkError);
                throw checkError;
            }
            
            if (existingShift) {
                const errorMessage = shiftData.venue_id 
                    ? 'Смена для данного заведения на эту дату уже существует. Отредактируйте существующую смену или выберите другую дату.'
                    : 'Смена на эту дату уже существует. Отредактируйте существующую смену или выберите другую дату.';
                showMessage('Ошибка', errorMessage);
                return;
            }
            
            // Создаем новую смену
            const { data, error } = await supabase
                .from('shifts')
                .insert(shiftData)
                .select()
                .single();
            
            if (error) throw error;
            shiftId = data.id;
        }
        
        // Добавляем продукты смены
        if (shiftProducts.length > 0) {
            const shiftProductsData = shiftProducts.map(sp => ({
                ...sp,
                shift_id: shiftId
            }));
            
            console.log('Сохраняем продукты смены:', shiftProductsData);
            
            const { data: savedProducts, error } = await supabase
                .from('shift_products')
                .insert(shiftProductsData)
                .select();
            
            if (error) {
                console.error('Ошибка сохранения продуктов смены:', error);
                throw error;
            }
            
            console.log('Продукты смены сохранены:', savedProducts);
        } else {
            console.log('Нет продуктов для сохранения');
        }
        
        console.log('✅ СМЕНА УСПЕШНО СОХРАНЕНА! Закрываем модальное окно...');
        closeAllModals();
        console.log('✅ Обновляем список смен...');
        await loadShiftsOptimized();
        console.log('✅ Показываем сообщение об успехе...');
        showMessage('Успех', editingShift ? 'Смена обновлена' : 'Смена добавлена');
        console.log('✅ ПРОЦЕСС СОХРАНЕНИЯ ЗАВЕРШЕН УСПЕШНО!');
        
    } catch (error) {
        console.error('Ошибка при сохранении смены:', error);
        
        // Обрабатываем специфические ошибки базы данных
        if (error.message && error.message.includes('unique constraint')) {
            if (error.message.includes('unique_user_venue_date')) {
                showMessage('Ошибка', 'Смена для данного заведения на эту дату уже существует. Отредактируйте существующую смену или выберите другую дату.');
            } else {
                showMessage('Ошибка', 'Данные нарушают ограничения базы данных. Проверьте правильность заполнения полей.');
            }
        } else if (error.message && error.message.includes('not-null constraint')) {
            showMessage('Ошибка', 'Не заполнены обязательные поля. Проверьте правильность ввода данных.');
        } else {
            showMessage('Ошибка', error.message || 'Произошла ошибка при сохранении смены');
        }
    } finally {
        // Разблокируем повторные нажатия
        isSubmittingShift = false;
        console.log('🔓 Разблокировали повторные нажатия');
    }
}

async function editShift(shift) {
    console.log('📝 Редактируем смену:', shift.id);
    await openShiftModal(shift);
}

async function deleteShift() {
    if (!editingShift || !editingShift.id || editingShift.id === 'undefined') {
        console.error('Некорректная смена для удаления:', editingShift);
        showMessage('Ошибка', 'Некорректная смена для удаления');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('shifts')
            .delete()
            .eq('id', editingShift.id);
        
        if (error) throw error;
        
        closeAllModals();
        await loadShiftsOptimized();
        showMessage('Успех', 'Смена удалена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

// Загрузка позиций конкретного заведения
async function loadVenueProducts(venueId) {
    console.log('🏢 Загрузка позиций для заведения:', venueId);
    
    const productsList = document.getElementById('venue-products-list');
    if (!productsList) {
        console.error('Элемент venue-products-list не найден');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('venue_products')
            .select('*')
            .eq('venue_id', venueId)
            .order('name');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            productsList.innerHTML = '';
            data.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'venue-product-item';
                productItem.innerHTML = `
                    <div class="venue-product-info">
                        <div class="venue-product-name">${product.name}</div>
                        <div class="venue-product-details">
                            ${formatCurrency(product.price_per_unit)} • 
                            ${product.commission_type === 'fixed' 
                                ? `${formatCurrency(product.commission_value)} фикс`
                                : `${product.commission_value}%`
                            }
                        </div>
                    </div>
                    <div class="venue-product-actions">
                        <button type="button" class="btn btn-secondary" onclick="editVenueProduct('${product.id}', '${venueId}')">
                            ✏️
                        </button>
                        <button type="button" class="btn btn-danger" onclick="deleteVenueProduct('${product.id}', '${venueId}')">
                            🗑️
                        </button>
                    </div>
                `;
                productsList.appendChild(productItem);
            });
        } else {
            productsList.innerHTML = '<p class="empty-message">У заведения пока нет позиций</p>';
        }
        
    } catch (error) {
        console.error('Ошибка загрузки позиций заведения:', error);
        productsList.innerHTML = '<p class="empty-message">Ошибка загрузки позиций</p>';
    }
}

// Модальные окна для заведений
function openVenueModal(venue = null) {
    console.log('openVenueModal вызвана с параметром:', {
        venue: venue,
        venueType: typeof venue,
        venueIsNull: venue === null,
        venueIsUndefined: venue === undefined,
        venueId: venue?.id,
        venueName: venue?.name,
        isValidId: venue?.id && venue.id !== 'undefined'
    });
    
    editingVenue = venue;
    
    const modal = document.getElementById('venue-modal');
    const title = document.getElementById('venue-modal-title');
    const deleteBtn = document.getElementById('delete-venue');
    
    if (venue && venue.id) {
        // Редактирование существующего заведения
        // Дополнительная проверка корректности данных заведения
        if (!venue.id || venue.id === 'undefined') {
            console.error('Некорректные данные заведения для редактирования:', venue);
            showMessage('Ошибка', 'Некорректные данные заведения. Попробуйте перезагрузить список заведений.');
            return;
        }
        
        title.textContent = 'Редактировать заведение';
        deleteBtn.classList.remove('hidden');
        document.getElementById('venue-name').value = venue.name || '';
        document.getElementById('venue-payout').value = venue.default_fixed_payout || 0;
        
        // Загружаем позиции заведения
        loadVenueProducts(venue.id);
    } else {
        // Добавление нового заведения (venue = null или venue без id)
        console.log('Открытие модального окна для добавления нового заведения');
        title.textContent = 'Добавить заведение';
        deleteBtn.classList.add('hidden');
        document.getElementById('venue-form').reset();
        
        // Сбрасываем editingVenue при добавлении нового
        editingVenue = null;
        
        // Показываем сообщение для нового заведения
        const productsList = document.getElementById('venue-products-list');
        productsList.innerHTML = '<p class="empty-message">Позиции будут добавлены после сохранения заведения</p>';
    }
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// Функции управления позициями заведения
async function addVenueProduct() {
    if (!editingVenue || !editingVenue.id) {
        showMessage('Ошибка', 'Сначала сохраните заведение');
        return;
    }
    
    // Открываем модальное окно продукта с привязкой к заведению
    editingProduct = { venue_id: editingVenue.id };
    openProductModal(editingProduct);
}

async function editVenueProduct(productId, venueId) {
    console.log('Редактирование позиции:', productId, 'заведения:', venueId);
    
    try {
        const { data, error } = await supabase
            .from('venue_products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        if (data) {
            editingProduct = data;
            openProductModal(data);
        }
        
    } catch (error) {
        console.error('Ошибка загрузки позиции:', error);
        showMessage('Ошибка', 'Не удалось загрузить данные позиции');
    }
}

async function deleteVenueProduct(productId, venueId) {
    console.log('Удаление позиции:', productId, 'заведения:', venueId);
    
    if (!confirm('Удалить эту позицию?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('venue_products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        // Перезагружаем список позиций заведения
        await loadVenueProducts(venueId);
        
        // Обновляем общий список продуктов
        await loadProducts();
        clearDataCache();
        
        showMessage('Успех', 'Позиция удалена');
        
    } catch (error) {
        console.error('Ошибка удаления позиции:', error);
        showMessage('Ошибка', 'Не удалось удалить позицию');
    }
}

function editVenue(venueId) {
    console.log('editVenue вызвана с параметром:', {
        venueId: venueId,
        venueIdType: typeof venueId,
        venuesCount: venues.length,
        venuesIds: venues.map(v => ({ id: v.id, type: typeof v.id }))
    });
    
    // Пробуем найти заведение с учетом разных типов ID
    let venue = venues.find(v => v.id === venueId);
    
    // Если не нашли, пробуем как строку
    if (!venue && typeof venueId === 'string') {
        venue = venues.find(v => String(v.id) === venueId);
    }
    
    // Если не нашли, пробуем как число
    if (!venue && !isNaN(venueId)) {
        venue = venues.find(v => v.id === parseInt(venueId));
    }
    
    if (venue) {
        console.log('Найдено заведение для редактирования:', venue);
        openVenueModal(venue);
    } else {
        console.error('Заведение не найдено:', {
            searchId: venueId,
            availableVenues: venues
        });
        showMessage('Ошибка', 'Заведение не найдено. Попробуйте перезагрузить список заведений.');
    }
}

async function handleVenueSubmit(e) {
    e.preventDefault();
    
    // Получаем актуального пользователя из Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError || !user.id) {
        console.error('Ошибка получения пользователя:', userError);
        showMessage('Ошибка', 'Сессия устарела. Войдите в систему заново.');
        return;
    }
    
    console.log('Текущий пользователь при добавлении заведения:', user.id);
    
    // Получаем элементы формы с проверкой существования
    const venueNameElement = document.getElementById('venue-name');
    const venuePayoutElement = document.getElementById('venue-payout');
    
    console.log('Элементы формы:', {
        venueNameElement: !!venueNameElement,
        venuePayoutElement: !!venuePayoutElement
    });
    
    if (!venueNameElement || !venuePayoutElement) {
        showMessage('Ошибка', 'Элементы формы не найдены. Попробуйте перезагрузить страницу.');
        return;
    }
    
    // Получаем значения из формы с проверкой
    const venueName = venueNameElement.value?.trim();
    const venuePayout = parseFloat(venuePayoutElement.value) || 0;
    
    console.log('Значения из формы:', {
        venueName: venueName,
        venueNameType: typeof venueName,
        venueNameLength: venueName?.length,
        venuePayout: venuePayout,
        venuePayoutType: typeof venuePayout
    });
    
    // Проверяем что название заведения заполнено
    if (!venueName || venueName === 'undefined') {
        showMessage('Ошибка', 'Введите название заведения');
        return;
    }
    
    const venueData = {
        user_id: user.id,
        name: venueName,
        default_fixed_payout: venuePayout
    };
    
    console.log('Данные заведения для отправки:', venueData);
    
    try {
        if (editingVenue && editingVenue.id) {
            // Проверяем, что у редактируемого заведения есть корректный ID
            if (!editingVenue.id || editingVenue.id === 'undefined') {
                console.error('Некорректный ID заведения:', editingVenue);
                showMessage('Ошибка', 'Некорректный ID заведения. Попробуйте перезагрузить страницу.');
                return;
            }
            
            console.log('Обновление заведения с ID:', editingVenue.id);
            
            // Обновляем заведение
            const { error } = await supabase
                .from('venues')
                .update(venueData)
                .eq('id', editingVenue.id);
            
            if (error) throw error;
        } else {
            // Создаем новое заведение (аналогично handleProductSubmit)
            console.log('Создание нового заведения');
            
            const { error } = await supabase
                .from('venues')
                .insert(venueData);
            
            if (error) throw error;
        }
        
        closeAllModals();
        await loadVenues();
        // Очищаем кэш после изменения заведений
        clearDataCache();
        showMessage('Успех', editingVenue ? 'Заведение обновлено' : 'Заведение добавлено');
        
    } catch (error) {
        console.error('Полная ошибка при работе с заведением:', error);
        showMessage('Ошибка', `Ошибка при сохранении: ${error.message}`);
    }
}

function confirmDeleteVenue(venueId) {
    console.log('confirmDeleteVenue вызвана с параметром:', venueId);
    
    // Пробуем найти заведение с учетом разных типов ID
    let venue = venues.find(v => v.id === venueId);
    
    // Если не нашли, пробуем как строку
    if (!venue && typeof venueId === 'string') {
        venue = venues.find(v => String(v.id) === venueId);
    }
    
    // Если не нашли, пробуем как число
    if (!venue && !isNaN(venueId)) {
        venue = venues.find(v => v.id === parseInt(venueId));
    }
    
    if (venue && confirm(`Удалить заведение "${venue.name}"?`)) {
        deleteVenueById(venueId);
    } else if (!venue) {
        console.error('Заведение не найдено для удаления:', venueId);
        showMessage('Ошибка', 'Заведение не найдено');
    }
}

async function deleteVenueById(venueId) {
    try {
        const { error } = await supabase
            .from('venues')
            .delete()
            .eq('id', venueId);
        
        if (error) throw error;
        
        await loadVenues();
        // Очищаем кэш после удаления заведения
        clearDataCache();
        showMessage('Успех', 'Заведение удалено');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

async function deleteVenue() {
    if (!editingVenue || !editingVenue.id || editingVenue.id === 'undefined') {
        console.error('Некорректное заведение для удаления:', editingVenue);
        showMessage('Ошибка', 'Некорректное заведение для удаления');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('venues')
            .delete()
            .eq('id', editingVenue.id);
        
        if (error) throw error;
        
        closeAllModals();
        await loadVenues();
        // Очищаем кэш после удаления заведения
        clearDataCache();
        showMessage('Успех', 'Заведение удалено');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

// Модальные окна для позиций
function openProductModal(product = null) {
    editingProduct = product;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const deleteBtn = document.getElementById('delete-product');
    
    if (product) {
        title.textContent = 'Редактировать позицию';
        deleteBtn.classList.remove('hidden');
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price_per_unit;
        document.getElementById('commission-type').value = product.commission_type;
        document.getElementById('commission-value').value = product.commission_value;
    } else {
        title.textContent = 'Добавить позицию';
        deleteBtn.classList.add('hidden');
        document.getElementById('product-form').reset();
    }
    
    updateCommissionLabel();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function editProduct(productId) {
    console.log('editProduct вызвана с параметром:', {
        productId: productId,
        productIdType: typeof productId,
        productsCount: products.length
    });
    
    // Пробуем найти продукт с учетом разных типов ID
    let product = products.find(p => p.id === productId);
    
    // Если не нашли, пробуем как строку
    if (!product && typeof productId === 'string') {
        product = products.find(p => String(p.id) === productId);
    }
    
    // Если не нашли, пробуем как число
    if (!product && !isNaN(productId)) {
        product = products.find(p => p.id === parseInt(productId));
    }
    
    if (product) {
        console.log('Найден продукт для редактирования:', product);
        openProductModal(product);
    } else {
        console.error('Продукт не найден:', {
            searchId: productId,
            availableProducts: products
        });
        showMessage('Ошибка', 'Продукт не найден. Попробуйте перезагрузить список продуктов.');
    }
}

function updateCommissionLabel() {
    const type = document.getElementById('commission-type').value;
    const label = document.getElementById('commission-label');
    label.textContent = type === 'fixed' ? 'Сумма комиссии:' : 'Процент комиссии:';
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    // Получаем актуального пользователя из Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError || !user.id) {
        console.error('Ошибка получения пользователя:', userError);
        showMessage('Ошибка', 'Сессия устарела. Войдите в систему заново.');
        return;
    }
    
    console.log('Текущий пользователь при добавлении позиции:', user.id);
    
    // Получаем элементы формы с проверкой существования
    const productNameElement = document.getElementById('product-name');
    const productPriceElement = document.getElementById('product-price');
    const commissionTypeElement = document.getElementById('commission-type');
    const commissionValueElement = document.getElementById('commission-value');
    
    if (!productNameElement || !productPriceElement || !commissionTypeElement || !commissionValueElement) {
        showMessage('Ошибка', 'Элементы формы позиции не найдены. Попробуйте перезагрузить страницу.');
        return;
    }
    
    // Получаем значения из формы с проверкой
    const productName = productNameElement.value?.trim();
    const productPrice = parseFloat(productPriceElement.value) || 0;
    const commissionType = commissionTypeElement.value;
    const commissionValue = parseFloat(commissionValueElement.value) || 0;
    
    console.log('Значения из формы позиции:', {
        productName: productName,
        productPrice: productPrice,
        commissionType: commissionType,
        commissionValue: commissionValue
    });
    
    // Проверяем что название позиции заполнено
    if (!productName || productName === 'undefined') {
        showMessage('Ошибка', 'Введите название позиции');
        return;
    }
    
    // Для новой архитектуры нужно привязать к заведению
    if (!editingProduct || !editingProduct.venue_id) {
        showMessage('Ошибка', 'Не указано заведение для позиции. Добавляйте позиции через настройки заведения.');
        return;
    }

    const productData = {
        venue_id: editingProduct.venue_id, // Привязка к заведению
        name: productName,
        price_per_unit: productPrice,
        commission_type: commissionType,
        commission_value: commissionValue
    };
    
    console.log('Данные позиции для отправки:', productData);
    
    try {
        if (editingProduct && editingProduct.id) {
            // Проверяем, что у редактируемого продукта есть корректный ID
            if (!editingProduct.id || editingProduct.id === 'undefined') {
                console.error('Некорректный ID продукта:', editingProduct);
                showMessage('Ошибка', 'Некорректный ID продукта. Попробуйте перезагрузить страницу.');
                return;
            }
            
                    const { error } = await supabase
            .from('venue_products')
            .update(productData)
            .eq('id', editingProduct.id);
            
            if (error) throw error;
        } else {
                    const { error } = await supabase
            .from('venue_products')
            .insert(productData);
            
            if (error) throw error;
        }
        
        closeAllModals();
        
        // Обновляем список позиций в модальном окне заведения (если оно открыто)
        if (editingVenue && editingVenue.id) {
            await loadVenueProducts(editingVenue.id);
        }
        
        await loadProducts();
        // Очищаем кэш после изменения продуктов
        clearDataCache();
        showMessage('Успех', editingProduct ? 'Позиция обновлена' : 'Позиция добавлена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

function confirmDeleteProduct(productId) {
    console.log('confirmDeleteProduct вызвана с параметром:', productId);
    
    // Пробуем найти продукт с учетом разных типов ID
    let product = products.find(p => p.id === productId);
    
    // Если не нашли, пробуем как строку
    if (!product && typeof productId === 'string') {
        product = products.find(p => String(p.id) === productId);
    }
    
    // Если не нашли, пробуем как число
    if (!product && !isNaN(productId)) {
        product = products.find(p => p.id === parseInt(productId));
    }
    
    if (product && confirm(`Удалить позицию "${product.name}"?`)) {
        deleteProductById(productId);
    } else if (!product) {
        console.error('Продукт не найден для удаления:', productId);
        showMessage('Ошибка', 'Продукт не найден');
    }
}

async function deleteProductById(productId) {
    try {
        const { error } = await supabase
            .from('venue_products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        await loadProducts();
        // Очищаем кэш после удаления продукта
        clearDataCache();
        showMessage('Успех', 'Позиция удалена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

async function deleteProduct() {
    if (!editingProduct || !editingProduct.id || editingProduct.id === 'undefined') {
        console.error('Некорректный продукт для удаления:', editingProduct);
        showMessage('Ошибка', 'Некорректный продукт для удаления');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('venue_products')
            .delete()
            .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        closeAllModals();
        await loadProducts();
        // Очищаем кэш после удаления продукта
        clearDataCache();
        showMessage('Успех', 'Позиция удалена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

// Настройки
function loadSettings() {
    // Настройки уже загружены в loadUserData
}

// Отчеты
function generateReports() {
    updateReportsMonth();
    
    const monthShifts = shifts.filter(shift => {
        const shiftDate = new Date(shift.shift_date);
        return shiftDate.getMonth() === currentMonth.getMonth() && 
               shiftDate.getFullYear() === currentMonth.getFullYear();
    });
    
    // Статистика по продажам
    const salesStats = {};
    let totalRevenue = 0;
    let totalPayout = 0;
    let totalTips = 0;
    let grossEarnings = 0;
    
    monthShifts.forEach(shift => {
        if (shift.is_workday) {
            totalRevenue += shift.revenue_generated;
            totalPayout += shift.fixed_payout;
            totalTips += shift.tips;
            grossEarnings += shift.earnings;
            
            if (shift.shift_products) {
                shift.shift_products.forEach(sp => {
                    const productName = sp.venue_products?.name || 'Неизвестно';
                    if (!salesStats[productName]) {
                        salesStats[productName] = {
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    salesStats[productName].quantity += sp.quantity;
                    salesStats[productName].revenue += sp.quantity * sp.price_snapshot;
                });
            }
        }
    });
    
    // Отображаем статистику продаж
    const salesContainer = document.getElementById('sales-stats');
    salesContainer.innerHTML = '';
    
    Object.entries(salesStats).forEach(([productName, stats]) => {
        const statElement = document.createElement('div');
        statElement.className = 'stat-item';
        statElement.innerHTML = `
            <span class="stat-label">${productName}:</span>
            <span class="stat-value">${stats.quantity} шт. (${formatCurrency(stats.revenue)})</span>
        `;
        salesContainer.appendChild(statElement);
    });
    
    // Обновляем финансовую статистику
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('total-payout').textContent = formatCurrency(totalPayout);
    document.getElementById('total-tips').textContent = formatCurrency(totalTips);
    document.getElementById('gross-earnings').textContent = formatCurrency(grossEarnings);
    
    calculateNetEarnings();
}

function calculateNetEarnings() {
    const grossEarnings = parseFloat(document.getElementById('gross-earnings').textContent.replace(/[^\d.-]/g, '')) || 0;
    const bonus = parseFloat(document.getElementById('bonus-input').value) || 0;
    const netEarnings = grossEarnings + bonus;
    
    document.getElementById('net-earnings').textContent = formatCurrency(netEarnings);
}

function exportData() {
    // Простой экспорт в CSV
    let csv = 'Дата,Заведение,Статус,Выручка,Выход,Чаевые,Заработок\n';
    
    shifts.forEach(shift => {
        csv += `${shift.shift_date},${shift.venues?.name || ''},${shift.is_workday ? 'Рабочий' : 'Выходной'},${shift.revenue_generated},${shift.fixed_payout},${shift.tips},${shift.earnings}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifts_${currentMonth.getFullYear()}_${currentMonth.getMonth() + 1}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Утилиты
async function getCurrentUser() {
    const maxRetries = 3;
    const baseTimeout = 8000; // Увеличиваем базовый таймаут до 8 секунд
    
    console.log('🔍 Начинаем получение данных пользователя с retry механизмом...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timeout = baseTimeout * Math.pow(1.5, attempt - 1); // Прогрессивный таймаут
            console.log(`🔄 Попытка ${attempt}/${maxRetries}, таймаут: ${timeout}ms`);
            
            const startTime = Date.now();
            
            const getUserPromise = supabase.auth.getUser();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Таймаут получения пользователя (${timeout}ms)`)), timeout)
            );
            
            const { data: { user }, error } = await Promise.race([getUserPromise, timeoutPromise]);
            
            const elapsed = Date.now() - startTime;
            console.log(`📋 Запрос пользователя занял ${elapsed}ms`);
            
            if (error) {
                // Различаем реальные ошибки от простого отсутствия авторизации
                if (error.message.includes('Invalid JWT') || error.message.includes('JWT')) {
                    console.log('ℹ️ Нет валидного JWT токена (пользователь не авторизован)');
                    return null; // Не повторяем для ошибок JWT
                } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                    console.log('ℹ️ Доступ запрещен (пользователь не авторизован)');
                    return null; // Не повторяем для ошибок доступа
                } else {
                    throw error; // Повторяем для других ошибок
                }
            }
            
            if (!user || !user.id) {
                console.log('ℹ️ Пользователь не найден (не авторизован)');
                return null;
            }
            
            console.log(`✅ Пользователь успешно получен на попытке ${attempt}:`, user.id);
            return user;
            
        } catch (error) {
            const isTimeout = error.message.includes('Таймаут');
            const isNetworkError = error.message.includes('NetworkError') || error.message.includes('fetch');
            
            if (attempt === maxRetries) {
                // Последняя попытка
                if (isTimeout) {
                    console.error(`⚠️ Превышен максимальный таймаут после ${maxRetries} попыток`);
                    console.error('💡 Возможные причины: медленное соединение, проблемы с Supabase, блокировка запросов');
                } else {
                    console.error('❌ Критическая ошибка при получении пользователя:', error);
                }
                return null;
            } else {
                // Не последняя попытка
                const delay = 1000 * attempt; // Задержка между попытками
                console.warn(`⚠️ Попытка ${attempt} неудачна: ${error.message}`);
                
                if (isTimeout || isNetworkError) {
                    console.log(`⏳ Ждем ${delay}ms перед следующей попыткой...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    // Для неизвестных ошибок не повторяем
                    console.error('❌ Неизвестная ошибка, прекращаем попытки:', error);
                    return null;
                }
            }
        }
    }
    
    console.error('❌ Не удалось получить пользователя после всех попыток');
    return null;
}

function formatCurrency(amount) {
    return `${(amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function updateCurrencyDisplay() {
    // Обновляем все отображения валюты
    document.querySelectorAll('.stat-value').forEach(el => {
        const text = el.textContent;
        const amount = text.match(/[\d\s,.-]+/);
        if (amount) {
            el.textContent = text.replace(/[₽$€p.]+/, currency);
        }
    });
}

function closeAllModals() {
    try {
        // Находим все модальные окна и принудительно скрываем их
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.style.display = 'none'; // Дополнительная защита
        });
        
        // Сбрасываем состояние редактирования
        editingShift = null;
        editingVenue = null;
        editingProduct = null;
        
        console.log('Все модальные окна закрыты');
    } catch (error) {
        console.log('Ошибка при закрытии модальных окон (возможно DOM еще не загружен):', error.message);
    }
}

// Функция для закрытия ТОЛЬКО информационного сообщения
function closeMessageModal() {
    try {
        const messageModal = document.getElementById('message-modal');
        if (messageModal) {
            messageModal.classList.add('hidden');
            messageModal.style.display = 'none';
            console.log('Информационное сообщение закрыто');
        }
    } catch (error) {
        console.log('Ошибка при закрытии информационного сообщения:', error.message);
    }
}

function showMessage(title, text) {
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = text;
    const modal = document.getElementById('message-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}



// Функция для настройки слушателей изменения аутентификации
function setupAuthStateListener() {
    if (!supabase) return;
    
    console.log('🔧 Настраиваем auth state listener');
    
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        console.log('🔍 onAuthStateChange флаги:', { isInitialized, isInitializing });
        
        // Если приложение еще не инициализировано, пропускаем SIGNED_IN
        // чтобы не дублировать инициализацию
        if (event === 'SIGNED_IN') {
            console.log('🔍 Обрабатываем SIGNED_IN событие');
            console.log('👤 Пользователь из события:', session?.user?.id);
            console.log('👤 Текущий пользователь:', currentUser?.id);
            if (!isInitialized) {
                console.log('⚠️ Приложение еще не инициализировано, пропускаем SIGNED_IN');
                return;
            }
            
            // Только если пользователь действительно сменился
            console.log('🔍 Проверяем смену пользователя:', {
                currentUserId: currentUser?.id,
                sessionUserId: session?.user?.id,
                isEqual: currentUser?.id === session?.user?.id
            });
            
            if (currentUser?.id !== session?.user?.id) {
                console.log('🎯 Новый пользователь вошел в систему:', session.user.id);
                
                // ПРИНУДИТЕЛЬНО скрываем загрузку НЕМЕДЛЕННО при входе
                console.log('🚨 ПРИНУДИТЕЛЬНОЕ СКРЫТИЕ ЗАГРУЗКИ ПРИ ВХОДЕ ПОЛЬЗОВАТЕЛЯ');
                hideLoading();
                showMainApp();
                
                currentUser = session.user;
                
                // Запускаем проверку сессии
                startSessionCheck();
                
                // Загружаем данные нового пользователя
                try {
                    await loadUserData();
                    showMainApp();
                } catch (error) {
                    console.error('Ошибка загрузки данных при смене пользователя:', error);
                    
                    // КРИТИЧЕСКИ ВАЖНО: скрываем загрузку и показываем приложение
                    console.log('🔧 Принудительно скрываем загрузку и показываем приложение (onAuthStateChange)...');
                    hideLoading();
                    showMainApp();
                    
                    showMessage('Ошибка', 'Не удалось загрузить данные пользователя');
                    console.log('✅ Приложение показано несмотря на ошибку в onAuthStateChange');
                }
            } else {
                console.log('⚠️ Тот же пользователь, пропускаем повторную загрузку');
                console.log('🔧 ПРИНУДИТЕЛЬНО скрываем загрузку для того же пользователя');
                hideLoading();
                showMainApp();
            }
            
        } else if (event === 'SIGNED_OUT') {
            console.log('Пользователь вышел из системы');
            
            // Останавливаем проверку сессии
            stopSessionCheck();
            
            // Очищаем данные
            currentUser = null;
            venues = [];
            products = [];
            shifts = [];
            
            // Сбрасываем флаги инициализации
            isInitialized = false;
            isInitializing = false;
            
            showAuthScreen();
            
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('Токен обновлен');
            // Время истечения сессии теперь управляется логикой активности
        }
    });
}



// Функция для очистки кэша
function clearDataCache() {
    console.log('🧹 Очистка кэша данных');
    localStorage.removeItem('cached_venues');
    localStorage.removeItem('cached_products');
}

// Добавляем улучшенные глобальные функции для диагностики
window.diagnoseConnection = diagnoseConnection;
window.refreshUserData = refreshUserData;
window.testUserAuth = async function() {
    console.log('=== ТЕСТ АУТЕНТИФИКАЦИИ ПОЛЬЗОВАТЕЛЯ ===');
    try {
        const result = await getCurrentUser();
        console.log('Результат:', result);
        return result;
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
};

window.retryDataLoad = async function() {
    console.log('=== ПОВТОРНАЯ ЗАГРУЗКА ДАННЫХ ===');
    if (currentUser) {
        await refreshUserData();
        console.log('Данные перезагружены');
    } else {
        console.log('Нет авторизованного пользователя');
    }
};

window.forceReload = function() {
    console.log('=== ПРИНУДИТЕЛЬНАЯ ПЕРЕЗАГРУЗКА СТРАНИЦЫ ===');
    localStorage.removeItem('cached_venues');
    localStorage.removeItem('cached_products');
    location.reload();
};

window.checkAppState = function() {
    console.log('=== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===');
    console.log('Пользователь:', currentUser);
    console.log('Заведения:', venues.length);
    console.log('Продукты:', products.length);
    console.log('Смены:', shifts.length);
    console.log('Текущий месяц:', currentMonth);
    console.log('Supabase клиент:', !!supabase);
    console.log('Флаги инициализации:', { isInitializing, isInitialized });
    console.log('Экран загрузки скрыт:', document.getElementById('loading-screen')?.classList.contains('hidden'));
    console.log('Главное приложение показано:', !document.getElementById('main-app')?.classList.contains('hidden'));
    console.log('Экран авторизации показан:', !document.getElementById('auth-screen')?.classList.contains('hidden'));
};

window.forceInitialize = function() {
    console.log('=== ПРИНУДИТЕЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ===');
    isInitializing = false;
    isInitialized = false;
    initializeApp().catch(error => {
        console.error('Ошибка принудительной инициализации:', error);
    });
};

// Диагностика смен
window.diagnoseShifts = async function() {
    console.log('🔍 === ДИАГНОСТИКА СМЕН ===');
    
    console.log('1️⃣ Состояние переменных:');
    console.log('  - currentUser:', currentUser);
    console.log('  - shifts массив:', shifts);
    console.log('  - venues массив:', venues);
    console.log('  - currentMonth:', currentMonth);
    
    console.log('2️⃣ DOM элементы:');
    const container = document.getElementById('shifts-list');
    console.log('  - shifts-list найден:', !!container);
    console.log('  - shifts-list HTML длина:', container?.innerHTML?.length || 0);
    console.log('  - shifts-list дочерние элементы:', container?.children?.length || 0);
    
    if (currentUser?.id) {
        console.log('3️⃣ Прямой запрос к базе данных:');
        try {
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
            
            const { data: directShifts, error } = await supabase
                .from('shifts')
                .select('*')
                .eq('user_id', currentUser.id)
                .gte('shift_date', startOfMonth.toISOString().split('T')[0])
                .lte('shift_date', endOfMonth.toISOString().split('T')[0])
                .order('shift_date', { ascending: false });
                
            console.log('  - Прямой запрос результат:', directShifts);
            console.log('  - Прямой запрос ошибка:', error);
            console.log('  - Количество смен в БД:', directShifts?.length || 0);
            
            // Проверяем заведения тоже
            const { data: directVenues, error: venuesError } = await supabase
                .from('venues')
                .select('*')
                .eq('user_id', currentUser.id);
                
            console.log('  - Заведения в БД:', directVenues);
            console.log('  - Заведения ошибка:', venuesError);
            
        } catch (error) {
            console.error('  - Ошибка прямого запроса:', error);
        }
    }
    
    console.log('4️⃣ Принудительный рендер:');
    renderShiftsList();
    
    console.log('✅ Диагностика завершена');
};

// ТЕСТИРОВАНИЕ ОТОБРАЖЕНИЯ ПОЗИЦИЙ В СМЕНАХ
window.testShiftProductsDisplay = async function() {
    console.log('🧪 === ТЕСТИРОВАНИЕ ОТОБРАЖЕНИЯ ПОЗИЦИЙ ===');
    
    if (!currentUser) {
        console.log('❌ Пользователь не авторизован');
        await restoreAuth();
        if (!currentUser) {
            console.log('❌ Не удалось восстановить авторизацию');
            return;
        }
    }
    
    console.log('✅ Пользователь авторизован');
    console.log('📊 Данные состояния:');
    console.log('  - Смены:', shifts.length);
    console.log('  - Продукты:', products.length);
    console.log('  - Заведения:', venues.length);
    
    if (shifts.length === 0) {
        console.log('⚠️ Нет смен для отображения');
        return;
    }
    
    console.log('🔄 Принудительно перерендериваем список...');
    await renderShiftsList();
    
    console.log('✅ Тест завершен! Проверьте смены в интерфейсе');
};

// ЭКСТРЕННОЕ ВОССТАНОВЛЕНИЕ АВТОРИЗАЦИИ
window.restoreAuth = async function() {
    console.log('🔐 === ЭКСТРЕННОЕ ВОССТАНОВЛЕНИЕ АВТОРИЗАЦИИ ===');
    
    try {
        console.log('1️⃣ Проверяем текущую сессию...');
        const { data: session, error } = await supabase.auth.getSession();
        
        console.log('📋 Результат getSession:', { 
            session: !!session?.session, 
            user: !!session?.session?.user,
            error: error 
        });
        
        if (session?.session?.user) {
            console.log('✅ Активная сессия найдена! Восстанавливаем пользователя...');
            currentUser = session.session.user;
            
            console.log('2️⃣ Сбрасываем флаги инициализации...');
            isInitialized = false;
            isInitializing = false;
            
            console.log('📅 Сбрасываем дату на текущий месяц...');
            currentMonth = new Date();
            console.log('📅 Установлена дата:', currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }));
            
            console.log('3️⃣ Принудительная инициализация...');
            await initializeApp();
            
            console.log('4️⃣ Переключаем на главный экран...');
            hideLoading();
            showMainApp();
            
            console.log('✅ АВТОРИЗАЦИЯ ВОССТАНОВЛЕНА!');
            return true;
            
        } else {
            console.log('❌ Активная сессия не найдена. Показываем экран авторизации...');
            hideLoading();
            showAuthScreen();
            return false;
        }
        
    } catch (error) {
        console.error('❌ Ошибка восстановления авторизации:', error);
        hideLoading();
        showAuthScreen();
        return false;
    }
};

// Функция для принудительного обновления данных
async function refreshUserData() {
    console.log('🔄 Принудительное обновление данных пользователя...');
    
    if (!currentUser?.id) {
        console.log('⚠️ Нет авторизованного пользователя для обновления данных');
        return;
    }
    
    try {
        // Очищаем кэш
        clearDataCache();
        
        // Перезагружаем данные
        await loadVenuesOptimized();
        await loadProductsOptimized();
        await loadShiftsOptimized();
        
        // Обновляем интерфейс
        updateVenueSelects();
        renderVenuesList();
        renderProductsList();
        
        console.log('✅ Данные обновлены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка при обновлении данных:', error);
        showMessage('Ошибка', 'Не удалось обновить данные. Попробуйте еще раз.');
    }
}