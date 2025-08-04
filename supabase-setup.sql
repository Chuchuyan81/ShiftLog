-- =====================================================
-- СКРИПТ НАСТРОЙКИ БАЗЫ ДАННЫХ SUPABASE
-- Проект: Журнал Рабочих Смен
-- Описание: Создание таблиц, индексов и политик безопасности
-- =====================================================

-- Создание расширений (если нужно)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- СОЗДАНИЕ ТАБЛИЦ
-- =====================================================

-- Таблица заведений
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица продуктов/услуг пользователя
CREATE TABLE IF NOT EXISTS user_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица смен
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    shift_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working BOOLEAN DEFAULT false,
    fixed_payout DECIMAL(10,2) DEFAULT 0,
    tips DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица продаж в смене
CREATE TABLE IF NOT EXISTS shift_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES user_products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(shift_id, product_id)
);

-- =====================================================
-- СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ
-- =====================================================

-- Индексы для быстрого поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_venues_user_id ON venues(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);

-- Индексы для фильтрации и сортировки
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_user_date ON shifts(user_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);
CREATE INDEX IF NOT EXISTS idx_user_products_name ON user_products(name);

-- Индексы для связей
CREATE INDEX IF NOT EXISTS idx_shifts_venue_id ON shifts(venue_id);
CREATE INDEX IF NOT EXISTS idx_shift_products_shift_id ON shift_products(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_products_product_id ON shift_products(product_id);

-- =====================================================
-- ВКЛЮЧЕНИЕ ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- СОЗДАНИЕ ПОЛИТИК БЕЗОПАСНОСТИ
-- =====================================================

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ VENUES
DROP POLICY IF EXISTS "Users can view their own venues" ON venues;
CREATE POLICY "Users can view their own venues" ON venues
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own venues" ON venues;
CREATE POLICY "Users can insert their own venues" ON venues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own venues" ON venues;
CREATE POLICY "Users can update their own venues" ON venues
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own venues" ON venues;
CREATE POLICY "Users can delete their own venues" ON venues
    FOR DELETE USING (auth.uid() = user_id);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USER_PRODUCTS
DROP POLICY IF EXISTS "Users can view their own products" ON user_products;
CREATE POLICY "Users can view their own products" ON user_products
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own products" ON user_products;
CREATE POLICY "Users can insert their own products" ON user_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own products" ON user_products;
CREATE POLICY "Users can update their own products" ON user_products
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own products" ON user_products;
CREATE POLICY "Users can delete their own products" ON user_products
    FOR DELETE USING (auth.uid() = user_id);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ SHIFTS
DROP POLICY IF EXISTS "Users can view their own shifts" ON shifts;
CREATE POLICY "Users can view their own shifts" ON shifts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shifts" ON shifts;
CREATE POLICY "Users can insert their own shifts" ON shifts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shifts" ON shifts;
CREATE POLICY "Users can update their own shifts" ON shifts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shifts" ON shifts;
CREATE POLICY "Users can delete their own shifts" ON shifts
    FOR DELETE USING (auth.uid() = user_id);

-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ SHIFT_PRODUCTS
DROP POLICY IF EXISTS "Users can view shift products of their shifts" ON shift_products;
CREATE POLICY "Users can view shift products of their shifts" ON shift_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert shift products for their shifts" ON shift_products;
CREATE POLICY "Users can insert shift products for their shifts" ON shift_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update shift products of their shifts" ON shift_products;
CREATE POLICY "Users can update shift products of their shifts" ON shift_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete shift products of their shifts" ON shift_products;
CREATE POLICY "Users can delete shift products of their shifts" ON shift_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

-- =====================================================
-- СОЗДАНИЕ ТРИГГЕРОВ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ TIMESTAMPS
-- =====================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для обновления updated_at
DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_products_updated_at ON user_products;
CREATE TRIGGER update_user_products_updated_at
    BEFORE UPDATE ON user_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_products_updated_at ON shift_products;
CREATE TRIGGER update_shift_products_updated_at
    BEFORE UPDATE ON shift_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- СОЗДАНИЕ ПОЛЕЗНЫХ ФУНКЦИЙ
-- =====================================================

-- Функция для получения статистики пользователя
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_venues INTEGER,
    total_products INTEGER,
    total_shifts INTEGER,
    total_revenue DECIMAL(10,2),
    current_month_shifts INTEGER,
    current_month_revenue DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM venues WHERE user_id = user_uuid) as total_venues,
        (SELECT COUNT(*)::INTEGER FROM user_products WHERE user_id = user_uuid) as total_products,
        (SELECT COUNT(*)::INTEGER FROM shifts WHERE user_id = user_uuid) as total_shifts,
        (SELECT COALESCE(SUM(fixed_payout + tips), 0) FROM shifts WHERE user_id = user_uuid) as total_revenue,
        (SELECT COUNT(*)::INTEGER FROM shifts WHERE user_id = user_uuid AND DATE_TRUNC('month', shift_date) = DATE_TRUNC('month', CURRENT_DATE)) as current_month_shifts,
        (SELECT COALESCE(SUM(fixed_payout + tips), 0) FROM shifts WHERE user_id = user_uuid AND DATE_TRUNC('month', shift_date) = DATE_TRUNC('month', CURRENT_DATE)) as current_month_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения заработка за период
