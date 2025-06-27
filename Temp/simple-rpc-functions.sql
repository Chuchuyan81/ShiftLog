-- Простая функция для создания заведения
CREATE OR REPLACE FUNCTION create_venue(venue_name TEXT, venue_payout NUMERIC DEFAULT 0)
RETURNS JSON AS $$
DECLARE
    result JSON;
    new_venue_id UUID;
BEGIN
    -- Создаем новое заведение
    INSERT INTO venues (user_id, name, default_fixed_payout)
    VALUES (auth.uid(), venue_name, venue_payout)
    RETURNING id INTO new_venue_id;
    
    -- Возвращаем результат в виде JSON
    SELECT json_build_object(
        'id', new_venue_id,
        'user_id', auth.uid(),
        'name', venue_name,
        'default_fixed_payout', venue_payout,
        'created_at', now()
    ) INTO result;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Простая функция для создания позиции
CREATE OR REPLACE FUNCTION create_product(
    product_name TEXT,
    product_price NUMERIC,
    product_commission_type TEXT,
    product_commission_value NUMERIC
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    new_product_id UUID;
BEGIN
    -- Создаем новую позицию
    INSERT INTO user_products (user_id, name, price_per_unit, commission_type, commission_value)
    VALUES (auth.uid(), product_name, product_price, product_commission_type, product_commission_value)
    RETURNING id INTO new_product_id;
    
    -- Возвращаем результат в виде JSON
    SELECT json_build_object(
        'id', new_product_id,
        'user_id', auth.uid(),
        'name', product_name,
        'price_per_unit', product_price,
        'commission_type', product_commission_type,
        'commission_value', product_commission_value,
        'created_at', now()
    ) INTO result;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 