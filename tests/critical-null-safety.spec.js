const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'main.js');

test.describe('критичная null safety после ES2020-cleanup', () => {
    test('критичные UI и отчетные пути не используют прямой доступ к nullable JOIN-данным', () => {
        const source = fs.readFileSync(sourcePath, 'utf8');
        const unsafePatterns = [
            /venueId:\s*venue\.id/,
            /venueName:\s*venue\.name/,
            /isValidId:\s*venue\.id/,
            /const\s+venueName\s*=\s*shift\.venues\.name/,
            /const\s+productName\s*=\s*sp\.venue_products\.name/,
            /products\.find\(p => p\.id === [^)]+\)\.name/,
            /venues\.find\([^)]+\)\.name/
        ];
        
        unsafePatterns.forEach(pattern => {
            expect(source, `Найден опасный прямой доступ: ${pattern}`).not.toMatch(pattern);
        });
    });
    
    test('fallback-имена заведений и позиций централизованы в безопасных helper-функциях', () => {
        const source = fs.readFileSync(sourcePath, 'utf8');
        
        expect(source).toContain('function getVenueNameForShift(shift)');
        expect(source).toContain('function getProductNameForShiftProduct(shiftProduct, fallbackName)');
        expect(source).toContain('const venueName = getVenueNameForShift(shift);');
        expect(source).toContain("const productName = getProductNameForShiftProduct(sp, 'Неизвестно');");
    });
});
