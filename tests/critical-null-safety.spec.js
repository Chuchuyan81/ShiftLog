const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('критичные защиты от nullable данных', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

  test('не возвращает прямые обращения, которые ломают журнал и отчеты', () => {
    const unsafePatterns = [
      'venues.find(v => v.id === a.venue_id).name',
      'venues.find(v => v.id === b.venue_id).name',
      'const venueName = venue.name',
      'const productName = sp.venue_products.name',
      'products.find(p => p.id === sp.product_id).name',
      'const venueName = shift.venues.name',
      'venueId: venue.id',
      'venueName: venue.name',
      'session: !!session.session',
      'user: !!session.session.user',
      'if (session.session.user)'
    ];

    unsafePatterns.forEach(pattern => {
      expect(source).not.toContain(pattern);
    });
  });

  test('сохраняет fallback для удаленных заведений и позиций', () => {
    expect(source).toContain("const venueName = (venue && venue.name) ? venue.name : (shift.is_workday ? 'Не указано' : 'Выходной');");
    expect(source).toContain('const fallbackProduct = products.find(p => p.id === sp.product_id);');
    expect(source).toContain("(sp.venue_products && sp.venue_products.name) ||");
    expect(source).toContain("const venueName = (shift.venues && shift.venues.name) || (shift.is_workday ? 'Не указано' : 'Выходной');");
  });
});
