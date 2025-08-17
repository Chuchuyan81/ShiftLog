-- ИСПРАВЛЕНИЕ ПРЕДУПРЕЖДЕНИЙ БЕЗОПАСНОСТИ - ШАГ 2
-- Исправление остальных функций (без триггеров)

-- Удаляем возможные триггеры для update_updated_at_column
DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
DROP TRIGGER IF EXISTS update_user_products_updated_at ON user_products;
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;

-- Пересоздаем функцию update_updated_at_column
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

-- Восстанавливаем триггеры updated_at
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

-- Функция create_product (без триггеров)
-- Полностью удаляем функцию перед пересозданием
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

-- Функция create_venue (без триггеров)
-- Полностью удаляем функцию перед пересозданием
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
