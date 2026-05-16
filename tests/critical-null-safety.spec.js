const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

test.describe('Критичная защита от null после загрузки данных', () => {
    test('добавление заведения не читает поля у null в openVenueModal', () => {
        expect(mainJs).not.toContain('venueId: venue.id');
        expect(mainJs).not.toContain('venueName: venue.name');
        expect(mainJs).not.toContain('isValidId: venue.id');
        expect(mainJs).toContain('venueId: venue && venue.id ? venue.id : null');
    });

    test('исторические смены и отчеты не используют прямые nullable JOIN обращения', () => {
        expect(mainJs).toContain('function getVenueNameById');
        expect(mainJs).toContain('function getShiftProductName');
        expect(mainJs).toContain('function getReportVenueName');
        expect(mainJs).not.toMatch(/venues\.find\([^)]*\)\.name/);
        expect(mainJs).not.toMatch(/products\.find\([^)]*\)\.name/);
        expect(mainJs).not.toContain('sp.venue_products.name ||');
        expect(mainJs).not.toContain('shift.venues.name ||');
    });
});
