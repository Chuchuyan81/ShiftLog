const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

test.describe('Критичная null-безопасность после замены optional chaining', () => {
    test('модалка нового заведения не обращается к полям null', () => {
        expect(mainJs).toContain('venueId: venue ? venue.id : null');
        expect(mainJs).toContain('venueName: venue ? venue.name : null');
        expect(mainJs).not.toContain('venueId: venue.id');
        expect(mainJs).not.toContain('venueName: venue.name');
    });

    test('журнал смен выдерживает отсутствующие заведения и удаленные позиции', () => {
        expect(mainJs).toContain('foundVenueA && foundVenueA.name');
        expect(mainJs).toContain('const venueName = venue && venue.name ? venue.name');
        expect(mainJs).toContain('(sp.venue_products && sp.venue_products.name)');
        expect(mainJs).toContain('(product && product.name)');

        expect(mainJs).not.toContain('venues.find(v => v.id === a.venue_id).name');
        expect(mainJs).not.toContain('venues.find(v => v.id === b.venue_id).name');
        expect(mainJs).not.toContain('const venueName = venue.name');
        expect(mainJs).not.toContain('const productName = sp.venue_products.name');
        expect(mainJs).not.toContain('products.find(p => p.id === sp.product_id).name');
    });

    test('отчеты и экспорт выдерживают nullable JOIN Supabase', () => {
        expect(mainJs).toContain("sp.venue_products && sp.venue_products.name ? sp.venue_products.name : 'Неизвестно'");
        expect(mainJs).toContain('shift.venues && shift.venues.name ? shift.venues.name');

        expect(mainJs).not.toContain("const productName = sp.venue_products.name || 'Неизвестно'");
        expect(mainJs).not.toContain('const venueName = shift.venues.name');
    });

    test('восстановление авторизации выдерживает отсутствие активной сессии', () => {
        expect(mainJs).toContain('const activeSession = session ? session.session : null');
        expect(mainJs).toContain('const activeUser = activeSession ? activeSession.user : null');

        expect(mainJs).not.toContain('!!session.session.user');
        expect(mainJs).not.toContain('if (session.session.user)');
        expect(mainJs).not.toContain('currentUser = session.session.user');
    });
});
