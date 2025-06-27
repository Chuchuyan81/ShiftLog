const { test, expect } = require('@playwright/test');
const { loginUser, logoutUser, expectUserLoggedIn, expectUserLoggedOut, TEST_CREDENTIALS } = require('./helpers/auth');

test.describe('Тестирование авторизации', () => {
  
  test.beforeEach(async ({ page }) => {
    // Переходим к приложению
    await page.goto('/');
  });

  test('Успешная авторизация с корректными данными', async ({ page }) => {
    console.log('🧪 Тест: Успешная авторизация');
    
    // Выполняем авторизацию
    await loginUser(page);
    
    // Проверяем, что пользователь авторизован
    await expectUserLoggedIn(page);
    
    // Проверяем, что отображается навигация
    await expect(page.locator('.nav-btn[data-screen="shifts"]')).toBeVisible();
    await expect(page.locator('.nav-btn[data-screen="reports"]')).toBeVisible();
    await expect(page.locator('.nav-btn[data-screen="settings"]')).toBeVisible();
    
    // Проверяем активную вкладку (должна быть "Журнал")
    await expect(page.locator('.nav-btn[data-screen="shifts"]')).toHaveClass(/active/);
  });

  test('Авторизация с неверным email', async ({ page }) => {
    console.log('🧪 Тест: Авторизация с неверным email');
    
    // Ждем загрузки и отображения экрана авторизации
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    await expect(page.locator('#auth-screen')).toBeVisible();
    
    // Заполняем форму с неверным email
    await page.fill('#email', 'invalid-email@nonexistent.com');
    await page.fill('#password', TEST_CREDENTIALS.password);
    
    // Нажимаем кнопку "Войти"
    await page.click('button[type="submit"]');
    
    // Ждем небольшую паузу для обработки ошибки
    await page.waitForTimeout(3000);
    
    // Проверяем, что пользователь остался на экране авторизации
    await expectUserLoggedOut(page);
    
    // Можем проверить наличие сообщения об ошибке, если оно отображается
    // (зависит от реализации в приложении)
  });

  test('Авторизация с неверным паролем', async ({ page }) => {
    console.log('🧪 Тест: Авторизация с неверным паролем');
    
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    await expect(page.locator('#auth-screen')).toBeVisible();
    
    // Заполняем форму с неверным паролем
    await page.fill('#email', TEST_CREDENTIALS.email);
    await page.fill('#password', 'wrong-password');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Проверяем, что пользователь остался на экране авторизации
    await expectUserLoggedOut(page);
  });

  test('Переключение между вкладками Вход/Регистрация', async ({ page }) => {
    console.log('🧪 Тест: Переключение вкладок авторизации');
    
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    await expect(page.locator('#auth-screen')).toBeVisible();
    
    // По умолчанию должна быть активна вкладка "Вход"
    await expect(page.locator('[data-tab="login"]')).toHaveClass(/active/);
    await expect(page.locator('#confirm-password-group')).toHaveClass(/hidden/);
    
    // Переключаемся на "Регистрацию"
    await page.click('[data-tab="register"]');
    
    // Проверяем изменения
    await expect(page.locator('[data-tab="register"]')).toHaveClass(/active/);
    await expect(page.locator('[data-tab="login"]')).not.toHaveClass(/active/);
    await expect(page.locator('#confirm-password-group')).not.toHaveClass(/hidden/);
    
    // Проверяем текст кнопки
    await expect(page.locator('#auth-form button[type="submit"]')).toHaveText('Зарегистрироваться');
    
    // Переключаемся обратно на "Вход"
    await page.click('[data-tab="login"]');
    
    await expect(page.locator('[data-tab="login"]')).toHaveClass(/active/);
    await expect(page.locator('#confirm-password-group')).toHaveClass(/hidden/);
    await expect(page.locator('#auth-form button[type="submit"]')).toHaveText('Войти');
  });

  test('Выход из системы', async ({ page }) => {
    console.log('🧪 Тест: Выход из системы');
    
    // Сначала авторизуемся
    await loginUser(page);
    await expectUserLoggedIn(page);
    
    // Выходим из системы
    await logoutUser(page);
    
    // Проверяем, что вернулись к экрану авторизации
    await expectUserLoggedOut(page);
    
    // Проверяем, что форма очищена (опционально)
    await expect(page.locator('#email')).toHaveValue('');
    await expect(page.locator('#password')).toHaveValue('');
  });

  test('Валидация пустых полей', async ({ page }) => {
    console.log('🧪 Тест: Валидация пустых полей');
    
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    await expect(page.locator('#auth-screen')).toBeVisible();
    
    // Пытаемся войти с пустыми полями
    await page.click('button[type="submit"]');
    
    // Проверяем HTML5 валидацию
    const emailField = page.locator('#email');
    const passwordField = page.locator('#password');
    
    // Поля должны иметь атрибут required
    await expect(emailField).toHaveAttribute('required');
    await expect(passwordField).toHaveAttribute('required');
    
    // Пользователь должен остаться на экране авторизации
    await expectUserLoggedOut(page);
  });

  test('Валидация email формата', async ({ page }) => {
    console.log('🧪 Тест: Валидация формата email');
    
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    
    // Вводим невалидный email
    await page.fill('#email', 'invalid-email-format');
    await page.fill('#password', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Проверяем HTML5 валидацию email
    const emailField = page.locator('#email');
    await expect(emailField).toHaveAttribute('type', 'email');
    
    // Пользователь должен остаться на экране авторизации
    await expectUserLoggedOut(page);
  });

  test('Загрузка приложения и отображение экрана авторизации', async ({ page }) => {
    console.log('🧪 Тест: Базовая загрузка приложения');
    
    // Проверяем последовательность загрузки
    await expect(page.locator('#loading-screen')).toBeVisible();
    
    // Ждем скрытия экрана загрузки
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    
    // Проверяем отображение экрана авторизации
    await expectUserLoggedOut(page);
    
    // Проверяем наличие основных элементов
    await expect(page.locator('h1')).toHaveText('Журнал Рабочих Смен');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('#forgot-password-btn')).toBeVisible();
  });
}); 