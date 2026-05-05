const { test, expect } = require('@playwright/test');
const path = require('path');

test('журнал смен не падает при удаленном заведении или позиции', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(() => {
    const emptyResult = { data: [], error: null };
    const mockClient = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null })
      },
      from: table => ({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        gte() {
          return this;
        },
        lte() {
          return this;
        },
        order() {
          return Promise.resolve(emptyResult);
        },
        limit() {
          return Promise.resolve(emptyResult);
        },
        in() {
          if (table === 'shift_products') {
            return Promise.resolve({
              data: [{
                id: 'shift-product-1',
                shift_id: 'shift-1',
                product_id: 'deleted-product',
                quantity: 2,
                price_snapshot: 100,
                venue_products: null
              }],
              error: null
            });
          }

          return Promise.resolve(emptyResult);
        }
      })
    };

    window.supabase = {
      createClient: () => mockClient
    };
  });

  await page.goto(`file://${path.resolve(__dirname, '../../index.html')}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.renderShiftsList === 'function');

  const renderedText = await page.evaluate(async () => {
    window.currentUser = { id: 'user-1' };
    window.venues = [];
    window.products = [];
    window.shifts = [{
      id: 'shift-1',
      shift_date: '2026-05-05',
      venue_id: 'deleted-venue',
      is_workday: true,
      tips: 0,
      revenue_generated: 200,
      earnings: 50
    }];

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = 'venue';
    }

    await window.renderShiftsList();
    return document.getElementById('shifts-list').innerText;
  });

  expect(renderedText).toContain('Не указано');
  expect(renderedText).toContain('Неизвестная позиция');
  expect(pageErrors).toEqual([]);
});
