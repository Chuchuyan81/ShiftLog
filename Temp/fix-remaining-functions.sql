-- ИСПРАВЛЕНИЕ ОСТАВШИХСЯ ФУНКЦИЙ
-- Только create_product и create_venue

-- Функция create_product
-- Полностью удаляем все возможные варианты функции
DROP FUNCTION IF EXISTS public.create_product(text, numeric, text, numeric, uuid);
DROP FUNCTION IF EXISTS public.create_product(text, numeric, text, numeric);
DROP FUNCTION IF EXISTS public.create_product;

-- Создаем заново с безопасными настройками
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
-- Полностью удаляем все возможные варианты функции
DROP FUNCTION IF EXISTS public.create_venue(text, numeric);
DROP FUNCTION IF EXISTS public.create_venue(text);
DROP FUNCTION IF EXISTS public.create_venue;

-- Создаем заново с безопасными настройками
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

-- Проверка результата
SELECT 
    'Remaining Functions Check' as test_name,
    routine_name,
    CASE 
        WHEN routine_name IN ('create_product', 'create_venue') THEN '✅ Исправлена'
        ELSE '✅ Другая функция'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN ('create_product', 'create_venue')
ORDER BY routine_name;
