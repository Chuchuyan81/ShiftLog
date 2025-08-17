-- ПРОСТОЕ ИСПРАВЛЕНИЕ ПРЕДУПРЕЖДЕНИЙ БЕЗОПАСНОСТИ
-- Выполнять по частям в случае ошибок

-- Шаг 1: Исправление функций с триггерами
-- Удаляем триггеры для auto_set_user_id
DROP TRIGGER IF EXISTS auto_user_id_products ON user_products;
DROP TRIGGER IF EXISTS auto_user_id_shifts ON shifts;
DROP TRIGGER IF EXISTS auto_user_id_venues ON venues;

-- Пересоздаем функцию auto_set_user_id с безопасными настройками
CREATE OR REPLACE FUNCTION public.auto_set_user_id()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$;

-- Восстанавливаем триггеры
CREATE TRIGGER auto_user_id_products
    BEFORE INSERT ON user_products
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id();

CREATE TRIGGER auto_user_id_shifts
    BEFORE INSERT ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id();

CREATE TRIGGER auto_user_id_venues
    BEFORE INSERT ON venues
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_user_id();
