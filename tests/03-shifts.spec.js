const { test, expect } = require('@playwright/test');
const { loginUser } = require('./helpers/auth');
const { addVenue, addProduct, addShift, waitForModalOpen, waitForModalClose, closeModalByX } = require('./helpers/modals');

test.describe('Тестирование журнала смен', () => {
  
  let testVenueId;
  let testProducts = [];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginUser(page);
    
    // Подготавливаем тестовые данные
    await setupTestData(page);
    
    // Переходим к журналу смен
    await page.click('[data-screen="shifts"]');
    await page.waitForSelector('#shifts-screen', { state: 'visible' });
    await expect(page.locator('#shifts-screen')).toBeVisible();
  });

  async function setupTestData(page) {
    // Переходим в настройки для создания тестовых данных
    await page.click('[data-screen="settings"]');
    await page.waitForSelector('#settings-screen', { state: 'visible' });
    
    // Добавляем тестовое заведение
    const testVenue = {
      name: 'Тестовое Заведение',
      address: 'ул. Тестовая, 1'
    };
    
    await addVenue(page, testVenue);
    
    // Добавляем тестовые позиции
    const products = [
      {
        name: 'Кофе',
        price: 150,
        commissionType: 'fixed',
        commissionValue: 25
      },
      {
        name: 'Десерт',
        price: 300,
        commissionType: 'percent',
        commissionValue: 15
      }
    ];
    
    for (const product of products) {
      await addProduct(page, product);
      testProducts.push(product);
    }
    
    // Ждем небольшую паузу для сохранения данных
    await page.waitForTimeout(1000);
  }

  test.describe('Добавление смен', () => {
    
    test('Добавление рабочей смены с позициями', async ({ page }) => {
      console.log('🧪 Тест: Добавление рабочей смены');
      
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const shiftData = {
        date: currentDate,
        isWorkday: true,
        fixedPayout: 1000,
        tips: 500,
        products: [
          { quantity: 10 }, // Кофе
          { quantity: 5 }   // Десерт
        ]
      };
      
      // Открываем модальное окно добавления смены
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      // Заполняем дату
      await page.fill('#shift-date', shiftData.date);
      
      // Выбираем "Рабочий день"
      await page.check('input[name="workday"][value="work"]');
      
      // Ждем появления полей для рабочего дня
      await page.waitForSelector('#shift-venue', { state: 'visible' });
      
      // Выбираем заведение (первое доступное)
      const venueOptions = await page.locator('#shift-venue option:not([value=""])').all();
      if (venueOptions.length > 0) {
        const firstVenueValue = await venueOptions[0].getAttribute('value');
        await page.selectOption('#shift-venue', firstVenueValue);
      }
      
      // Заполняем фиксированный выход и чай
      await page.fill('#shift-payout', shiftData.fixedPayout.toString());
      await page.fill('#shift-tips', shiftData.tips.toString());
      
      // Добавляем позиции
      const productOptions = await page.locator('#products-container select option:not([value=""])').all();
      
      if (productOptions.length >= 2) {
        // Первая позиция (должна быть уже доступна)
        await page.selectOption('#products-container select', await productOptions[0].getAttribute('value'));
        await page.fill('#products-container input[type="number"]', shiftData.products[0].quantity.toString());
        
        // Добавляем вторую позицию
        await page.click('#products-container .btn-secondary');
        await page.waitForTimeout(500);
        
        const productGroups = page.locator('.product-group');
        const secondGroup = productGroups.nth(1);
        await secondGroup.locator('select').selectOption(await productOptions[1].getAttribute('value'));
        await secondGroup.locator('input[type="number"]').fill(shiftData.products[1].quantity.toString());
      }
      
      // Проверяем автоматический расчет итогов
      await page.waitForTimeout(1000);
      
      const totalRevenue = page.locator('#total-revenue');
      const totalEarnings = page.locator('#total-earnings');
      
      // Проверяем, что итоги рассчитались (не равны 0)
      if (await totalRevenue.isVisible()) {
        const revenueText = await totalRevenue.textContent();
        expect(revenueText).not.toBe('0 ₽');
      }
      
      if (await totalEarnings.isVisible()) {
        const earningsText = await totalEarnings.textContent();
        expect(earningsText).not.toBe('0 ₽');
      }
      
      // Сохраняем смену
      await page.click('#shift-form button[type="submit"]');
      await waitForModalClose(page, 'shift-modal');
      
      // Проверяем, что смена появилась в списке
      await page.waitForTimeout(2000);
      const shiftsTable = page.locator('#shifts-list');
      await expect(shiftsTable.locator(`text=${currentDate.split('-').reverse().join('.')}`)).toBeVisible();
    });

    test('Добавление выходного дня', async ({ page }) => {
      console.log('🧪 Тест: Добавление выходного дня');
      
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1); // завтрашний день
      const dateString = currentDate.toISOString().split('T')[0];
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      // Заполняем дату
      await page.fill('#shift-date', dateString);
      
      // Выбираем "Выходной"
      await page.check('input[name="workday"][value="off"]');
      
      // Проверяем, что поля для рабочего дня скрыты
      await expect(page.locator('#shift-venue')).toBeHidden();
      await expect(page.locator('#shift-payout')).toBeHidden();
      await expect(page.locator('#shift-tips')).toBeHidden();
      
      // Сохраняем
      await page.click('#shift-form button[type="submit"]');
      await waitForModalClose(page, 'shift-modal');
      
      // Проверяем, что выходной появился в списке
      await page.waitForTimeout(2000);
      const shiftsTable = page.locator('#shifts-list');
      const dayOffRow = shiftsTable.locator(`text=${dateString.split('-').reverse().join('.')}`);
      await expect(dayOffRow).toBeVisible();
      
      // Проверяем, что показывается "Выходной"
      await expect(shiftsTable.locator('text=Выходной')).toBeVisible();
    });

    test('Валидация обязательной даты', async ({ page }) => {
      console.log('🧪 Тест: Валидация даты смены');
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      // Пытаемся сохранить без даты
      await page.click('#shift-form button[type="submit"]');
      
      // Проверяем HTML5 валидацию
      await expect(page.locator('#shift-date')).toHaveAttribute('required');
      
      // Модальное окно должно остаться открытым
      await expect(page.locator('#shift-modal')).toBeVisible();
      
      await closeModalByX(page, 'shift-modal');
    });

    test('Переключение между рабочим днем и выходным', async ({ page }) => {
      console.log('🧪 Тест: Переключение типа дня');
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      // По умолчанию должен быть выбран рабочий день
      await expect(page.locator('input[name="workday"][value="work"]')).toBeChecked();
      await expect(page.locator('#shift-venue')).toBeVisible();
      
      // Переключаем на выходной
      await page.check('input[name="workday"][value="off"]');
      
      // Проверяем скрытие полей
      await expect(page.locator('#shift-venue')).toBeHidden();
      await expect(page.locator('#shift-payout')).toBeHidden();
      await expect(page.locator('#shift-tips')).toBeHidden();
      
      // Переключаем обратно на рабочий день
      await page.check('input[name="workday"][value="work"]');
      
      // Проверяем появление полей
      await expect(page.locator('#shift-venue')).toBeVisible();
      await expect(page.locator('#shift-payout')).toBeVisible();
      await expect(page.locator('#shift-tips')).toBeVisible();
      
      await closeModalByX(page, 'shift-modal');
    });
  });

  test.describe('Навигация по месяцам', () => {
    
    test('Переключение между месяцами', async ({ page }) => {
      console.log('🧪 Тест: Навигация по месяцам');
      
      // Получаем текущий месяц
      const currentMonthText = await page.locator('#current-month').textContent();
      
      // Переходим к предыдущему месяцу
      await page.click('#prev-month');
      await page.waitForTimeout(1000);
      
      const prevMonthText = await page.locator('#current-month').textContent();
      expect(prevMonthText).not.toBe(currentMonthText);
      
      // Переходим к следующему месяцу (возвращаемся)
      await page.click('#next-month');
      await page.waitForTimeout(1000);
      
      const nextMonthText = await page.locator('#current-month').textContent();
      expect(nextMonthText).toBe(currentMonthText);
      
      // Проверяем еще один клик вперед
      await page.click('#next-month');
      await page.waitForTimeout(1000);
      
      const futureMonthText = await page.locator('#current-month').textContent();
      expect(futureMonthText).not.toBe(currentMonthText);
    });

    test('Отображение пустого месяца', async ({ page }) => {
      console.log('🧪 Тест: Пустой месяц');
      
      // Переходим далеко в будущее, где точно нет смен
      for (let i = 0; i < 6; i++) {
        await page.click('#next-month');
        await page.waitForTimeout(300);
      }
      
      // Проверяем отображение пустого состояния
      const shiftsTable = page.locator('#shifts-list');
      const tableContent = await shiftsTable.textContent();
      
      // Должно быть пусто или показываться сообщение о отсутствии смен
      if (tableContent.trim() === '' || tableContent.includes('Нет смен') || tableContent.includes('смен не найдено')) {
        // Это ожидаемое поведение для пустого месяца
        console.log('✅ Пустой месяц отображается корректно');
      }
    });
  });

  test.describe('Расчеты и формулы', () => {
    
    test('Проверка расчета выручки', async ({ page }) => {
      console.log('🧪 Тест: Расчет выручки');
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      await page.fill('#shift-date', currentDate);
      await page.check('input[name="workday"][value="work"]');
      
      // Выбираем заведение
      const venueOptions = await page.locator('#shift-venue option:not([value=""])').all();
      if (venueOptions.length > 0) {
        await page.selectOption('#shift-venue', await venueOptions[0].getAttribute('value'));
      }
      
      // Добавляем позиции с известными ценами
      const productOptions = await page.locator('#products-container select option:not([value=""])').all();
      
      if (productOptions.length >= 1) {
        // Добавляем 5 кофе по 150₽ = 750₽
        await page.selectOption('#products-container select', await productOptions[0].getAttribute('value'));
        await page.fill('#products-container input[type="number"]', '5');
        
        // Ждем пересчета
        await page.waitForTimeout(1000);
        
        // Проверяем расчет выручки
        const totalRevenue = page.locator('#total-revenue');
        if (await totalRevenue.isVisible()) {
          const revenueText = await totalRevenue.textContent();
          // Ожидаем 750₽ (5 * 150)
          expect(revenueText).toContain('750');
        }
      }
      
      await closeModalByX(page, 'shift-modal');
    });

    test('Проверка расчета заработка с комиссией', async ({ page }) => {
      console.log('🧪 Тест: Расчет заработка');
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      await page.fill('#shift-date', currentDate);
      await page.check('input[name="workday"][value="work"]');
      
      // Выбираем заведение
      const venueOptions = await page.locator('#shift-venue option:not([value=""])').all();
      if (venueOptions.length > 0) {
        await page.selectOption('#shift-venue', await venueOptions[0].getAttribute('value'));
      }
      
      // Добавляем фиксированный выход и чай
      await page.fill('#shift-payout', '1000');
      await page.fill('#shift-tips', '500');
      
      // Добавляем позицию с фиксированной комиссией
      const productOptions = await page.locator('#products-container select option:not([value=""])').all();
      
      if (productOptions.length >= 1) {
        // 4 кофе по 25₽ комиссии = 100₽
        await page.selectOption('#products-container select', await productOptions[0].getAttribute('value'));
        await page.fill('#products-container input[type="number"]', '4');
        
        await page.waitForTimeout(1000);
        
        // Общий заработок должен быть: 100 (комиссия) + 1000 (выход) + 500 (чай) = 1600₽
        const totalEarnings = page.locator('#total-earnings');
        if (await totalEarnings.isVisible()) {
          const earningsText = await totalEarnings.textContent();
          expect(earningsText).toContain('1600');
        }
      }
      
      await closeModalByX(page, 'shift-modal');
    });

    test('Проверка расчета с процентной комиссией', async ({ page }) => {
      console.log('🧪 Тест: Расчет с процентной комиссией');
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      await page.fill('#shift-date', currentDate);
      await page.check('input[name="workday"][value="work"]');
      
      const venueOptions = await page.locator('#shift-venue option:not([value=""])').all();
      if (venueOptions.length > 0) {
        await page.selectOption('#shift-venue', await venueOptions[0].getAttribute('value'));
      }
      
      // Добавляем позицию с процентной комиссией (Десерт)
      const productOptions = await page.locator('#products-container select option:not([value=""])').all();
      
      if (productOptions.length >= 2) {
        // 2 десерта по 300₽ с комиссией 15% = 2 * 300 * 0.15 = 90₽
        await page.selectOption('#products-container select', await productOptions[1].getAttribute('value'));
        await page.fill('#products-container input[type="number"]', '2');
        
        await page.waitForTimeout(1000);
        
        // Проверяем расчет комиссии
        const totalEarnings = page.locator('#total-earnings');
        if (await totalEarnings.isVisible()) {
          const earningsText = await totalEarnings.textContent();
          expect(earningsText).toContain('90');
        }
      }
      
      await closeModalByX(page, 'shift-modal');
    });
  });

  test.describe('Редактирование и удаление смен', () => {
    
    test('Редактирование существующей смены', async ({ page }) => {
      console.log('🧪 Тест: Редактирование смены');
      
      // Сначала добавляем смену
      const currentDate = new Date().toISOString().split('T')[0];
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      await page.fill('#shift-date', currentDate);
      await page.check('input[name="workday"][value="work"]');
      
      const venueOptions = await page.locator('#shift-venue option:not([value=""])').all();
      if (venueOptions.length > 0) {
        await page.selectOption('#shift-venue', await venueOptions[0].getAttribute('value'));
      }
      
      await page.fill('#shift-payout', '800');
      
      await page.click('#shift-form button[type="submit"]');
      await waitForModalClose(page, 'shift-modal');
      await page.waitForTimeout(2000);
      
      // Теперь редактируем смену - кликаем по строке в таблице
      const dateFormatted = currentDate.split('-').reverse().join('.');
      const shiftRow = page.locator('#shifts-list').locator(`text=${dateFormatted}`).first();
      await shiftRow.click();
      
      await waitForModalOpen(page, 'shift-modal');
      
      // Проверяем, что поля заполнены текущими данными
      await expect(page.locator('#shift-date')).toHaveValue(currentDate);
      await expect(page.locator('#shift-payout')).toHaveValue('800');
      
      // Изменяем выход
      await page.fill('#shift-payout', '1200');
      
      // Сохраняем изменения
      await page.click('#shift-form button[type="submit"]');
      await waitForModalClose(page, 'shift-modal');
      
      await page.waitForTimeout(2000);
      
      // Проверяем, что изменения сохранились
      // (можем открыть смену снова и проверить значения)
      await shiftRow.click();
      await waitForModalOpen(page, 'shift-modal');
      await expect(page.locator('#shift-payout')).toHaveValue('1200');
      
      await closeModalByX(page, 'shift-modal');
    });

    test('Удаление смены', async ({ page }) => {
      console.log('🧪 Тест: Удаление смены');
      
      // Добавляем смену для удаления
      const currentDate = new Date().toISOString().split('T')[0];
      
      await page.click('#add-shift-btn');
      await waitForModalOpen(page, 'shift-modal');
      
      await page.fill('#shift-date', currentDate);
      await page.check('input[name="workday"][value="off"]'); // выходной для простоты
      
      await page.click('#shift-form button[type="submit"]');
      await waitForModalClose(page, 'shift-modal');
      await page.waitForTimeout(2000);
      
      // Открываем смену для редактирования
      const dateFormatted = currentDate.split('-').reverse().join('.');
      const shiftRow = page.locator('#shifts-list').locator(`text=${dateFormatted}`).first();
      await shiftRow.click();
      
      await waitForModalOpen(page, 'shift-modal');
      
      // Ищем и нажимаем кнопку удаления
      const deleteButton = page.locator('#shift-modal').locator('button:has-text("Удалить"), .btn-danger');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Подтверждаем удаление, если есть диалог
        const confirmDialog = page.locator('.modal, .dialog');
        if (await confirmDialog.isVisible()) {
          await page.click('button:has-text("Удалить"), button:has-text("Да"), button:has-text("Подтвердить")');
        }
        
        await page.waitForTimeout(2000);
        
        // Проверяем, что смена исчезла из таблицы
        const shiftsTable = page.locator('#shifts-list');
        await expect(shiftsTable.locator(`text=${dateFormatted}`)).not.toBeVisible();
      }
    });
  });
});