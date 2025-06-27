const { test, expect } = require('@playwright/test');
const { loginUser } = require('./helpers/auth');
const { addVenue, addProduct, waitForModalOpen, waitForModalClose, closeModalByX } = require('./helpers/modals');

test.describe('Тестирование настроек приложения', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginUser(page);
    
    // Переходим в настройки
    await page.click('[data-screen="settings"]');
    await page.waitForSelector('#settings-screen', { state: 'visible' });
    await expect(page.locator('#settings-screen')).toBeVisible();
  });

  test.describe('Управление заведениями', () => {
    
    test('Добавление нового заведения', async ({ page }) => {
      console.log('🧪 Тест: Добавление заведения');
      
      const venueData = {
        name: 'Тестовое Кафе',
        address: 'ул. Тестовая, 123',
        phone: '+7 (999) 123-45-67'
      };
      
      // Добавляем заведение
      await addVenue(page, venueData);
      
      // Проверяем, что заведение появилось в списке
      const venuesList = page.locator('#venues-list');
      await expect(venuesList.locator('text=' + venueData.name)).toBeVisible();
      
      // Проверяем отображение адреса и телефона
      const venueItem = venuesList.locator('.list-item').filter({ hasText: venueData.name });
      await expect(venueItem.locator('text=' + venueData.address)).toBeVisible();
      await expect(venueItem.locator('text=' + venueData.phone)).toBeVisible();
    });

    test('Добавление заведения только с названием', async ({ page }) => {
      console.log('🧪 Тест: Добавление заведения только с названием');
      
      const venueData = {
        name: 'Минимальное Кафе'
      };
      
      await addVenue(page, venueData);
      
      // Проверяем, что заведение добавилось
      const venuesList = page.locator('#venues-list');
      await expect(venuesList.locator('text=' + venueData.name)).toBeVisible();
    });

    test('Валидация пустого названия заведения', async ({ page }) => {
      console.log('🧪 Тест: Валидация пустого названия заведения');
      
      // Открываем модальное окно
      await page.click('#add-venue-btn');
      await waitForModalOpen(page, 'venue-modal');
      
      // Пытаемся сохранить с пустым названием
      await page.click('#venue-form button[type="submit"]');
      
      // Проверяем HTML5 валидацию
      const nameField = page.locator('#venue-name');
      await expect(nameField).toHaveAttribute('required');
      
      // Модальное окно должно остаться открытым
      await expect(page.locator('#venue-modal')).toBeVisible();
      await expect(page.locator('#venue-modal')).not.toHaveClass(/hidden/);
      
      // Закрываем модальное окно
      await closeModalByX(page, 'venue-modal');
    });

    test('Редактирование заведения', async ({ page }) => {
      console.log('🧪 Тест: Редактирование заведения');
      
      // Сначала добавляем заведение
      const originalVenue = {
        name: 'Исходное Кафе',
        address: 'ул. Исходная, 1'
      };
      
      await addVenue(page, originalVenue);
      
      // Находим кнопку редактирования
      const venueItem = page.locator('#venues-list .list-item').filter({ hasText: originalVenue.name });
      await venueItem.locator('.btn-edit').click();
      
      await waitForModalOpen(page, 'venue-modal');
      
      // Проверяем, что поля заполнены текущими данными
      await expect(page.locator('#venue-name')).toHaveValue(originalVenue.name);
      await expect(page.locator('#venue-address')).toHaveValue(originalVenue.address);
      
      // Изменяем данные
      const updatedVenue = {
        name: 'Обновленное Кафе',
        address: 'ул. Новая, 2',
        phone: '+7 (999) 888-77-66'
      };
      
      await page.fill('#venue-name', updatedVenue.name);
      await page.fill('#venue-address', updatedVenue.address);
      await page.fill('#venue-phone', updatedVenue.phone);
      
      // Сохраняем изменения
      await page.click('#venue-form button[type="submit"]');
      await waitForModalClose(page, 'venue-modal');
      
      // Проверяем обновленные данные в списке
      const venuesList = page.locator('#venues-list');
      await expect(venuesList.locator('text=' + updatedVenue.name)).toBeVisible();
      await expect(venuesList.locator('text=' + updatedVenue.address)).toBeVisible();
      await expect(venuesList.locator('text=' + updatedVenue.phone)).toBeVisible();
      
      // Проверяем, что старое название больше не отображается
      await expect(venuesList.locator('text=' + originalVenue.name)).not.toBeVisible();
    });

    test('Удаление заведения', async ({ page }) => {
      console.log('🧪 Тест: Удаление заведения');
      
      // Добавляем заведение для удаления
      const venueToDelete = {
        name: 'Заведение для Удаления'
      };
      
      await addVenue(page, venueToDelete);
      
      // Находим и нажимаем кнопку удаления
      const venueItem = page.locator('#venues-list .list-item').filter({ hasText: venueToDelete.name });
      await venueItem.locator('.btn-delete').click();
      
      // Подтверждаем удаление (если есть диалог подтверждения)
      // Это зависит от реализации в приложении
      const confirmDialog = page.locator('.modal, .dialog');
      if (await confirmDialog.isVisible()) {
        await page.click('button:has-text("Удалить"), button:has-text("Да"), button:has-text("Подтвердить")');
      }
      
      await page.waitForTimeout(1000);
      
      // Проверяем, что заведение исчезло из списка
      const venuesList = page.locator('#venues-list');
      await expect(venuesList.locator('text=' + venueToDelete.name)).not.toBeVisible();
    });
  });

  test.describe('Управление позициями/услугами', () => {
    
    test('Добавление позиции с фиксированной комиссией', async ({ page }) => {
      console.log('🧪 Тест: Добавление позиции с фиксированной комиссией');
      
      const productData = {
        name: 'Кофе Американо',
        price: 120,
        commissionType: 'fixed',
        commissionValue: 20
      };
      
      await addProduct(page, productData);
      
      // Проверяем, что позиция появилась в списке
      const productsList = page.locator('#products-list');
      await expect(productsList.locator('text=' + productData.name)).toBeVisible();
      
      // Проверяем отображение цены и комиссии
      const productItem = productsList.locator('.list-item').filter({ hasText: productData.name });
      await expect(productItem.locator('text=' + productData.price + ' ₽')).toBeVisible();
      await expect(productItem.locator('text=' + productData.commissionValue + ' ₽')).toBeVisible();
    });

    test('Добавление позиции с процентной комиссией', async ({ page }) => {
      console.log('🧪 Тест: Добавление позиции с процентной комиссией');
      
      const productData = {
        name: 'Десерт Тирамису',
        price: 350,
        commissionType: 'percent',
        commissionValue: 15
      };
      
      await addProduct(page, productData);
      
      // Проверяем, что позиция появилась в списке
      const productsList = page.locator('#products-list');
      await expect(productsList.locator('text=' + productData.name)).toBeVisible();
      
      // Проверяем отображение процентной комиссии
      const productItem = productsList.locator('.list-item').filter({ hasText: productData.name });
      await expect(productItem.locator('text=' + productData.commissionValue + '%')).toBeVisible();
    });

    test('Валидация обязательных полей позиции', async ({ page }) => {
      console.log('🧪 Тест: Валидация полей позиции');
      
      // Открываем модальное окно добавления позиции
      await page.click('#add-product-btn');
      await waitForModalOpen(page, 'product-modal');
      
      // Пытаемся сохранить с пустыми полями
      await page.click('#product-form button[type="submit"]');
      
      // Проверяем HTML5 валидацию
      await expect(page.locator('#product-name')).toHaveAttribute('required');
      await expect(page.locator('#product-price')).toHaveAttribute('required');
      await expect(page.locator('#commission-value')).toHaveAttribute('required');
      
      // Модальное окно должно остаться открытым
      await expect(page.locator('#product-modal')).toBeVisible();
      
      await closeModalByX(page, 'product-modal');
    });

    test('Валидация отрицательных значений', async ({ page }) => {
      console.log('🧪 Тест: Валидация отрицательных значений');
      
      await page.click('#add-product-btn');
      await waitForModalOpen(page, 'product-modal');
      
      // Вводим отрицательные значения
      await page.fill('#product-name', 'Тест Позиция');
      await page.fill('#product-price', '-100');
      await page.fill('#commission-value', '-10');
      
      await page.click('#product-form button[type="submit"]');
      
      // Проверяем HTML5 валидацию min значений
      await expect(page.locator('#product-price')).toHaveAttribute('min', '0');
      await expect(page.locator('#commission-value')).toHaveAttribute('min', '0');
      
      await closeModalByX(page, 'product-modal');
    });

    test('Переключение типа комиссии', async ({ page }) => {
      console.log('🧪 Тест: Переключение типа комиссии');
      
      await page.click('#add-product-btn');
      await waitForModalOpen(page, 'product-modal');
      
      // По умолчанию должна быть выбрана фиксированная комиссия
      await expect(page.locator('#commission-type')).toHaveValue('fixed');
      
      // Переключаем на процентную
      await page.selectOption('#commission-type', 'percent');
      
      // Проверяем, что значение изменилось
      await expect(page.locator('#commission-type')).toHaveValue('percent');
      
      // Можем проверить изменение лейбла, если он динамически меняется
      // (зависит от реализации в приложении)
      
      await closeModalByX(page, 'product-modal');
    });

    test('Редактирование позиции', async ({ page }) => {
      console.log('🧪 Тест: Редактирование позиции');
      
      // Сначала добавляем позицию
      const originalProduct = {
        name: 'Исходная Позиция',
        price: 100,
        commissionType: 'fixed',
        commissionValue: 15
      };
      
      await addProduct(page, originalProduct);
      
      // Находим и редактируем позицию
      const productItem = page.locator('#products-list .list-item').filter({ hasText: originalProduct.name });
      await productItem.locator('.btn-edit').click();
      
      await waitForModalOpen(page, 'product-modal');
      
      // Проверяем предзаполненные данные
      await expect(page.locator('#product-name')).toHaveValue(originalProduct.name);
      await expect(page.locator('#product-price')).toHaveValue(originalProduct.price.toString());
      await expect(page.locator('#commission-type')).toHaveValue(originalProduct.commissionType);
      await expect(page.locator('#commission-value')).toHaveValue(originalProduct.commissionValue.toString());
      
      // Изменяем данные
      const updatedProduct = {
        name: 'Обновленная Позиция',
        price: 150,
        commissionType: 'percent',
        commissionValue: 20
      };
      
      await page.fill('#product-name', updatedProduct.name);
      await page.fill('#product-price', updatedProduct.price.toString());
      await page.selectOption('#commission-type', updatedProduct.commissionType);
      await page.fill('#commission-value', updatedProduct.commissionValue.toString());
      
      // Сохраняем
      await page.click('#product-form button[type="submit"]');
      await waitForModalClose(page, 'product-modal');
      
      // Проверяем обновленные данные
      const productsList = page.locator('#products-list');
      await expect(productsList.locator('text=' + updatedProduct.name)).toBeVisible();
      await expect(productsList.locator('text=' + updatedProduct.price + ' ₽')).toBeVisible();
      await expect(productsList.locator('text=' + updatedProduct.commissionValue + '%')).toBeVisible();
    });

    test('Удаление позиции', async ({ page }) => {
      console.log('🧪 Тест: Удаление позиции');
      
      // Добавляем позицию для удаления
      const productToDelete = {
        name: 'Позиция для Удаления',
        price: 50,
        commissionType: 'fixed',
        commissionValue: 10
      };
      
      await addProduct(page, productToDelete);
      
      // Удаляем позицию
      const productItem = page.locator('#products-list .list-item').filter({ hasText: productToDelete.name });
      await productItem.locator('.btn-delete').click();
      
      // Подтверждаем удаление
      const confirmDialog = page.locator('.modal, .dialog');
      if (await confirmDialog.isVisible()) {
        await page.click('button:has-text("Удалить"), button:has-text("Да"), button:has-text("Подтвердить")');
      }
      
      await page.waitForTimeout(1000);
      
      // Проверяем, что позиция исчезла
      const productsList = page.locator('#products-list');
      await expect(productsList.locator('text=' + productToDelete.name)).not.toBeVisible();
    });
  });

  test.describe('Настройки валюты', () => {
    
    test('Смена валюты', async ({ page }) => {
      console.log('🧪 Тест: Смена валюты');
      
      // Проверяем текущую валюту (по умолчанию рубль)
      await expect(page.locator('#currency-select')).toHaveValue('₽');
      
      // Меняем на доллар
      await page.selectOption('#currency-select', '$');
      
      // Проверяем, что значение изменилось
      await expect(page.locator('#currency-select')).toHaveValue('$');
      
      // Можем проверить обновление отображения в других частях приложения
      // (это потребует перехода к другим экранам и проверки)
      
      // Возвращаем обратно к рублю
      await page.selectOption('#currency-select', '₽');
      await expect(page.locator('#currency-select')).toHaveValue('₽');
    });
  });

  test.describe('Отладочные функции', () => {
    
    test('Проверка пользователя (отладка)', async ({ page }) => {
      console.log('🧪 Тест: Отладочная функция');
      
      // Нажимаем кнопку отладки
      await page.click('#debug-user-btn');
      
      // Ждем появления отладочной информации
      await page.waitForTimeout(2000);
      
      // Проверяем, что отобразилась отладочная информация
      const debugInfo = page.locator('#debug-info');
      if (await debugInfo.isVisible()) {
        // Проверяем, что есть какая-то информация о пользователе
        const debugText = await debugInfo.textContent();
        expect(debugText).toBeTruthy();
        expect(debugText.length).toBeGreaterThan(0);
      }
    });
  });
});