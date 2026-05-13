const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Критичная null-safety регрессия', () => {
  let source;

  test.beforeAll(() => {
    source = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
  });

  test('основные пользовательские пути не используют прямые обращения к nullable данным', () => {
    expect(source).toContain('function getVenueNameForShift(shift)');
    expect(source).toContain('function getShiftProductName(shiftProduct)');

    expect(source).not.toMatch(/venueId:\s*venue\.id/);
    expect(source).not.toMatch(/venueName:\s*venue\.name/);
    expect(source).not.toMatch(/session\.session\.user/);
    expect(source).not.toMatch(/venues\.find\(v => v\.id === [ab]\.venue_id\)\.name/);
    expect(source).not.toMatch(/const venueName = venue\.name/);
    expect(source).not.toMatch(/sp\.venue_products\.name/);
    expect(source).not.toMatch(/products\.find\(p => p\.id === sp\.product_id\)\.name/);
    expect(source).not.toMatch(/shift\.venues\.name/);
  });
});
