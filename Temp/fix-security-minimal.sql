-- МИНИМАЛЬНОЕ ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ
-- Исправляет только основные функции без рисков

-- Исправление 1: auto_set_user_id (с триггерами)
DROP TRIGGER IF EXISTS auto_user_id_products ON user_products;
DROP TRIGGER IF EXISTS auto_user_id_shifts ON shifts;
DROP TRIGGER IF EXISTS auto_user_id_venues ON venues;

-- Пересоздаем функцию с безопасными настройками
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

-- Исправление 2: update_updated_at_column (если есть триггеры)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER  
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
