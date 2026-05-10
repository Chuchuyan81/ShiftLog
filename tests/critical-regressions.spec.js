const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function readProjectFile(fileName) {
    return fs.readFileSync(path.join(rootDir, fileName), 'utf8');
}

test('service worker кэширует те же версии ресурсов, что подключены в HTML', () => {
    const indexHtml = readProjectFile('index.html');
    const serviceWorker = readProjectFile('sw.js');

    const resources = [
        indexHtml.match(/<link rel="stylesheet" href="([^"]+)"/)[1],
        indexHtml.match(/<script src="(supabase-fallback\.js\?v=[^"]+)"/)[1],
        indexHtml.match(/<script src="(main\.js\?v=[^"]+)"/)[1]
    ];

    resources.forEach(resource => {
        expect(serviceWorker).toContain(`'./${resource}'`);
    });
});

test('критичные nullable-связи и пустая auth-сессия имеют явные guard-проверки', () => {
    const mainJs = readProjectFile('main.js');

    expect(mainJs).toContain('venueId: venue ? venue.id : undefined');
    expect(mainJs).toContain('const venueName = (venue && venue.name) ||');
    expect(mainJs).toContain('const productName = (sp.venue_products && sp.venue_products.name) ||');
    expect(mainJs).toContain('const venueName = (shift.venues && shift.venues.name) ||');

    const guardedSessionChecks = mainJs.match(/session && session\.session && session\.session\.user/g) || [];
    expect(guardedSessionChecks.length).toBeGreaterThanOrEqual(2);

    expect(mainJs).not.toContain('venues.find(v => v.id === a.venue_id).name');
    expect(mainJs).not.toContain('const venueName = venue.name ||');
    expect(mainJs).not.toContain('const productName = sp.venue_products.name ||');
    expect(mainJs).not.toContain('products.find(p => p.id === sp.product_id).name');
    expect(mainJs).not.toContain('const venueName = shift.venues.name ||');
});
