// Конфигурация Supabase - ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ
const SUPABASE_URL = 'https://ukuhwaulkvpqkwqbqqag.supabase.co'; // https://your-project-id.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWh3YXVsa3ZwcWt3cWJxcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDUzMDgsImV4cCI6MjA2NjQyMTMwOH0.dzSK4aP-QB8QjkZ_JrTc-DHEehLwce2Y2leK_VslBqY'; // ваш anon ключ из Settings > API

// Проверяем загрузку библиотеки Supabase
console.log('Проверка загрузки Supabase:', {
    windowSupabase: !!window.supabase,
    windowSupabaseType: typeof window.supabase
});

// Создаем клиент Supabase с настройкой сессии 2 часа
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // Автоматическое обновление токена
        autoRefreshToken: true,
        // Сохранение сессии в localStorage
        persistSession: true,
        // Обнаружение сессии в URL (для reset password)
        detectSessionInUrl: true,
        // Используем PKCE для безопасности
        flowType: 'pkce',
        // Интервал обновления токена (1.5 часа = 5400 секунд)
        refreshThreshold: 5400,
        // Настройки для JWT токена - срок жизни 2 часа
        storage: window.localStorage,
        storageKey: 'sb-auth-token'
    },
    // Дополнительные настройки для стабильности
    global: {
        headers: {
            'X-Client-Info': 'shiftlog-app'
        }
    },
    // Настройки для работы с сетью
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
}) : null;

console.log('Клиент Supabase создан:', {
    supabaseExists: !!supabase,
    supabaseType: typeof supabase
});

// Состояние приложения
let currentUser = null;
let currentMonth = new Date();
let venues = [];
let products = [];
let shifts = [];
let currency = '₽';
let editingShift = null;
let editingVenue = null;
let editingProduct = null;

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

// Инициализация приложения v2.0.1 - с отображением сумм по позициям
console.log('Начало загрузки скрипта app.js v2.0.1');
console.log('🌐 Среда выполнения:', {
    host: window.location.host,
    protocol: window.location.protocol,
    userAgent: navigator.userAgent.substring(0, 100),
    isLocalhost: window.location.hostname === 'localhost',
    timestamp: new Date().toISOString()
});