CREATE OR REPLACE FUNCTION get_earnings_by_period(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    shift_date DATE,
    venue_name VARCHAR(255),
    fixed_payout DECIMAL(10,2),
    tips DECIMAL(10,2),
    total_earnings DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.shift_date,
        COALESCE(v.name, 'Без заведения') as venue_name,
        s.fixed_payout,
        s.tips,
        (s.fixed_payout + s.tips) as total_earnings
    FROM shifts s
    LEFT JOIN venues v ON s.venue_id = v.id
    WHERE s.user_id = user_uuid
    AND s.shift_date BETWEEN start_date AND end_date
    ORDER BY s.shift_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ГРАНТ ДОСТУПА К ФУНКЦИЯМ
-- =====================================================

-- Даем доступ к функциям аутентифицированным пользователям
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_earnings_by_period(UUID, DATE, DATE) TO authenticated;

-- =====================================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- =====================================================

-- Проверяем, что все таблицы созданы
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venues') THEN
        RAISE EXCEPTION 'Таблица venues не была создана';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_products') THEN
        RAISE EXCEPTION 'Таблица user_products не была создана';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts') THEN
        RAISE EXCEPTION 'Таблица shifts не была создана';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shift_products') THEN
        RAISE EXCEPTION 'Таблица shift_products не была создана';
    END IF;
    
    RAISE NOTICE 'Все таблицы успешно созданы!';
END $$;

-- =====================================================
-- УСПЕШНОЕ ЗАВЕРШЕНИЕ
-- =====================================================

-- Выводим сообщение о успешном завершении
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'НАСТРОЙКА БАЗЫ ДАННЫХ ЗАВЕРШЕНА УСПЕШНО!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Созданы таблицы:';
    RAISE NOTICE '  - venues (заведения)';
    RAISE NOTICE '  - user_products (продукты/услуги)';
    RAISE NOTICE '  - shifts (смены)';
    RAISE NOTICE '  - shift_products (продажи в смене)';
    RAISE NOTICE '';
    RAISE NOTICE 'Настроены:';
    RAISE NOTICE '  - Политики безопасности (RLS)';
    RAISE NOTICE '  - Индексы для оптимизации';
    RAISE NOTICE '  - Триггеры для автоматического обновления';
    RAISE NOTICE '  - Полезные функции';
    RAISE NOTICE '';
    RAISE NOTICE 'Теперь можете использовать базу данных!';
    RAISE NOTICE '==============================================';
END $$; 