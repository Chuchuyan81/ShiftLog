-- Создание таблиц для приложения "Журнал Рабочих Смен"

-- Таблица заведений
CREATE TABLE venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    default_fixed_payout NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица пользовательских позиций/услуг
CREATE TABLE user_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price_per_unit NUMERIC NOT NULL DEFAULT 0,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('fixed', 'percentage')),
    commission_value NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Таблица смен
CREATE TABLE shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shift_date DATE NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    is_workday BOOLEAN NOT NULL DEFAULT true,
    fixed_payout NUMERIC NOT NULL DEFAULT 0,
    tips NUMERIC NOT NULL DEFAULT 0,
    revenue_generated NUMERIC NOT NULL DEFAULT 0,
    earnings NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица продуктов смены (связующая)
CREATE TABLE shift_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES user_products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price_snapshot NUMERIC NOT NULL,
    commission_snapshot NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание индексов для производительности
CREATE INDEX idx_venues_user_id ON venues(user_id);
CREATE INDEX idx_user_products_user_id ON user_products(user_id);
CREATE INDEX idx_shifts_user_id ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shift_products_shift_id ON shift_products(shift_id);

-- Включение Row Level Security (RLS)
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_products ENABLE ROW LEVEL SECURITY;

-- Создание RLS политик

-- Политики для таблицы venues
CREATE POLICY "Users can view own venues" ON venues
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own venues" ON venues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own venues" ON venues
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own venues" ON venues
    FOR DELETE USING (auth.uid() = user_id);

-- Политики для таблицы user_products
CREATE POLICY "Users can view own products" ON user_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products" ON user_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON user_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON user_products
    FOR DELETE USING (auth.uid() = user_id);

-- Политики для таблицы shifts
CREATE POLICY "Users can view own shifts" ON shifts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shifts" ON shifts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts" ON shifts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shifts" ON shifts
    FOR DELETE USING (auth.uid() = user_id);

-- Политики для таблицы shift_products
CREATE POLICY "Users can view shift products through shifts" ON shift_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create shift products through shifts" ON shift_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update shift products through shifts" ON shift_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete shift products through shifts" ON shift_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at в таблице shifts
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создание ограничения уникальности для смен (одна смена в день в одном заведении)
ALTER TABLE shifts ADD CONSTRAINT unique_user_venue_date 
    UNIQUE (user_id, venue_id, shift_date);

-- Комментарии к таблицам
COMMENT ON TABLE venues IS 'Заведения пользователя';
COMMENT ON TABLE user_products IS 'Позиции/услуги пользователя';
COMMENT ON TABLE shifts IS 'Рабочие смены';
COMMENT ON TABLE shift_products IS 'Продажи по сменам';

-- Комментарии к важным столбцам
COMMENT ON COLUMN shifts.revenue_generated IS 'Выручка за смену для заведения (расчетное поле)';
COMMENT ON COLUMN shifts.earnings IS 'Заработок сотрудника за смену (расчетное поле)';
COMMENT ON COLUMN shift_products.price_snapshot IS 'Цена продукта в момент продажи';
COMMENT ON COLUMN shift_products.commission_snapshot IS 'Комиссия в момент продажи'; 