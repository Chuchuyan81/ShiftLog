// Конфигурация Supabase - ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ
const SUPABASE_URL = 'Yhttps://ukuhwaulkvpqkwqbqqag.supabase.co'; // https://your-project-id.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWh3YXVsa3ZwcWt3cWJxcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDUzMDgsImV4cCI6MjA2NjQyMTMwOH0.dzSK4aP-QB8QjkZ_JrTc-DHEehLwce2Y2leK_VslBqY'; // ваш anon ключ из Settings > API

// Создаем клиент Supabase (пользователь должен заменить на свои данные)
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    // Проверяем наличие Supabase
    if (!supabase) {
        showMessage('Ошибка', 'Не удалось подключиться к базе данных. Настройте Supabase.');
        return;
    }

    // Проверяем текущую сессию
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await loadUserData();
        showMainApp();
    } else {
        showAuthScreen();
    }

    hideLoading();
    setupEventListeners();
}

// Показать/скрыть экраны
function showLoading() {
    document.getElementById('loading-screen').classList.remove('hidden');
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading-screen').classList.add('hidden');
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    updateMonthDisplay();
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
    document.getElementById('add-shift-btn').addEventListener('click', openShiftModal);
    
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
    document.getElementById('add-venue-btn').addEventListener('click', openVenueModal);
    document.getElementById('venue-form').addEventListener('submit', handleVenueSubmit);
    
    // Позиции
    document.getElementById('add-product-btn').addEventListener('click', openProductModal);
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    
    // Тип комиссии
    document.getElementById('commission-type').addEventListener('change', updateCommissionLabel);
    
    // Валюта
    document.getElementById('currency-select').addEventListener('change', (e) => {
        currency = e.target.value;
        localStorage.setItem('currency', currency);
        updateCurrencyDisplay();
    });
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
    
    // Закрытие по клику вне модального окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
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

// Загрузка данных пользователя
async function loadUserData() {
    currency = localStorage.getItem('currency') || '₽';
    document.getElementById('currency-select').value = currency;
    
    await Promise.all([
        loadVenues(),
        loadProducts(),
        loadShifts()
    ]);
}

async function loadVenues() {
    try {
        const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('name');
        
        if (error) throw error;
        venues = data || [];
        updateVenueSelects();
        renderVenuesList();
    } catch (error) {
        console.error('Ошибка загрузки заведений:', error);
    }
}

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('user_products')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('name');
        
        if (error) throw error;
        products = data || [];
        renderProductsList();
        updateProductFields();
    } catch (error) {
        console.error('Ошибка загрузки позиций:', error);
    }
}

async function loadShifts() {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    try {
        const { data, error } = await supabase
            .from('shifts')
            .select(`
                *,
                venues(name),
                shift_products(
                    quantity,
                    price_snapshot,
                    commission_snapshot,
                    user_products(name)
                )
            `)
            .eq('user_id', currentUser.id)
            .gte('shift_date', startOfMonth.toISOString().split('T')[0])
            .lte('shift_date', endOfMonth.toISOString().split('T')[0])
            .order('shift_date');
        
        if (error) throw error;
        shifts = data || [];
        renderShiftsList();
    } catch (error) {
        console.error('Ошибка загрузки смен:', error);
    }
}

// Отображение данных
function updateMonthDisplay() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const monthText = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    document.getElementById('current-month').textContent = monthText;
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
    
    if (shifts.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;">Нет данных за выбранный месяц</div>';
        return;
    }
    
    shifts.forEach(shift => {
        const shiftElement = document.createElement('div');
        shiftElement.className = `shift-row ${!shift.is_workday ? 'holiday' : ''}`;
        shiftElement.onclick = () => editShift(shift);
        
        const date = new Date(shift.shift_date);
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        
        shiftElement.innerHTML = `
            <div class="table-cell">
                <div>
                    <div class="shift-date">${dayNames[date.getDay()]} ${date.getDate()}</div>
                    <div class="shift-venue">${shift.venues?.name || 'Не указано'}</div>
                </div>
            </div>
            <div class="table-cell shift-venue">${shift.venues?.name || 'Не указано'}</div>
            <div class="table-cell shift-amount">${formatCurrency(shift.revenue_generated)}</div>
            <div class="table-cell shift-amount">${formatCurrency(shift.earnings)}</div>
        `;
        
        container.appendChild(shiftElement);
    });
}

function renderVenuesList() {
    const container = document.getElementById('venues-list');
    container.innerHTML = '';
    
    venues.forEach(venue => {
        const venueElement = document.createElement('div');
        venueElement.className = 'list-item';
        venueElement.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${venue.name}</div>
                <div class="list-item-subtitle">Ставка: ${formatCurrency(venue.default_fixed_payout)}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary" onclick="editVenue('${venue.id}')">Изменить</button>
                <button class="btn btn-danger" onclick="confirmDeleteVenue('${venue.id}')">Удалить</button>
            </div>
        `;
        container.appendChild(venueElement);
    });
}

function renderProductsList() {
    const container = document.getElementById('products-list');
    container.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'list-item';
        
        const commissionText = product.commission_type === 'fixed' 
            ? formatCurrency(product.commission_value)
            : `${product.commission_value}%`;
            
        productElement.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${product.name}</div>
                <div class="list-item-subtitle">Цена: ${formatCurrency(product.price_per_unit)}, Комиссия: ${commissionText}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary" onclick="editProduct('${product.id}')">Изменить</button>
                <button class="btn btn-danger" onclick="confirmDeleteProduct('${product.id}')">Удалить</button>
            </div>
        `;
        container.appendChild(productElement);
    });
}

