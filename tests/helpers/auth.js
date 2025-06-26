const { expect } = require('@playwright/test');

// Учетные данные для тестирования
const TEST_CREDENTIALS = {
  email: 'chuchuyan81@gmail.com',
  password: '123456'
};

/**
 * Авторизация пользователя в приложении
 * @param {import('@playwright/test').Page} page - Страница браузера
 */
async function loginUser(page) {
  console.log('🔐 Начинаем авторизацию пользователя...');
  
  // Ждем загрузки приложения
  await page.waitForSelector('#loading-screen', { state: 'visible' });
  await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
  
  // Проверяем, что отображается экран авторизации
  await expect(page.locator('#auth-screen')).toBeVisible();
  
  // Убеждаемся, что активна вкладка "Вход"
  const loginTab = page.locator('[data-tab="login"]');
  await expect(loginTab).toHaveClass(/active/);
  
  // Заполняем форму авторизации
  await page.fill('#email', TEST_CREDENTIALS.email);
  await page.fill('#password', TEST_CREDENTIALS.password);
  
  // Нажимаем кнопку "Войти"
  await page.click('button[type="submit"]');
  
  // Ждем успешной авторизации (переход к главному экрану)
  await page.waitForSelector('#main-app', { state: 'visible', timeout: 15000 });
  await expect(page.locator('#auth-screen')).toBeHidden();
  
  console.log('✅ Авторизация выполнена успешно');
}

/**
 * Выход из системы
 * @param {import('@playwright/test').Page} page - Страница браузера
 */
async function logoutUser(page) {
  console.log('🚪 Выходим из системы...');
  
  // Переходим в настройки
  await page.click('[data-screen="settings"]');
  await page.waitForSelector('#settings-screen', { state: 'visible' });
  
  // Нажимаем кнопку выхода
  await page.click('#logout-btn');
  
  // Ждем перехода к экрану авторизации
  await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });
  await expect(page.locator('#main-app')).toBeHidden();
  
  console.log('✅ Выход выполнен успешно');
}

/**
 * Проверка, что пользователь авторизован
 * @param {import('@playwright/test').Page} page - Страница браузера
 */
async function expectUserLoggedIn(page) {
  await expect(page.locator('#main-app')).toBeVisible();
  await expect(page.locator('#auth-screen')).toBeHidden();
  await expect(page.locator('.nav-bar')).toBeVisible();
}

/**
 * Проверка, что пользователь не авторизован
 * @param {import('@playwright/test').Page} page - Страница браузера
 */
async function expectUserLoggedOut(page) {
  await expect(page.locator('#auth-screen')).toBeVisible();
  await expect(page.locator('#main-app')).toBeHidden();
}

module.exports = {
  TEST_CREDENTIALS,
  loginUser,
  logoutUser,
  expectUserLoggedIn,
  expectUserLoggedOut
}; 