const { expect } = require('@playwright/test');

/**
 * Ждем открытия модального окна
 * @param {import('@playwright/test').Page} page - Страница браузера
 * @param {string} modalId - ID модального окна
 */
async function waitForModalOpen(page, modalId) {
  await page.waitForSelector(`#${modalId}`, { state: 'visible' });
  await expect(page.locator(`#${modalId}`)).toBeVisible();
  await expect(page.locator(`#${modalId}`)).not.toHaveClass(/hidden/);
}

/**
 * Ждем закрытия модального окна
 * @param {import('@playwright/test').Page} page - Страница браузера
 * @param {string} modalId - ID модального окна
 */
async function waitForModalClose(page, modalId) {
  await page.waitForSelector(`#${modalId}.hidden`, { timeout: 5000 });
  await expect(page.locator(`#${modalId}`)).toHaveClass(/hidden/);
}

/**
 * Закрыть модальное окно кнопкой X
 * @param {import('@playwright/test').Page} page - Страница браузера
 * @param {string} modalId - ID модального окна
 */
async function closeModalByX(page, modalId) {
  const closeButton = page.locator(`#${modalId} .modal-header .btn-icon`);
  await closeButton.click();
  await waitForModalClose(page, modalId);
}

/**
 * Закрыть модальное окно кликом вне его области
 * @param {import('@playwright/test').Page} page - Страница браузера
 * @param {string} modalId - ID модального окна
 */
async function closeModalByOutsideClick(page, modalId) {
  // Кликаем по overlay (фону модального окна)
  await page.click(`#${modalId}`, { position: { x: 10, y: 10 } });
  await waitForModalClose(page, modalId);
}

/**
 * Добавить заведение через модальное окно
 * @param {import('@playwright/test').Page} page - Страница браузера
 * @param {Object} venueData - Данные заведения
 */
async function addVenue(page, venueData) {
  console.log(`🏢 Добавляем заведение: ${venueData.name}`);
  
  // Открываем модальное окно добавления заведения
  await page.click('#add-venue-btn');
  await waitForModalOpen(page, 'venue-modal');
  
  // Заполняем форму
  await page.fill('#venue-name', venueData.name);
  if (venueData.address) {
    await page.fill('#venue-address', venueData.address);
  }
  if (venueData.phone) {
    await page.fill('#venue-phone', venueData.phone);
  }
  
  // Сохраняем
  await page.click('#venue-form button[type="submit"]');
  await waitForModalClose(page, 'venue-modal');
  
  // Ждем обновления списка заведений
  await page.waitForTimeout(1000);
  
  console.log(`✅ Заведение "${venueData.name}" добавлено`);
}

/**
 * Добавить позицию через модальное окно
 * @param {import('@playwright/test').Page} page - Страница браузера
 * @param {Object} productData - Данные позиции
 */
async function addProduct(page, productData) {
  console.log(`🍽️ Добавляем позицию: ${productData.name}`);
  
  // Открываем модальное окно добавления позиции
  await page.click('#add-product-btn');
  await waitForModalOpen(page, 'product-modal');
  
  // Заполняем форму
  await page.fill('#product-name', productData.name);
  await page.fill('#product-price', productData.price.toString());
  
  // Выбираем тип комиссии
  await page.selectOption('#commission-type', productData.commissionType);
  
  // Заполняем размер комиссии
  await page.fill('#commission-value', productData.commissionValue.toString());
  
  // Сохраняем
  await page.click('#product-form button[type="submit"]');
  await waitForModalClose(page, 'product-modal');
  
  // Ждем обновления списка позиций
  await page.waitForTimeout(1000);
  
  console.log(`✅ Позиция "${productData.name}" добавлена`);
}

/**
 * Добавить смену через модальное окно
 * @param {import('@playwright/test').Page} page - Страница браузера
 * @param {Object} shiftData - Данные смены
 */
async function addShift(page, shiftData) {
  console.log(`📅 Добавляем смену на ${shiftData.date}`);
  
  // Открываем модальное окно добавления смены
  await page.click('#add-shift-btn');
  await waitForModalOpen(page, 'shift-modal');
  
  // Заполняем дату
  await page.fill('#shift-date', shiftData.date);
  
  if (shiftData.isWorkday) {
    // Выбираем "Рабочий день"
    await page.check('input[name="workday"][value="work"]');
    
    // Выбираем заведение
    if (shiftData.venueId) {
      await page.selectOption('#shift-venue', shiftData.venueId);
    }
    
    // Заполняем фиксированный выход
    if (shiftData.fixedPayout) {
      await page.fill('#shift-payout', shiftData.fixedPayout.toString());
    }
    
    // Заполняем чай
    if (shiftData.tips) {
      await page.fill('#shift-tips', shiftData.tips.toString());
    }
    
    // Добавляем позиции, если есть
    if (shiftData.products && shiftData.products.length > 0) {
      for (const product of shiftData.products) {
        // Кликаем "Добавить позицию"
        const addProductBtn = page.locator('#products-container .btn-secondary').last();
        await addProductBtn.click();
        
        // Находим последнюю группу позиций
        const productGroups = page.locator('.product-group');
        const lastGroup = productGroups.last();
        
        // Выбираем позицию и количество
        await lastGroup.locator('select').selectOption(product.productId);
        await lastGroup.locator('input[type="number"]').fill(product.quantity.toString());
      }
    }
  } else {
    // Выбираем "Выходной"
    await page.check('input[name="workday"][value="off"]');
  }
  
  // Сохраняем
  await page.click('#shift-form button[type="submit"]');
  await waitForModalClose(page, 'shift-modal');
  
  // Ждем обновления списка смен
  await page.waitForTimeout(2000);
  
  console.log(`✅ Смена на ${shiftData.date} добавлена`);
}

module.exports = {
  waitForModalOpen,
  waitForModalClose,
  closeModalByX,
  closeModalByOutsideClick,
  addVenue,
  addProduct,
  addShift
}; 