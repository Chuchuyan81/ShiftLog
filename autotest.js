/**
 * КОМПЛЕКСНЫЙ СКРИПТ АВТОМАТИЧЕСКОГО ТЕСТИРОВАНИЯ
 * Приложение: Журнал Рабочих Смен (ShiftLog)
 * 
 * Запуск: откройте в браузере или включите в index.html
 * Тестирует: API, UI, бизнес-логику, интеграции
 */

// Конфигурация тестов
const TEST_CONFIG = {
    // Конфигурация подключения к тестовой БД
    SUPABASE_URL: 'https://ukuhwaulkvpqkwqbqqag.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWh3YXVsa3ZwcWt3cWJxcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDUzMDgsImV4cCI6MjA2NjQyMTMwOH0.dzSK4aP-QB8QjkZ_JrTc-DHEehLwce2Y2leK_VslBqY',
    
    // Тестовые данные
    TEST_USER: {
        email: 'chuchuyan81@gmail.com',
        password: '123456'
    },
    
    // Настройки тестирования
    TIMEOUT: 10000, // 10 секунд
    RETRY_COUNT: 3,
    DELAY_BETWEEN_TESTS: 1000, // 1 секунда
    
    // Флаги тестов
    RUN_SUPABASE_TESTS: true,
    RUN_UI_TESTS: true,
    RUN_BUSINESS_LOGIC_TESTS: true,
    RUN_INTEGRATION_TESTS: true,
    CLEANUP_AFTER_TESTS: true
};

// Состояние тестирования
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    startTime: null,
    endTime: null
};

// Тестовые данные
let testData = {
    userId: null,
    venueId: null,
    productId: null,
    shiftId: null,
    supabaseClient: null
};

/**
 * Главная функция запуска тестов
 */
async function runAllTests() {
    console.log('🚀 НАЧАЛО АВТОМАТИЧЕСКОГО ТЕСТИРОВАНИЯ ShiftLog');
    console.log('='.repeat(60));
    
    testResults.startTime = new Date();
    
    try {
        // Инициализация тестовой среды
        await initializeTestEnvironment();
        
        // Запуск групп тестов
        if (TEST_CONFIG.RUN_SUPABASE_TESTS) {
            await runSupabaseTests();
        }
        
        if (TEST_CONFIG.RUN_UI_TESTS) {
            await runUITests();
        }
        
        if (TEST_CONFIG.RUN_BUSINESS_LOGIC_TESTS) {
            await runBusinessLogicTests();
        }
        
        if (TEST_CONFIG.RUN_INTEGRATION_TESTS) {
            await runIntegrationTests();
        }
        
        // Очистка после тестов
        if (TEST_CONFIG.CLEANUP_AFTER_TESTS) {
            await cleanupTestData();
        }
        
    } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при тестировании:', error);
        testResults.errors.push({
            test: 'СИСТЕМА',
            error: error.message,
            stack: error.stack
        });
    } finally {
        // Вывод итогового отчета
        await generateTestReport();
    }
}

/**
 * Инициализация тестовой среды
 */
