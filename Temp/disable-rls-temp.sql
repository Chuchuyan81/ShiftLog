-- ВРЕМЕННОЕ отключение RLS для тестирования
-- ВНИМАНИЕ: Это снижает безопасность! Используйте только для тестирования!

-- Отключаем RLS на таблице venues
ALTER TABLE venues DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на таблице user_products  
ALTER TABLE user_products DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на таблице shifts
ALTER TABLE shifts DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на таблице shift_products
ALTER TABLE shift_products DISABLE ROW LEVEL SECURITY;

-- Добавляем триггер для автоматической подстановки user_id
CREATE OR REPLACE FUNCTION auto_set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Если user_id не указан, подставляем текущего пользователя
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггеры для автоматической подстановки user_id
DROP TRIGGER IF EXISTS auto_user_id_venues ON venues;
CREATE TRIGGER auto_user_id_venues
    BEFORE INSERT ON venues
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id();

DROP TRIGGER IF EXISTS auto_user_id_products ON user_products;
CREATE TRIGGER auto_user_id_products
    BEFORE INSERT ON user_products
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id();

DROP TRIGGER IF EXISTS auto_user_id_shifts ON shifts;
CREATE TRIGGER auto_user_id_shifts
    BEFORE INSERT ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id();

-- Сообщение об успешном выполнении
SELECT 'RLS временно отключен. Триггеры для автоматической подстановки user_id созданы.' as result; 