const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'main.js');
const source = fs.readFileSync(mainJsPath, 'utf8');

function getFunctionBody(functionName) {
  const marker = 'function ' + functionName;
  const start = source.indexOf(marker);
  expect(start, functionName + ' должен существовать').toBeGreaterThanOrEqual(0);

  const braceStart = source.indexOf('{', start);
  expect(braceStart, functionName + ' должен иметь тело').toBeGreaterThanOrEqual(0);

  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const char = source[i];
    if (char === '{') depth++;
    if (char === '}') depth--;
    if (depth === 0) {
      return source.slice(braceStart, i + 1);
    }
  }

  throw new Error('Не найден конец функции ' + functionName);
}

test.describe('критичная null-safety после удаления optional chaining', () => {
  test('добавление заведения не обращается к полям null-аргумента', () => {
    const body = getFunctionBody('openVenueModal');

    expect(body).not.toContain('venueId: venue.id');
    expect(body).not.toContain('venueName: venue.name');
    expect(body).not.toContain('isValidId: venue.id');
  });

  test('журнал смен безопасен при удаленных заведениях и позициях', () => {
    const renderBody = getFunctionBody('renderShiftsList');
    const sortBody = getFunctionBody('sortShifts');

    expect(sortBody).not.toMatch(/venues\.find\([^)]*\)\.name/);
    expect(renderBody).not.toContain('const venueName = venue.name');
    expect(renderBody).not.toContain('sp.venue_products.name ||');
    expect(renderBody).not.toMatch(/products\.find\([^)]*\)\.name/);
  });

  test('отчеты и экспорт безопасны при nullable JOIN из Supabase', () => {
    const reportsBody = getFunctionBody('generateReports');
    const exportBody = getFunctionBody('exportData');

    expect(reportsBody).not.toContain('const productName = sp.venue_products.name');
    expect(exportBody).not.toMatch(/const\s+venueName\s*=\s*shift\.venues\.name/);
    expect(exportBody).not.toMatch(/\|\|\s*shift\.venues\.name/);
  });

  test('экстренное восстановление авторизации не падает без активной сессии', () => {
    expect(source).not.toContain('if (session.session.user)');
    expect(source).not.toContain('user: !!session.session.user');
  });
});
