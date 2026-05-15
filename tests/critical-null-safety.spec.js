const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const mainJsPath = path.join(__dirname, '..', 'main.js');

test.describe('критичная защита от nullable-данных Supabase', () => {
    test('не возвращает прямые обращения к nullable session/JOIN/fallback данным', () => {
        const source = fs.readFileSync(mainJsPath, 'utf8');
        const unsafePatterns = [
            {
                pattern: /session\.session\.user/,
                reason: 'session может быть null при отсутствии авторизации'
            },
            {
                pattern: /!!\s*session\.session\b/,
                reason: 'логирование не должно падать при null session'
            },
            {
                pattern: /if\s*\(\s*session\.session\b/,
                reason: 'проверка сессии должна учитывать null session'
            },
            {
                pattern: /venues\.find\([^\n]+\)\.name/,
                reason: 'заведение может быть удалено или не загружено'
            },
            {
                pattern: /products\.find\([^\n]+\)\.name/,
                reason: 'позиция может быть удалена или не загружена'
            },
            {
                pattern: /const\s+venueName\s*=\s*venue\.name\s*\|\|/,
                reason: 'рендер смен не должен падать без связанного заведения'
            },
            {
                pattern: /const\s+productName\s*=\s*sp\.venue_products\.name\s*\|\|/,
                reason: 'Supabase JOIN venue_products может вернуть null'
            },
            {
                pattern: /shift\.venues\.name/,
                reason: 'экспорт не должен требовать отсутствующий JOIN venues'
            },
            {
                pattern: /venueId:\s*venue\.id/,
                reason: 'openVenueModal вызывается без аргумента при добавлении заведения'
            }
        ];

        for (const { pattern, reason } of unsafePatterns) {
            expect(source, reason).not.toMatch(pattern);
        }
    });

    test('сохраняет fallback-логику для существующих данных с удалёнными связями', () => {
        const source = fs.readFileSync(mainJsPath, 'utf8');

        expect(source).toContain('const activeSession = session && session.session ? session.session : null;');
        expect(source).toContain("const venueName = venue && venue.name ? venue.name : (shift.is_workday ? 'Не указано' : 'Выходной');");
        expect(source).toContain('const product = products.find(p => p.id === sp.product_id);');
        expect(source).toContain("const productName = (sp.venue_products && sp.venue_products.name) ||");
        expect(source).toContain('const linkedVenue = shift.venues || venues.find(venue => venue.id === shift.venue_id);');
    });
});
