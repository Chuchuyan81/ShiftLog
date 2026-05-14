const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

test.describe('критичная защита от null в main.js', () => {
    test('не возвращает прямые обращения к nullable данным сессии', () => {
        expect(mainJs).not.toContain('session.session.user');
        expect(mainJs).not.toContain('!!session.session.user');
    });

    test('не возвращает прямые обращения к nullable связям смен и отчетов', () => {
        expect(mainJs).not.toContain('venues.find(v => v.id === a.venue_id).name');
        expect(mainJs).not.toContain('venues.find(v => v.id === b.venue_id).name');
        expect(mainJs).not.toContain('const venueName = venue.name');
        expect(mainJs).not.toContain('sp.venue_products.name ||');
        expect(mainJs).not.toContain('products.find(p => p.id === sp.product_id).name');
        expect(mainJs).not.toContain('shift.venues.name');
    });

    test('не возвращает прямые обращения к nullable элементам формы', () => {
        expect(mainJs).not.toContain('document.querySelector(\'input[name="workday"]:checked\').value');
        expect(mainJs).not.toContain("document.querySelector('input[name=\"workday\"]:checked').value");
    });

    test('модалка нового заведения не читает свойства null', () => {
        expect(mainJs).not.toContain('venueId: venue.id');
        expect(mainJs).not.toContain('venueName: venue.name');
        expect(mainJs).not.toContain("isValidId: venue.id && venue.id !== 'undefined'");
    });
});