// Модальные окна для смен
function openShiftModal(shift = null) {
    editingShift = shift;
    const modal = document.getElementById('shift-modal');
    const title = document.getElementById('shift-modal-title');
    const deleteBtn = document.getElementById('delete-shift');
    
    if (shift) {
        title.textContent = 'Редактировать смену';
        deleteBtn.classList.remove('hidden');
        populateShiftForm(shift);
    } else {
        title.textContent = 'Добавить смену';
        deleteBtn.classList.add('hidden');
        resetShiftForm();
    }
    
    modal.classList.remove('hidden');
    updateProductFields();
}

function populateShiftForm(shift) {
    document.getElementById('shift-date').value = shift.shift_date;
    document.querySelector(`input[name="workday"][value="${shift.is_workday}"]`).checked = true;
    document.getElementById('shift-venue').value = shift.venue_id;
    document.getElementById('shift-payout').value = shift.fixed_payout;
    document.getElementById('shift-tips').value = shift.tips;
    
    toggleWorkFields();
    
    // Заполняем количества продуктов
    if (shift.shift_products) {
        shift.shift_products.forEach(sp => {
            const input = document.querySelector(`[data-product-id="${sp.user_products.id}"]`);
            if (input) {
                input.value = sp.quantity;
            }
        });
    }
    
    calculateShiftTotals();
}

function resetShiftForm() {
    document.getElementById('shift-form').reset();
    document.getElementById('shift-date').value = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="workday"][value="true"]').checked = true;
    toggleWorkFields();
    updateProductFields();
}

function toggleWorkFields() {
    const isWorkday = document.querySelector('input[name="workday"]:checked').value === 'true';
    const workFields = document.getElementById('work-fields');
    
    if (isWorkday) {
        workFields.style.display = 'block';
    } else {
        workFields.style.display = 'none';
        // Обнуляем поля при выборе выходного
        document.getElementById('shift-venue').value = '';
        document.getElementById('shift-payout').value = 0;
        document.getElementById('shift-tips').value = 0;
        document.querySelectorAll('#products-fields input').forEach(input => {
            input.value = 0;
        });
    }
    
    calculateShiftTotals();
}

function updateProductFields() {
    const container = document.getElementById('products-fields');
    container.innerHTML = '';
    
    products.forEach(product => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'form-group';
        fieldGroup.innerHTML = `
            <label>${product.name}:</label>
            <input type="number" data-product-id="${product.id}" min="0" step="1" value="0" oninput="calculateShiftTotals()">
        `;
        container.appendChild(fieldGroup);
    });
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
    
    // Автозаполнение ставки при выборе заведения
    select.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption.dataset.payout) {
            document.getElementById('shift-payout').value = selectedOption.dataset.payout;
            calculateShiftTotals();
        }
    });
}

function calculateShiftTotals() {
    const isWorkday = document.querySelector('input[name="workday"]:checked').value === 'true';
    
    if (!isWorkday) {
        document.getElementById('shift-revenue').value = formatCurrency(0);
        document.getElementById('shift-earnings').value = formatCurrency(0);
        return;
    }
    
    let revenue = 0;
    let earnings = 0;
    
    // Расчет по продуктам
    products.forEach(product => {
        const input = document.querySelector(`[data-product-id="${product.id}"]`);
        if (input) {
            const quantity = parseInt(input.value) || 0;
            revenue += quantity * product.price_per_unit;
            
            const commission = product.commission_type === 'fixed' 
                ? product.commission_value
                : product.price_per_unit * (product.commission_value / 100);
            earnings += quantity * commission;
        }
    });
    
    // Добавляем фиксированную ставку и чаевые
    const payout = parseFloat(document.getElementById('shift-payout').value) || 0;
    const tips = parseFloat(document.getElementById('shift-tips').value) || 0;
    earnings += payout + tips;
    
    document.getElementById('shift-revenue').value = formatCurrency(revenue);
    document.getElementById('shift-earnings').value = formatCurrency(earnings);
}

