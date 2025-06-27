const { test, expect } = require('@playwright/test');
const { loginUser, logoutUser } = require('./helpers/auth');

test.describe('🚀 Быстрая демонстрация автоматического тестирования', () => {
  
  test('Полный цикл: авторизация → навигация → выход', async ({ page }) => {
    console.log('🎯 Демо-тест: Проверяем основные функции приложения');
    
    // 1. Переходим к приложению
    console.log('1️⃣ Открываем приложение...');
    await page.goto('/');
    
    // 2. Авторизуемся
    console.log('2️⃣ Выполняем авторизацию...');
    await loginUser(page);
    
    // 3. Проверяем, что попали в главное приложение
    console.log('3️⃣ Проверяем успешную авторизацию...');
    await expect(page.locator('#main-app')).toBeVisible();
    await expect(page.locator('.nav-bar')).toBeVisible();
    
    // 4. Проверяем навигацию между экранами
    console.log('4️⃣ Тестируем навигацию...');
    
    // Журнал смен (должен быть активен по умолчанию)
    await expect(page.locator('.nav-btn[data-screen="shifts"]')).toHaveClass(/active/);
    await expect(page.locator('#shifts-screen')).toBeVisible();
    
    // Переходим к отчетам
    await page.click('[data-screen="reports"]');
    await expect(page.locator('#reports-screen')).toBeVisible();
    await expect(page.locator('.nav-btn[data-screen="reports"]')).toHaveClass(/active/);
    
    // Переходим к настройкам
    await page.click('[data-screen="settings"]');
    await expect(page.locator('#settings-screen')).toBeVisible();
    await expect(page.locator('.nav-btn[data-screen="settings"]')).toHaveClass(/active/);
    
    // Возвращаемся к журналу
    await page.click('[data-screen="shifts"]');
    await expect(page.locator('#shifts-screen')).toBeVisible();
    
    // 5. Проверяем основные элементы интерфейса
    console.log('5️⃣ Проверяем элементы интерфейса...');
    
    // На экране журнала должны быть кнопки навигации по месяцам
    await expect(page.locator('#prev-month')).toBeVisible();
    await expect(page.locator('#current-month')).toBeVisible();
    await expect(page.locator('#next-month')).toBeVisible();
    
    // Должна быть кнопка добавления смены
    await expect(page.locator('#add-shift-btn')).toBeVisible();
    
    // 6. Проверяем адаптивность (мобильная версия)
    console.log('6️⃣ Тестируем мобильную адаптивность...');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Все основные элементы должны остаться видимыми
    await expect(page.locator('.nav-bar')).toBeVisible();
    await expect(page.locator('#add-shift-btn')).toBeVisible();
    
    // Возвращаем обычный размер экрана
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 7. Проверяем модальное окно (быстрый тест)
    console.log('7️⃣ Тестируем модальные окна...');
    await page.click('#add-shift-btn');
    
    // Ждем открытия модального окна
    await page.waitForSelector('#shift-modal', { state: 'visible' });
    await expect(page.locator('#shift-modal')).toBeVisible();
    await expect(page.locator('#shift-modal')).not.toHaveClass(/hidden/);
    
    // Закрываем модальное окно
    await page.click('#shift-modal .modal-header .btn-icon');
    await page.waitForSelector('#shift-modal.hidden', { timeout: 5000 });
    
    // 8. Выходим из системы
    console.log('8️⃣ Выполняем выход из системы...');
    await logoutUser(page);
    
    // Проверяем, что вернулись к экрану авторизации
    await expect(page.locator('#auth-screen')).toBeVisible();
    await expect(page.locator('#main-app')).toBeHidden();
    
    console.log('✅ Демо-тест завершен успешно! Все основные функции работают.');
  });

  test('Проверка производительности загрузки', async ({ page }) => {
    console.log('⚡ Тест производительности: Время загрузки приложения');
    
    const startTime = Date.now();
    
    // Переходим к приложению
    await page.goto('/');
    
    // Ждем полной загрузки (экран авторизации)
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    await expect(page.locator('#auth-screen')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Время загрузки приложения: ${loadTime}ms`);
    
    // Проверяем, что загрузка не слишком медленная (должна быть < 5 секунд)
    expect(loadTime).toBeLessThan(5000);
    
    // Авторизуемся и засекаем время перехода к главному приложению
    const authStartTime = Date.now();
    await loginUser(page);
    const authTime = Date.now() - authStartTime;
    
    console.log(`🔐 Время авторизации: ${authTime}ms`);
    
    // Авторизация тоже не должна быть очень долгой
    expect(authTime).toBeLessThan(10000);
    
    console.log('✅ Тест производительности пройден!');
  });

  test('Проверка отсутствия JavaScript ошибок', async ({ page }) => {
    console.log('🐛 Проверка отсутствия критических JavaScript ошибок');
    
    const consoleErrors = [];
    const consoleWarnings = [];
    
    // Перехватываем сообщения консоли
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });
    
    // Перехватываем ошибки страницы
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Выполняем базовые действия в приложении
    await page.goto('/');
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
    
    await loginUser(page);
    
    // Переходим по всем экранам
    await page.click('[data-screen="reports"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-screen="settings"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-screen="shifts"]');
    await page.waitForTimeout(1000);
    
    // Открываем и закрываем модальное окно
    await page.click('#add-shift-btn');
    await page.waitForSelector('#shift-modal', { state: 'visible' });
    await page.click('#shift-modal .modal-header .btn-icon');
    await page.waitForSelector('#shift-modal.hidden');
    
    await logoutUser(page);
    
    // Анализируем собранные ошибки
    console.log(`📊 Статистика ошибок:`);
    console.log(`   - JavaScript ошибки: ${consoleErrors.length}`);
    console.log(`   - Предупреждения: ${consoleWarnings.length}`);
    console.log(`   - Ошибки страницы: ${pageErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('🔍 JavaScript ошибки:');
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (pageErrors.length > 0) {
      console.log('🔍 Ошибки страницы:');
      pageErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Критические ошибки не должны присутствовать
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(error => {
      // Фильтруем только действительно критические ошибки
      return !error.includes('favicon') && // игнорируем ошибки favicon
             !error.includes('manifest') && // игнорируем ошибки манифеста
             !error.includes('sw.js') &&   // игнорируем ошибки service worker
             !error.toLowerCase().includes('warning'); // игнорируем предупреждения
    });
    
    expect(criticalErrors.length).toBe(0);
    
    console.log('✅ Проверка ошибок завершена - критических ошибок не найдено!');
  });
}); 