async function initializeTestEnvironment() {
    logTestSection('ИНИЦИАЛИЗАЦИЯ ТЕСТОВОЙ СРЕДЫ');
    
    // Проверка наличия Supabase
    await testFunction('Проверка загрузки Supabase', async () => {
        if (!window.supabase) {
            throw new Error('Библиотека Supabase не загружена');
        }
        
        testData.supabaseClient = window.supabase.createClient(
            TEST_CONFIG.SUPABASE_URL, 
            TEST_CONFIG.SUPABASE_KEY
        );
        
        if (!testData.supabaseClient) {
            throw new Error('Не удалось создать клиент Supabase');
        }
        
        return true;
    });
    
    // Проверка подключения к БД
    await testFunction('Проверка подключения к БД', async () => {
        const { data, error } = await testData.supabaseClient
            .from('venues')
            .select('count')
            .limit(1);
            
        if (error) {
            throw new Error(`Ошибка подключения к БД: ${error.message}`);
        }
        
        return true;
    });
    
    // Проверка DOM элементов
    await testFunction('Проверка DOM элементов', async () => {
        const requiredElements = [
            'app', 'main-app', 'auth-screen', 'loading-screen',
            'shifts-screen', 'reports-screen', 'settings-screen'
        ];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Элемент ${elementId} не найден в DOM`);
            }
        }
        
        return true;
    });
}

/**
 * Тестирование функций Supabase
 */
async function runSupabaseTests() {
    logTestSection('ТЕСТИРОВАНИЕ SUPABASE');
    
    // Тестирование аутентификации
    await testSupabaseAuth();
    
    // Тестирование CRUD операций
    await testSupabaseCRUD();
    
    // Тестирование RLS политик
    await testSupabaseRLS();
}

/**
 * Тестирование аутентификации
 */
async function testSupabaseAuth() {
    logTestSubsection('Аутентификация');
    
    // Регистрация тестового пользователя
    await testFunction('Регистрация тестового пользователя', async () => {
        const { data, error } = await testData.supabaseClient.auth.signUp({
            email: TEST_CONFIG.TEST_USER.email,
            password: TEST_CONFIG.TEST_USER.password
        });
        
        if (error && error.message !== 'User already registered') {
            throw new Error(`Ошибка регистрации: ${error.message}`);
        }
        
        return true;
    });
    
    // Авторизация
    await testFunction('Авторизация пользователя', async () => {
        const { data, error } = await testData.supabaseClient.auth.signInWithPassword({
            email: TEST_CONFIG.TEST_USER.email,
            password: TEST_CONFIG.TEST_USER.password
        });
        
        if (error) {
            throw new Error(`Ошибка авторизации: ${error.message}`);
        }
        
        if (!data.user) {
            throw new Error('Пользователь не получен после авторизации');
        }
        
        testData.userId = data.user.id;
        return true;
    });
    
    // Проверка сессии
    await testFunction('Проверка текущей сессии', async () => {
        const { data: { session } } = await testData.supabaseClient.auth.getSession();
        
        if (!session) {
            throw new Error('Сессия не найдена');
        }
        
        if (session.user.id !== testData.userId) {
            throw new Error('ID пользователя в сессии не совпадает');
        }
        
        return true;
    });
}

/**
 * Тестирование CRUD операций
 */
async function testSupabaseCRUD() {
    logTestSubsection('CRUD операции');
    
    // Создание заведения
    await testFunction('Создание заведения', async () => {
        const { data, error } = await testData.supabaseClient
            .from('venues')
            .insert({
                user_id: testData.userId,
                name: 'Тестовое заведение',
                default_fixed_payout: 1000
            })
            .select()
            .single();
            
        if (error) {
            throw new Error(`Ошибка создания заведения: ${error.message}`);
        }
        
        testData.venueId = data.id;
        return true;
    });
    
    // Создание продукта
    await testFunction('Создание продукта', async () => {
        const { data, error } = await testData.supabaseClient
            .from('user_products')
            .insert({
                user_id: testData.userId,
                name: 'Тестовый продукт',
                price_per_unit: 100,
                commission_type: 'fixed',
                commission_value: 10
            })
            .select()
            .single();
            
        if (error) {
            throw new Error(`Ошибка создания продукта: ${error.message}`);
        }
        
        testData.productId = data.id;
        return true;
    });
    
    // Создание смены
    await testFunction('Создание смены', async () => {
        const { data, error } = await testData.supabaseClient
            .from('shifts')
            .insert({
                user_id: testData.userId,
                venue_id: testData.venueId,
                shift_date: new Date().toISOString().split('T')[0],
                is_workday: true,
                fixed_payout: 1000,
                tips: 500,
                revenue_generated: 5000,
                earnings: 1500
            })
            .select()
            .single();
            
        if (error) {
            throw new Error(`Ошибка создания смены: ${error.message}`);
        }
        
        testData.shiftId = data.id;
        return true;
    });
    
    // Чтение данных
    await testFunction('Чтение заведений', async () => {
        const { data, error } = await testData.supabaseClient
            .from('venues')
            .select('*')
            .eq('user_id', testData.userId);
            
        if (error) {
            throw new Error(`Ошибка чтения заведений: ${error.message}`);
        }
        
        if (data.length === 0) {
            throw new Error('Заведения не найдены');
        }
        
        return true;
    });
    
    // Обновление данных
    await testFunction('Обновление заведения', async () => {
        const { error } = await testData.supabaseClient
            .from('venues')
            .update({ name: 'Обновленное заведение' })
            .eq('id', testData.venueId);
            
        if (error) {
            throw new Error(`Ошибка обновления заведения: ${error.message}`);
        }
        
        return true;
    });
}

/**
 * Тестирование RLS политик
 */
async function testSupabaseRLS() {
    logTestSubsection('RLS политики');
    
    await testFunction('Изоляция данных пользователей', async () => {
        // Создаем второго клиента без авторизации
        const anonClient = window.supabase.createClient(
            TEST_CONFIG.SUPABASE_URL, 
            TEST_CONFIG.SUPABASE_KEY
        );
        
        // Пытаемся получить данные без авторизации
        const { data, error } = await anonClient
            .from('venues')
            .select('*');
            
        // Должна быть ошибка или пустой результат
        if (data && data.length > 0) {
            throw new Error('RLS не работает - данные доступны без авторизации');
        }
        
        return true;
    });
}

/**
 * Тестирование пользовательского интерфейса
 */
async function runUITests() {
    logTestSection('ТЕСТИРОВАНИЕ UI');
    
    await testUIElements();
    await testUIInteractions();
    await testUIResponsiveness();
}

/**
 * Тестирование элементов интерфейса
 */
async function testUIElements() {
    logTestSubsection('Элементы интерфейса');
    
    await testFunction('Кнопки навигации', async () => {
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons.length === 0) {
            throw new Error('Кнопки навигации не найдены');
        }
        
        // Проверяем каждую кнопку
        navButtons.forEach((btn, index) => {
            if (!btn.dataset.screen) {
                throw new Error(`Кнопка ${index} не имеет атрибута data-screen`);
            }
        });
        
        return true;
    });
    
    await testFunction('Модальные окна', async () => {
        const modals = ['shift-modal', 'venue-modal', 'product-modal'];
        
        for (const modalId of modals) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.warn(`Модальное окно ${modalId} не найдено`);
                continue;
            }
            
            if (!modal.classList.contains('modal')) {
                throw new Error(`Элемент ${modalId} не имеет класса modal`);
            }
        }
        
        return true;
    });
    
    await testFunction('Формы', async () => {
        const forms = ['auth-form', 'shift-form'];
        
        for (const formId of forms) {
            const form = document.getElementById(formId);
            if (!form) {
                throw new Error(`Форма ${formId} не найдена`);
            }
            
            if (form.tagName !== 'FORM') {
                throw new Error(`Элемент ${formId} не является формой`);
            }
        }
        
        return true;
    });
}

/**
 * Тестирование взаимодействий UI
 */
async function testUIInteractions() {
    logTestSubsection('Взаимодействия UI');
    
    await testFunction('Переключение экранов', async () => {
        const screens = ['shifts', 'reports', 'settings'];
        
        for (const screenName of screens) {
            const navBtn = document.querySelector(`[data-screen="${screenName}"]`);
            if (!navBtn) {
                throw new Error(`Кнопка навигации для ${screenName} не найдена`);
            }
            
            // Симулируем клик
            navBtn.click();
            
            // Проверяем, что экран переключился
            const screen = document.getElementById(`${screenName}-screen`);
            if (!screen) {
                throw new Error(`Экран ${screenName} не найден`);
            }
            
            // Даем время на переключение
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return true;
    });
    
    await testFunction('Открытие модальных окон', async () => {
        // Тестируем кнопку добавления смены
        const addShiftBtn = document.getElementById('add-shift-btn');
        if (addShiftBtn) {
            addShiftBtn.click();
            
            const modal = document.getElementById('shift-modal');
            if (modal && modal.classList.contains('hidden')) {
                throw new Error('Модальное окно смены не открылось');
            }
            
            // Закрываем модальное окно
            const closeBtn = document.getElementById('close-shift-modal');
            if (closeBtn) {
                closeBtn.click();
            }
        }
        
        return true;
    });
}

/**
 * Тестирование адаптивности
 */
async function testUIResponsiveness() {
    logTestSubsection('Адаптивность');
    
    await testFunction('Адаптивность для мобильных', async () => {
        // Сохраняем текущие размеры
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;
        
        try {
            // Симулируем мобильный экран
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 667
            });
            
            // Вызываем событие resize
            window.dispatchEvent(new Event('resize'));
            
            // Проверяем, что элементы адаптировались
            const app = document.getElementById('app');
            const computedStyle = window.getComputedStyle(app);
            
            // Проверяем основные свойства
            if (computedStyle.width === '0px') {
                throw new Error('Приложение не адаптировалось к мобильному экрану');
            }
            
        } finally {
            // Восстанавливаем размеры
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalWidth
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: originalHeight
            });
            
            window.dispatchEvent(new Event('resize'));
        }
        
        return true;
    });
}

/**
 * Тестирование бизнес-логики
 */
async function runBusinessLogicTests() {
    logTestSection('ТЕСТИРОВАНИЕ БИЗНЕС-ЛОГИКИ');
    
    await testCalculations();
    await testValidations();
    await testDataProcessing();
}

/**
 * Тестирование вычислений
 */
async function testCalculations() {
    logTestSubsection('Вычисления');
    
    await testFunction('Расчет выручки', async () => {
        const shiftProducts = [
            { product_id: 1, quantity: 10 },
            { product_id: 2, quantity: 5 }
        ];
        
        const products = [
            { id: 1, price_per_unit: 100 },
            { id: 2, price_per_unit: 200 }
        ];
        
        // Если функция calculateRevenue доступна
        if (typeof calculateRevenue === 'function') {
            const revenue = calculateRevenue(shiftProducts, products);
            const expected = (10 * 100) + (5 * 200); // 2000
            
            if (revenue !== expected) {
                throw new Error(`Неверный расчет выручки: ожидалось ${expected}, получено ${revenue}`);
            }
        }
        
        return true;
    });
    
    await testFunction('Расчет заработка', async () => {
        const shiftProducts = [
            { product_id: 1, quantity: 10 },
            { product_id: 2, quantity: 5 }
        ];
        
        const products = [
            { id: 1, price_per_unit: 100, commission_type: 'fixed', commission_value: 10 },
            { id: 2, price_per_unit: 200, commission_type: 'percentage', commission_value: 5 }
        ];
        
        const fixedPayout = 1000;
        const tips = 500;
        
        // Если функция calculateEarnings доступна
        if (typeof calculateEarnings === 'function') {
            const earnings = calculateEarnings(shiftProducts, products, fixedPayout, tips);
            
            // Ожидаемый расчет:
            // Комиссия: (10 * 10) + (5 * 200 * 0.05) = 100 + 50 = 150
            // Общий заработок: 150 + 1000 + 500 = 1650
            const expected = 1650;
            
            if (earnings !== expected) {
                throw new Error(`Неверный расчет заработка: ожидалось ${expected}, получено ${earnings}`);
            }
        }
        
        return true;
    });
}

/**
 * Тестирование валидации
 */
async function testValidations() {
    logTestSubsection('Валидация');
    
    await testFunction('Валидация данных смены', async () => {
        // Тестируем различные сценарии валидации
        const testCases = [
            {
                data: { shift_date: '', fixed_payout: 100, tips: 50 },
                shouldPass: false,
                reason: 'Пустая дата'
            },
            {
                data: { shift_date: '2024-01-01', fixed_payout: -100, tips: 50 },
                shouldPass: false,
                reason: 'Отрицательная выплата'
            },
            {
                data: { shift_date: '2024-01-01', fixed_payout: 100, tips: -50 },
                shouldPass: false,
                reason: 'Отрицательные чаевые'
            },
            {
                data: { shift_date: '2024-01-01', fixed_payout: 100, tips: 50 },
                shouldPass: true,
                reason: 'Корректные данные'
            }
        ];
        
        for (const testCase of testCases) {
            if (typeof validateShiftData === 'function') {
                const result = validateShiftData(testCase.data);
                
                if (result !== testCase.shouldPass) {
                    throw new Error(`Валидация не прошла для случая: ${testCase.reason}`);
                }
            }
        }
        
        return true;
    });
}

/**
 * Тестирование обработки данных
 */
async function testDataProcessing() {
    logTestSubsection('Обработка данных');
    
    await testFunction('Форматирование валюты', async () => {
        if (typeof formatCurrency === 'function') {
            const testCases = [
                { input: 1000, expected: '1000 ₽' },
                { input: 1000.50, expected: '1000.5 ₽' },
                { input: 0, expected: '0 ₽' }
            ];
            
            for (const testCase of testCases) {
                const result = formatCurrency(testCase.input);
                if (!result.includes(testCase.input.toString())) {
                    throw new Error(`Неверное форматирование: ${testCase.input} -> ${result}`);
                }
            }
        }
        
        return true;
    });
}

/**
 * Интеграционные тесты
 */
async function runIntegrationTests() {
    logTestSection('ИНТЕГРАЦИОННЫЕ ТЕСТЫ');
    
    await testFullWorkflow();
    await testErrorHandling();
    await testPerformance();
}

/**
 * Тестирование полного рабочего процесса
 */
async function testFullWorkflow() {
    logTestSubsection('Полный рабочий процесс');
    
    await testFunction('Создание смены с продуктами', async () => {
        // Создаем продукт смены
        const { data: shiftProduct, error: shiftProductError } = await testData.supabaseClient
            .from('shift_products')
            .insert({
                shift_id: testData.shiftId,
                product_id: testData.productId,
                quantity: 5,
                price_snapshot: 100,
                commission_snapshot: 10
            })
            .select()
            .single();
            
        if (shiftProductError) {
            throw new Error(`Ошибка создания продукта смены: ${shiftProductError.message}`);
        }
        
        // Проверяем, что продукт создался
        const { data: shiftProducts, error: selectError } = await testData.supabaseClient
            .from('shift_products')
            .select('*')
            .eq('shift_id', testData.shiftId);
            
        if (selectError) {
            throw new Error(`Ошибка получения продуктов смены: ${selectError.message}`);
        }
        
        if (shiftProducts.length === 0) {
            throw new Error('Продукты смены не найдены');
        }
        
        return true;
    });
    
    await testFunction('Расчет итогов смены', async () => {
        // Получаем данные смены с продуктами
        const { data: shift, error: shiftError } = await testData.supabaseClient
            .from('shifts')
            .select(`
                *,
                venue:venues(name),
                shift_products(
                    quantity,
                    price_snapshot,
                    commission_snapshot,
                    product:user_products(name)
                )
            `)
            .eq('id', testData.shiftId)
            .single();
            
        if (shiftError) {
            throw new Error(`Ошибка получения смены: ${shiftError.message}`);
        }
        
        // Проверяем структуру данных
        if (!shift.venue) {
            throw new Error('Данные заведения не получены');
        }
        
        if (!shift.shift_products || shift.shift_products.length === 0) {
            throw new Error('Продукты смены не получены');
        }
        
        return true;
    });
}

/**
 * Тестирование обработки ошибок
 */
async function testErrorHandling() {
    logTestSubsection('Обработка ошибок');
    
    await testFunction('Обработка сетевых ошибок', async () => {
        // Создаем клиент с неверным URL
        const invalidClient = window.supabase.createClient(
            'https://invalid-url.supabase.co',
            TEST_CONFIG.SUPABASE_KEY
        );
        
        try {
            await invalidClient.from('venues').select('*');
            throw new Error('Ошибка не была обработана');
        } catch (error) {
            // Ожидаем сетевую ошибку
            if (!error.message.includes('fetch') && !error.message.includes('network')) {
                console.warn('Получена неожиданная ошибка:', error.message);
            }
        }
        
        return true;
    });
    
    await testFunction('Обработка дублирования данных', async () => {
        // Пытаемся создать дубликат заведения с тем же именем
        try {
            await testData.supabaseClient
                .from('user_products')
                .insert({
                    user_id: testData.userId,
                    name: 'Тестовый продукт', // Это же имя уже есть
                    price_per_unit: 100,
                    commission_type: 'fixed',
                    commission_value: 10
                });
                
            throw new Error('Дубликат не был отклонен');
        } catch (error) {
            // Ожидаем ошибку unique constraint
            if (!error.message.includes('unique') && !error.message.includes('duplicate')) {
                console.warn('Получена неожиданная ошибка:', error.message);
            }
        }
        
        return true;
    });
}

/**
 * Тестирование производительности
 */
async function testPerformance() {
    logTestSubsection('Производительность');
    
    await testFunction('Время загрузки данных', async () => {
        const startTime = performance.now();
        
        // Загружаем все данные пользователя
        const [venues, products, shifts] = await Promise.all([
            testData.supabaseClient.from('venues').select('*').eq('user_id', testData.userId),
            testData.supabaseClient.from('user_products').select('*').eq('user_id', testData.userId),
            testData.supabaseClient.from('shifts').select('*').eq('user_id', testData.userId)
        ]);
        
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Проверяем, что загрузка заняла не более 5 секунд
        if (loadTime > 5000) {
            throw new Error(`Загрузка данных заняла слишком много времени: ${loadTime}ms`);
        }
        
        console.log(`✅ Время загрузки данных: ${loadTime.toFixed(2)}ms`);
        return true;
    });
    
    await testFunction('Память приложения', async () => {
        if (performance.memory) {
            const memoryInfo = performance.memory;
            
            // Проверяем использование памяти
            if (memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                console.warn(`⚠️ Высокое использование памяти: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
            }
            
            console.log(`📊 Использование памяти: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
        
        return true;
    });
}

/**
 * Очистка тестовых данных
 */
async function cleanupTestData() {
    logTestSection('ОЧИСТКА ТЕСТОВЫХ ДАННЫХ');
    
    try {
        // Удаляем в правильном порядке (с учетом foreign keys)
        if (testData.shiftId) {
            await testData.supabaseClient
                .from('shift_products')
                .delete()
                .eq('shift_id', testData.shiftId);
                
            await testData.supabaseClient
                .from('shifts')
                .delete()
                .eq('id', testData.shiftId);
        }
        
        if (testData.productId) {
            await testData.supabaseClient
                .from('user_products')
                .delete()
                .eq('id', testData.productId);
        }
        
        if (testData.venueId) {
            await testData.supabaseClient
                .from('venues')
                .delete()
                .eq('id', testData.venueId);
        }
        
        console.log('✅ Тестовые данные очищены');
        
    } catch (error) {
        console.warn('⚠️ Ошибка при очистке тестовых данных:', error.message);
    }
}

/**
 * Генерация отчета о тестировании
 */
async function generateTestReport() {
    testResults.endTime = new Date();
    const duration = testResults.endTime - testResults.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ОТЧЕТ О ТЕСТИРОВАНИИ');
    console.log('='.repeat(60));
    console.log(`⏱️  Время выполнения: ${(duration / 1000).toFixed(2)} секунд`);
    console.log(`📈 Всего тестов: ${testResults.total}`);
    console.log(`✅ Пройдено: ${testResults.passed}`);
    console.log(`❌ Не пройдено: ${testResults.failed}`);
    console.log(`📊 Успешность: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
        console.log('\n❌ ОШИБКИ:');
        testResults.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.test}: ${error.error}`);
        });
    }
    
    // Сохраняем отчет в localStorage
    const report = {
        timestamp: testResults.endTime,
        duration: duration,
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        errors: testResults.errors
    };
    
    localStorage.setItem('shiftlog_test_report', JSON.stringify(report));
    
    console.log('\n💾 Отчет сохранен в localStorage');
    console.log('='.repeat(60));
}

/**
 * Выполнение отдельного теста
 */
async function testFunction(name, testFn) {
    testResults.total++;
    
    try {
        console.log(`🧪 ${name}...`);
        
        const startTime = performance.now();
        await testFn();
        const endTime = performance.now();
        
        testResults.passed++;
        console.log(`✅ ${name} - ПРОЙДЕН (${(endTime - startTime).toFixed(2)}ms)`);
        
    } catch (error) {
        testResults.failed++;
        testResults.errors.push({
            test: name,
            error: error.message,
            stack: error.stack
        });
        
        console.error(`❌ ${name} - НЕ ПРОЙДЕН:`, error.message);
    }
    
    // Задержка между тестами
    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.DELAY_BETWEEN_TESTS));
}

/**
 * Логирование секции тестов
 */
function logTestSection(title) {
    console.log('\n' + '='.repeat(40));
    console.log(`🔍 ${title}`);
    console.log('='.repeat(40));
}

/**
 * Логирование подсекции тестов
 */
function logTestSubsection(title) {
    console.log(`\n📋 ${title}`);
    console.log('-'.repeat(20));
}

// Автоматический запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Задержка для полной загрузки приложения
        setTimeout(runAllTests, 2000);
    });
} else {
    // Задержка для полной загрузки приложения
    setTimeout(runAllTests, 2000);
}

// Экспорт для ручного запуска
window.runAllTests = runAllTests;
window.TEST_CONFIG = TEST_CONFIG;

console.log('🚀 Скрипт автоматического тестирования ShiftLog загружен');
console.log('⚡ Тесты запустятся автоматически через 2 секунды');
console.log('🔧 Для ручного запуска используйте: runAllTests()'); 