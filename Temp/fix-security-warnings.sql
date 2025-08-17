-- ИСПРАВЛЕНИЕ ПРЕДУПРЕЖДЕНИЙ БЕЗОПАСНОСТИ
-- Эти предупреждения менее критичны, чем RLS, но улучшают общую безопасность

-- ⚠️ ВНИМАНИЕ: Выполнить в Supabase SQL Editor как суперпользователь

BEGIN;

-- 1. Исправление функций с изменяемым search_path
-- Устанавливаем фиксированный search_path для всех функций

-- Функция auto_set_user_id (используется триггерами)
-- Сначала удаляем зависимые триггеры
DROP TRIGGER IF EXISTS auto_user_id_products ON user_products;
DROP TRIGGER IF EXISTS auto_user_id_shifts ON shifts;
DROP TRIGGER IF EXISTS auto_user_id_venues ON venues;

-- Теперь можем пересоздать функцию
DROP FUNCTION IF EXISTS public.auto_set_user_id();
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

-- Функция update_updated_at_column (может использоваться триггерами)
-- Удаляем возможные триггеры updated_at
DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
DROP TRIGGER IF EXISTS update_user_products_updated_at ON user_products;
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;

-- Пересоздаем функцию
DROP FUNCTION IF EXISTS public.update_updated_at_column();
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

-- Восстанавливаем триггеры updated_at (если они были)
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_products_updated_at
    BEFORE UPDATE ON user_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Функция create_product
DROP FUNCTION IF EXISTS public.create_product(text, numeric, text, numeric, uuid);
CREATE FUNCTION public.create_product(
    product_name text,
    price_per_unit numeric,
    commission_type text,
    commission_value numeric,
    venue_id uuid
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    new_product_id uuid;
BEGIN
    INSERT INTO user_products (name, price_per_unit, commission_type, commission_value, venue_id, user_id)
    VALUES (product_name, price_per_unit, commission_type, commission_value, venue_id, auth.uid())
    RETURNING id INTO new_product_id;
    
    RETURN new_product_id;
END;
$$;

-- Функция create_venue
DROP FUNCTION IF EXISTS public.create_venue(text, numeric);
DROP FUNCTION IF EXISTS public.create_venue(text);
CREATE FUNCTION public.create_venue(
    venue_name text,
    default_payout numeric DEFAULT 0
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    new_venue_id uuid;
BEGIN
    INSERT INTO venues (name, default_payout, user_id)
    VALUES (venue_name, default_payout, auth.uid())
    RETURNING id INTO new_venue_id;
    
    RETURN new_venue_id;
END;
$$;

COMMIT;

-- Проверка исправлений
SELECT 
    'Function Security Check' as test_name,
    routine_name,
    routine_type,
    security_type,
    CASE 
        WHEN security_type = 'DEFINER' THEN '✅ SECURITY DEFINER установлен'
        ELSE '⚠️ Проверить безопасность функции'
    END as security_status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN ('auto_set_user_id', 'update_updated_at_column', 'create_product', 'create_venue')
ORDER BY routine_name;