function initApp() {
    console.log('🚀 Инициализация приложения начата');
    console.log('📊 Состояние перед инициализацией:', {
        supabaseExists: !!supabase,
        currentUser: currentUser,
        documentReady: document.readyState
    });
    
    // Принудительно скрываем все модальные окна при загрузке
    closeAllModals();
    console.log('✅ Модальные окна закрыты');
    
    console.log('🔄 Запуск initializeApp...');
    initializeApp();
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
    console.log('🔧 initializeApp запущена');
    
    // Проверяем наличие Supabase
    if (!supabase) {
        console.error('❌ Supabase клиент недоступен');
        // Задержка перед показом сообщения, чтобы интерфейс полностью загрузился
        setTimeout(() => {
            showMessage('Ошибка', 'Не удалось подключиться к базе данных. Настройте Supabase.');
        }, 100);
        return;
    }

    console.log('✅ Supabase клиент доступен, проверяем сессию...');
    
    try {
        // Проверяем текущую сессию
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📝 Результат проверки сессии:', { session: !!session });
        
        if (session) {
            currentUser = session.user;
            console.log('✅ Пользователь авторизован:', currentUser.id);
            console.log('🔄 Загружаем данные пользователя...');
            
            // Запускаем проверку сессии
            startSessionCheck();
            
            // Устанавливаем таймаут для отслеживания зависания на loadUserData
            const loadTimeout = setTimeout(() => {
                console.error('⏰ ТАЙМАУТ! loadUserData зависла больше 45 секунд');
                hideLoading();
                showMessage('Предупреждение', 'Загрузка данных заняла слишком много времени. Попробуйте обновить страницу.');
                showMainApp(); // Все равно показываем приложение
            }, 45000); // Увеличиваем таймаут до 45 секунд
            
            try {
                // loadUserData теперь не бросает ошибки, всегда выполняется
                await loadUserData();
                console.log('✅ loadUserData завершена');
            } catch (error) {
                // Этот блок теперь не должен выполняться, но оставляем для безопасности
                console.error('❌ Неожиданная ошибка при загрузке данных пользователя:', error);
                showMessage('Предупреждение', 'Произошла неожиданная ошибка, но приложение продолжает работать.');
            } finally {
                // ГАРАНТИРОВАННО показываем приложение в любом случае
                clearTimeout(loadTimeout);
                console.log('🎯 Показываем главное приложение');
                showMainApp();
            }
        } else {
            console.log('ℹ️ Пользователь не авторизован, показываем экран авторизации');
            showAuthScreen();
        }

        console.log('🎯 Скрываем экран загрузки');
        hideLoading();
        console.log('🔗 Настраиваем обработчики событий');
        setupEventListeners();
        console.log('✅ Инициализация завершена успешно');
        
    } catch (error) {
        console.error('❌ Ошибка при инициализации:', error);
        showMessage('Ошибка', 'Произошла ошибка при подключении к базе данных: ' + error.message);
        hideLoading();
        showAuthScreen();
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
            console.log('⚠️ Сессия не найдена, перенаправляем на авторизацию');
            handleSessionExpired();
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
    
    // Показываем сообщение пользователю
    showMessage('Сессия истекла', 'Ваша сессия истекла. Войдите в систему заново.');
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
            switchScreen(screen);
        });
    });
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
    
    // Отладка пользователя
    document.getElementById('debug-user-btn').addEventListener('click', debugCurrentUser);
    document.getElementById('test-shift-products-btn').addEventListener('click', testShiftProducts);
    document.getElementById('analyze-shifts-btn').addEventListener('click', analyzeExistingShifts);
    
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
    // Закрытие модальных окон
    ['close-shift-modal', 'cancel-shift', 'close-venue-modal', 'cancel-venue', 
     'close-product-modal', 'cancel-product', 'close-message-modal', 'close-message'].forEach(id => {
        document.getElementById(id).addEventListener('click', closeAllModals);
    });
    
    // Удаление
    document.getElementById('delete-shift').addEventListener('click', deleteShift);
    document.getElementById('delete-venue').addEventListener('click', deleteVenue);
    document.getElementById('delete-product').addEventListener('click', deleteProduct);
    
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
    console.log('🔄 loadUserData начата с оптимизацией');
    
    try {
        console.log('💰 Загружаем настройки валюты...');
        currency = localStorage.getItem('currency') || '₽';
        document.getElementById('currency-select').value = currency;
        console.log('✅ Валюта установлена:', currency);
        
        // Простая проверка пользователя (без строгих проверок)
        console.log('🔧 Получаем текущего пользователя...');
        currentUser = await getCurrentUser();
        
        if (!currentUser) {
            console.error('❌ Пользователь не найден, работаем в режиме ошибки');
            showMessage('Ошибка', 'Сессия устарела. Войдите в систему заново.');
        } else {
            console.log('✅ Пользователь найден:', currentUser.id);
        }
        
        if (currentUser) {
            console.log('📊 Начинаем быструю загрузку данных...');
            
            // Используем кэшированные данные если доступны
            loadCachedData();
            
            // Загружаем критически важные данные сначала
            console.log('1️⃣ Приоритетная загрузка заведений...');
            await loadVenuesOptimized();
            
            // Обновляем интерфейс с минимальными данными
            updateVenueSelects();
            
            // Загружаем остальные данные в фоне
            console.log('2️⃣ Фоновая загрузка продуктов и смен...');
            loadProductsAndShiftsInBackground();
            
            console.log('✅ Быстрая загрузка завершена');
        } else {
            console.log('⚠️ Без пользователя - устанавливаем пустые данные');
            venues = [];
            products = [];
            shifts = [];
        }
        
    } catch (error) {
        console.error('❌ Ошибка при загрузке данных пользователя:', error);
        console.log('🔄 Переходим в режим частичной загрузки...');
        
        // Показываем предупреждение вместо критической ошибки
        showMessage('Предупреждение', 'Произошла ошибка при загрузке данных. Приложение работает в ограниченном режиме.');
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
    console.log('🏢 Оптимизированная загрузка заведений');
    
    if (!currentUser?.id) {
        console.error('❌ Нет авторизованного пользователя');
        return;
    }
    
    try {
        // Короткий таймаут для быстрой загрузки
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Таймаут загрузки заведений')), 3000)
        );
        
        const venuesPromise = supabase
            .from('venues')
            .select('id, name, user_id') // Загружаем только нужные поля
            .eq('user_id', currentUser.id)
            .order('name');
        
        const { data, error } = await Promise.race([venuesPromise, timeoutPromise]);
        
        if (error) {
            console.warn('⚠️ Ошибка загрузки заведений:', error);
            return;
        }
        
        venues = data || [];
        console.log('✅ Быстро загружено заведений:', venues.length);
        
        // Кэшируем данные
        localStorage.setItem('cached_venues', JSON.stringify(venues));
        
        // Обновляем интерфейс
        updateVenueSelects();
        renderVenuesList();
        
    } catch (error) {
        console.warn('⚠️ Таймаут или ошибка при загрузке заведений:', error);
        // Используем кэшированные данные если есть
        if (venues.length === 0) {
            loadCachedData();
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
    
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Таймаут загрузки продуктов')), 5000)
        );
        
        const productsPromise = supabase
            .from('user_products')
            .select('id, name, price_per_unit, commission_type, commission_value, user_id')
            .eq('user_id', currentUser.id)
            .order('name')
            .limit(50); // Ограничиваем количество для быстрой загрузки
        
        const { data, error } = await Promise.race([productsPromise, timeoutPromise]);
        
        if (!error && data) {
            products = data;
            console.log('✅ Загружено продуктов:', products.length);
            
            // Кэшируем данные
            localStorage.setItem('cached_products', JSON.stringify(products));
            
            // Обновляем интерфейс
            renderProductsList();
            updateProductFields();
        }
        
    } catch (error) {
        console.warn('⚠️ Ошибка загрузки продуктов:', error);
    }
}

