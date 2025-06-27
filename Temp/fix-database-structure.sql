-- Исправление структуры базы данных
-- Переход от user_products к venue_products

-- 1. Создаем новую таблицу venue_products
CREATE TABLE venue_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price_per_unit NUMERIC NOT NULL DEFAULT 0,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('fixed', 'percentage')),
    commission_value NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(venue_id, name) -- Уникальность услуги в рамках заведения
);

-- 2. Создаем индекс для производительности
CREATE INDEX idx_venue_products_venue_id ON venue_products(venue_id);

-- 3. Включаем RLS для новой таблицы
ALTER TABLE venue_products ENABLE ROW LEVEL SECURITY;

-- 4. Создаем RLS политики для venue_products
CREATE POLICY "Users can view venue products through venues" ON venue_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = venue_products.venue_id 
            AND venues.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create venue products through venues" ON venue_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = venue_products.venue_id 
            AND venues.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update venue products through venues" ON venue_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = venue_products.venue_id 
            AND venues.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete venue products through venues" ON venue_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = venue_products.venue_id 
            AND venues.user_id = auth.uid()
        )
    );

-- 5. Обновляем таблицу shift_products - меняем ссылку на venue_products
ALTER TABLE shift_products 
    DROP CONSTRAINT IF EXISTS shift_products_product_id_fkey,
    ADD CONSTRAINT shift_products_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES venue_products(id) ON DELETE CASCADE;

-- 6. Миграция данных из user_products в venue_products
-- ВНИМАНИЕ: Это приведет к потере данных, если у пользователя несколько заведений
-- Рекомендуется выполнить миграцию данных вручную

-- 7. Комментарии
COMMENT ON TABLE venue_products IS 'Услуги/позиции заведений';
COMMENT ON COLUMN venue_products.venue_id IS 'ID заведения, к которому относится услуга';

-- 8. После успешной миграции можно удалить старую таблицу
-- DROP TABLE user_products CASCADE;

SELECT 'Структура базы данных обновлена. Теперь услуги связаны с заведениями.' as result; 