async function handleShiftSubmit(e) {
    e.preventDefault();
    
    const shiftData = {
        user_id: currentUser.id,
        shift_date: document.getElementById('shift-date').value,
        is_workday: document.querySelector('input[name="workday"]:checked').value === 'true',
        venue_id: document.getElementById('shift-venue').value || null,
        fixed_payout: parseFloat(document.getElementById('shift-payout').value) || 0,
        tips: parseFloat(document.getElementById('shift-tips').value) || 0
    };
    
    // Рассчитываем итоги
    let revenue = 0;
    let earnings = shiftData.fixed_payout + shiftData.tips;
    const shiftProducts = [];
    
    if (shiftData.is_workday) {
        products.forEach(product => {
            const input = document.querySelector(`[data-product-id="${product.id}"]`);
            const quantity = parseInt(input?.value) || 0;
            
            if (quantity > 0) {
                revenue += quantity * product.price_per_unit;
                
                const commission = product.commission_type === 'fixed' 
                    ? product.commission_value
                    : product.price_per_unit * (product.commission_value / 100);
                earnings += quantity * commission;
                
                shiftProducts.push({
                    product_id: product.id,
                    quantity: quantity,
                    price_snapshot: product.price_per_unit,
                    commission_snapshot: commission
                });
            }
        });
    }
    
    shiftData.revenue_generated = revenue;
    shiftData.earnings = earnings;
    
    try {
        let shiftId;
        
        if (editingShift) {
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
            
            const { error } = await supabase
                .from('shift_products')
                .insert(shiftProductsData);
            
            if (error) throw error;
        }
        
        closeAllModals();
        await loadShifts();
        showMessage('Успех', editingShift ? 'Смена обновлена' : 'Смена добавлена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

function editShift(shift) {
    openShiftModal(shift);
}

async function deleteShift() {
    if (!editingShift) return;
    
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
    editingVenue = venue;
    const modal = document.getElementById('venue-modal');
    const title = document.getElementById('venue-modal-title');
    const deleteBtn = document.getElementById('delete-venue');
    
    if (venue) {
        title.textContent = 'Редактировать заведение';
        deleteBtn.classList.remove('hidden');
        document.getElementById('venue-name').value = venue.name;
        document.getElementById('venue-payout').value = venue.default_fixed_payout;
    } else {
        title.textContent = 'Добавить заведение';
        deleteBtn.classList.add('hidden');
        document.getElementById('venue-form').reset();
    }
    
    modal.classList.remove('hidden');
}

function editVenue(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
        openVenueModal(venue);
    }
}

async function handleVenueSubmit(e) {
    e.preventDefault();
    
    const venueData = {
        user_id: currentUser.id,
        name: document.getElementById('venue-name').value,
        default_fixed_payout: parseFloat(document.getElementById('venue-payout').value) || 0
    };
    
    try {
        if (editingVenue) {
            const { error } = await supabase
                .from('venues')
                .update(venueData)
                .eq('id', editingVenue.id);
            
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('venues')
                .insert(venueData);
            
            if (error) throw error;
        }
        
        closeAllModals();
        await loadVenues();
        showMessage('Успех', editingVenue ? 'Заведение обновлено' : 'Заведение добавлено');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

function confirmDeleteVenue(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (venue && confirm(`Удалить заведение "${venue.name}"?`)) {
        deleteVenueById(venueId);
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
        showMessage('Успех', 'Заведение удалено');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

async function deleteVenue() {
    if (!editingVenue) return;
    
    try {
        const { error } = await supabase
            .from('venues')
            .delete()
            .eq('id', editingVenue.id);
        
        if (error) throw error;
        
        closeAllModals();
        await loadVenues();
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
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
    }
}

function updateCommissionLabel() {
    const type = document.getElementById('commission-type').value;
    const label = document.getElementById('commission-label');
    label.textContent = type === 'fixed' ? 'Сумма комиссии:' : 'Процент комиссии:';
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        user_id: currentUser.id,
        name: document.getElementById('product-name').value,
        price_per_unit: parseFloat(document.getElementById('product-price').value),
        commission_type: document.getElementById('commission-type').value,
        commission_value: parseFloat(document.getElementById('commission-value').value)
    };
    
    try {
        if (editingProduct) {
            const { error } = await supabase
                .from('user_products')
                .update(productData)
                .eq('id', editingProduct.id);
            
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('user_products')
                .insert(productData);
            
            if (error) throw error;
        }
        
        closeAllModals();
        await loadProducts();
        showMessage('Успех', editingProduct ? 'Позиция обновлена' : 'Позиция добавлена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

function confirmDeleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product && confirm(`Удалить позицию "${product.name}"?`)) {
        deleteProductById(productId);
    }
}

async function deleteProductById(productId) {
    try {
        const { error } = await supabase
            .from('user_products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        await loadProducts();
        showMessage('Успех', 'Позиция удалена');
        
    } catch (error) {
        showMessage('Ошибка', error.message);
    }
}

async function deleteProduct() {
    if (!editingProduct) return;
    
    try {
        const { error } = await supabase
            .from('user_products')
            .delete()
            .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        closeAllModals();
        await loadProducts();
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
                    const productName = sp.user_products?.name || 'Неизвестно';
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
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    editingShift = null;
    editingVenue = null;
    editingProduct = null;
}

function showMessage(title, text) {
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = text;
    document.getElementById('message-modal').classList.remove('hidden');
}

// Настройка слушателей изменения аутентификации
if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            await loadUserData();
            showMainApp();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            venues = [];
            products = [];
            shifts = [];
            showAuthScreen();
        }
    });
} 