async function loadShiftsOptimized() {
    if (!currentUser?.id) return;
    
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Таймаут загрузки смен')), 5000)
        );
        
        // Загружаем только смены за текущий месяц
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const shiftsPromise = supabase
            .from('shifts')
            .select('id, shift_date, is_workday, venue_id, fixed_payout, tips, revenue_generated, earnings, user_id')
            .eq('user_id', currentUser.id)
            .gte('shift_date', startOfMonth.toISOString().split('T')[0])
            .lte('shift_date', endOfMonth.toISOString().split('T')[0])
            .order('shift_date', { ascending: false });
        
        const { data, error } = await Promise.race([shiftsPromise, timeoutPromise]);
        
        if (!error && data) {
            shifts = data;
            console.log('✅ Загружено смен за месяц:', shifts.length);
            
            // Обновляем интерфейс
            renderShiftsList();
        }
        
    } catch (error) {
        console.warn('⚠️ Ошибка загрузки смен:', error);
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

function renderShiftsList() {
    const container = document.getElementById('shifts-list');
    container.innerHTML = '';
    
    console.log('Отображение смен:', shifts);
    
    if (shifts.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;">Нет данных за выбранный месяц</div>';
        return;
    }
    
    shifts.forEach(shift => {
        console.log('Отображаем смену:', shift);
        
        const shiftElement = document.createElement('div');
        shiftElement.className = `shift-row ${!shift.is_workday ? 'holiday' : ''}`;
        shiftElement.onclick = async () => await editShift(shift);
        
        const date = new Date(shift.shift_date);
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        
        // Получаем название заведения из массива venues
        const venue = venues.find(v => v.id === shift.venue_id);
        const venueName = venue?.name || 'Не указано';
        
        shiftElement.innerHTML = `
            <div class="table-cell">
                <div>
                    <div class="shift-date">${dayNames[date.getDay()]} ${date.getDate()}</div>
                    <div class="shift-venue">${venueName}</div>
                </div>
            </div>
            <div class="table-cell shift-venue">${venueName}</div>
            <div class="table-cell shift-amount">${formatCurrency(shift.revenue_generated || 0)}</div>
            <div class="table-cell shift-amount">${formatCurrency(shift.earnings || 0)}</div>
        `;
        
        container.appendChild(shiftElement);
    });
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
    
    // Сначала обновляем поля продуктов для выбранного заведения (с очисткой значений)
    console.log('🔄 Обновляем поля продуктов с очисткой для редактирования смены');
    updateProductFields(true);
    
    // Загружаем данные продуктов смены из базы (только для существующих смен)
    if (shift.id && shift.id !== 'undefined') {
        console.log('🔍 Загружаем данные продуктов для смены ID:', shift.id);
        console.log('🔍 Тип ID смены:', typeof shift.id);
        
        try {
            // Дождемся создания полей продуктов перед загрузкой данных
            await new Promise(resolve => setTimeout(resolve, 300));
            
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
                return;
            }
            
            // Заполняем количества продуктов (используем только загруженные данные из БД)
            const productsData = shiftProducts || [];
            
            console.log(`📦 Найдено ${productsData.length} продуктов для смены ${shift.id}`);
            
            if (productsData.length > 0) {
                // Заполняем поля количества
                productsData.forEach(sp => {
                    const input = document.querySelector(`[data-product-id="${sp.product_id}"]`);
                    console.log(`🔍 Ищем поле для продукта ${sp.product_id}:`, !!input);
                    
                    if (input) {
                        input.value = sp.quantity;
                        console.log(`✅ Установлено количество ${sp.quantity} для продукта ${sp.product_id}`);
                        
                        // Принудительно запускаем событие change для обновления сумм
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    } else {
                        console.warn(`⚠️ Поле для продукта ${sp.product_id} не найдено`);
                        
                        // Покажем все доступные поля для отладки
                        const allInputs = document.querySelectorAll('[data-product-id]');
                        console.log('Доступные поля продуктов:', Array.from(allInputs).map(i => i.getAttribute('data-product-id')));
                    }
                });
                
                // Обновляем суммы продуктов и общие итоги
                setTimeout(() => {
                    updateAllProductSums();
                    calculateShiftTotals();
                }, 100);
            } else {
                console.log('📦 Нет сохраненных продуктов для этой смены');
            }
            
        } catch (error) {
            console.error('❌ Исключение при загрузке продуктов смены:', error);
        }
    } else {
        console.log('⚠️ Смена без ID - не загружаем продукты из БД');
    }
    
    // Обновляем суммы продуктов и общие итоги в любом случае
    setTimeout(() => {
        updateAllProductSums();
        calculateShiftTotals();
    }, 300);
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
    const venueProducts = products.filter(product => product.venue_id === selectedVenueId);
    
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
        await loadShifts();
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
        await loadShifts();
        showMessage('Успех', 'Смена удалена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
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
    } else {
        // Добавление нового заведения (venue = null или venue без id)
        console.log('Открытие модального окна для добавления нового заведения');
        title.textContent = 'Добавить заведение';
        deleteBtn.classList.add('hidden');
        document.getElementById('venue-form').reset();
        
        // Сбрасываем editingVenue при добавлении нового
        editingVenue = null;
    }
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
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
    
    // Для новой архитектуры нужно выбрать заведение
    if (!editingProduct) {
        showMessage('Ошибка', 'Функция добавления продуктов временно недоступна. Продукты теперь привязаны к заведениям. Обратитесь к разработчику.');
        return;
    }

    const productData = {
        venue_id: editingProduct.venue_id, // Сохраняем привязку к заведению
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
    try {
        console.log('🔍 Вызываем supabase.auth.getUser() с таймаутом...');
        
        // Добавляем таймаут чтобы не зависать
        const getUserPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Таймаут получения пользователя')), 5000)
        );
        
        const { data: { user }, error } = await Promise.race([getUserPromise, timeoutPromise]);
        
        console.log('📋 Результат getUser:', { user: !!user, error });
        
        if (error) {
            console.error('❌ Ошибка получения пользователя:', error);
            return null;
        }
        
        if (!user || !user.id) {
            console.warn('⚠️ Пользователь не найден или нет ID');
            return null;
        }
        
        console.log('✅ Пользователь получен:', user.id);
        return user;
    } catch (error) {
        console.error('❌ Исключение при получении пользователя:', error);
        return null;
    }
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

function showMessage(title, text) {
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = text;
    const modal = document.getElementById('message-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

async function debugCurrentUser() {
    console.log('=== ПОЛНАЯ ДИАГНОСТИКА ===');
    
    // 1. Проверяем текущего пользователя
    console.log('currentUser переменная:', currentUser);
    
    // 2. Проверяем сессию
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Сессия:', sessionData, 'Ошибка:', sessionError);
    
    if (currentUser?.id) {
        console.log('=== ПРОВЕРКА ДАННЫХ В БД ===');
        
        // 3. Проверяем смены напрямую из БД
        const { data: shiftsData, error: shiftsError } = await supabase
            .from('shifts')
            .select('id, shift_date, venue_id, is_workday, revenue_generated, earnings')
            .eq('user_id', currentUser.id)
            .order('shift_date', { ascending: false })
            .limit(10);
        console.log('Смены в БД (последние 10):', shiftsData, 'Ошибка:', shiftsError);
        
        // 4. Проверяем заведения
        const { data: venuesData, error: venuesError } = await supabase
            .from('venues')
            .select('id, name, user_id')
            .eq('user_id', currentUser.id);
        console.log('Заведения в БД:', venuesData, 'Ошибка:', venuesError);
        
        // 5. Проверяем связи смен с заведениями
        if (shiftsData && venuesData) {
            const shiftsWithVenues = shiftsData.map(shift => {
                const venue = venuesData.find(v => v.id === shift.venue_id);
                return {
                    ...shift,
                    venue_name: venue?.name || 'НЕТ ЗАВЕДЕНИЯ'
                };
            });
            console.log('Смены с названиями заведений:', shiftsWithVenues);
        }
        
        // 6. Проверяем текущий месяц для фильтрации
        console.log('Текущий месяц для фильтрации:', currentMonth);
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        console.log('Период фильтрации:', startOfMonth.toISOString().split('T')[0], 'до', endOfMonth.toISOString().split('T')[0]);
        
        // 7. Проверяем смены за текущий месяц
        const { data: monthShifts, error: monthError } = await supabase
            .from('shifts')
            .select('*')
            .eq('user_id', currentUser.id)
            .gte('shift_date', startOfMonth.toISOString().split('T')[0])
            .lte('shift_date', endOfMonth.toISOString().split('T')[0]);
        console.log('Смены за текущий месяц:', monthShifts, 'Ошибка:', monthError);
        
        // 8. Проверяем структуру таблицы shift_products
        const { data: shiftProductsStructure, error: structureError } = await supabase
            .from('shift_products')
            .select('*')
            .limit(1);
        console.log('Структура shift_products:', shiftProductsStructure, 'Ошибка:', structureError);
        
        // 9. Проверяем связанные данные shift_products для тестовой смены
        if (shiftsData && shiftsData.length > 0) {
            const testShiftId = shiftsData[0].id;
            const { data: testShiftProducts, error: testError } = await supabase
                .from('shift_products')
                .select('*')
                .eq('shift_id', testShiftId);
            console.log(`Продукты для смены ${testShiftId}:`, testShiftProducts, 'Ошибка:', testError);
        }
        
        alert('Диагностика завершена. Смотрите консоль браузера (F12)');
    } else {
        alert('Пользователь не авторизован или нет ID');
    }
}

// Функция для тестирования сохранения продуктов смены
async function testShiftProducts() {
    console.log('=== ТЕСТ СОХРАНЕНИЯ ПРОДУКТОВ СМЕНЫ ===');
    
    if (!currentUser?.id) {
        alert('Необходимо войти в систему');
        return;
    }
    
    try {
        // Создаем уникальную тестовую дату (завтра + случайные дни)
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + Math.floor(Math.random() * 30) + 1);
        
        const testShiftData = {
            user_id: currentUser.id,
            shift_date: testDate.toISOString().split('T')[0],
            is_workday: true,
            venue_id: venues[0]?.id || null,
            fixed_payout: 1000,
            tips: 200,
            revenue_generated: 5000,
            earnings: 2000
        };
        
        console.log('Создаем тестовую смену:', testShiftData);
        
        const { data: shiftData, error: shiftError } = await supabase
            .from('shifts')
            .insert(testShiftData)
            .select()
            .single();
        
        if (shiftError) {
            console.error('Ошибка создания тестовой смены:', shiftError);
            return;
        }
        
        console.log('Тестовая смена создана:', shiftData);
        
        // Создаем тестовые продукты смены
        const testProducts = products.slice(0, 2).map((product, index) => ({
            shift_id: shiftData.id,
            product_id: product.id,
            quantity: index + 1,
            price_snapshot: product.price_per_unit,
            commission_snapshot: product.commission_value
        }));
        
        console.log('Создаем тестовые продукты смены:', testProducts);
        
        const { data: productsData, error: productsError } = await supabase
            .from('shift_products')
            .insert(testProducts)
            .select();
        
        if (productsError) {
            console.error('Ошибка создания продуктов смены:', productsError);
        } else {
            console.log('Продукты смены созданы:', productsData);
        }
        
        // Удаляем тестовую смену
        await supabase.from('shift_products').delete().eq('shift_id', shiftData.id);
        await supabase.from('shifts').delete().eq('id', shiftData.id);
        
        console.log('Тестовая смена удалена');
        alert('Тест завершен. Смотрите консоль браузера (F12)');
        
    } catch (error) {
        console.error('Ошибка тестирования:', error);
        alert('Ошибка тестирования: ' + error.message);
    }
}

// Функция для анализа существующих смен и их продуктов
async function analyzeExistingShifts() {
    console.log('=== АНАЛИЗ СУЩЕСТВУЮЩИХ СМЕН И ПРОДУКТОВ ===');
    
    if (!currentUser?.id) {
        alert('Необходимо войти в систему');
        return;
    }
    
    try {
        // Получаем все смены пользователя
        const { data: allShifts, error: shiftsError } = await supabase
            .from('shifts')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('shift_date', { ascending: false })
            .limit(5);
        
        if (shiftsError) {
            console.error('Ошибка получения смен:', shiftsError);
            return;
        }
        
        console.log('Последние 5 смен:', allShifts);
        
        for (const shift of allShifts) {
            console.log(`\n--- Анализ смены ${shift.shift_date} ---`);
            console.log('Данные смены:', shift);
            
            // Проверяем продукты для каждой смены
            const { data: shiftProducts, error: productsError } = await supabase
                .from('shift_products')
                .select('*')
                .eq('shift_id', shift.id);
            
            if (productsError) {
                console.error(`Ошибка получения продуктов для смены ${shift.id}:`, productsError);
            } else {
                console.log(`Продукты смены ${shift.shift_date}:`, shiftProducts);
                console.log(`Количество продуктов: ${shiftProducts.length}`);
                
                if (shiftProducts.length === 0) {
                    console.log('❌ Нет сохраненных продуктов для этой смены');
                } else {
                    console.log('✅ Есть сохраненные продукты');
                    shiftProducts.forEach(product => {
                        console.log(`  - Продукт ID: ${product.product_id}, Количество: ${product.quantity}, Цена: ${product.price_snapshot}`);
                    });
                }
            }
        }
        
        // Проверяем общую статистику
        const { data: totalProducts, error: totalError } = await supabase
            .from('shift_products')
            .select('shift_id')
            .in('shift_id', allShifts.map(s => s.id));
        
        console.log(`\n=== СТАТИСТИКА ===`);
        console.log(`Всего смен: ${allShifts.length}`);
        console.log(`Всего записей продуктов: ${totalProducts?.length || 0}`);
        console.log(`Смен без продуктов: ${allShifts.length - (totalProducts?.length || 0)}`);
        
        alert('Анализ завершен. Смотрите консоль браузера (F12)');
        
    } catch (error) {
        console.error('Ошибка анализа:', error);
        alert('Ошибка анализа: ' + error.message);
    }
}

// Настройка слушателей изменения аутентификации
if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            console.log('Пользователь вошел в систему:', currentUser.id);
            
            // Запускаем проверку сессии
            startSessionCheck();
            
            await loadUserData();
            showMainApp();
        } else if (event === 'SIGNED_OUT') {
            console.log('Пользователь вышел из системы');
            
            // Останавливаем проверку сессии
            stopSessionCheck();
            
            currentUser = null;
            venues = [];
            products = [];
            shifts = [];
            showAuthScreen();
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('Токен обновлен');
            // Время истечения сессии теперь управляется логикой активности
        }
    });
} 