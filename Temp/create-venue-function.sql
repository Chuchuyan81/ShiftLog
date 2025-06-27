-- Функция для создания заведения с автоматической подстановкой user_id
CREATE OR REPLACE FUNCTION create_venue(
    venue_name TEXT,
    venue_payout NUMERIC DEFAULT 0
) RETURNS TABLE (
    id UUID,
    user_id UUID,
    name TEXT,
    default_fixed_payout NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO venues (user_id, name, default_fixed_payout)
    VALUES (auth.uid(), venue_name, venue_payout)
    RETURNING venues.id, venues.user_id, venues.name, venues.default_fixed_payout, venues.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для создания позиции с автоматической подстановкой user_id
CREATE OR REPLACE FUNCTION create_product(
    product_name TEXT,
    product_price NUMERIC,
    product_commission_type TEXT,
    product_commission_value NUMERIC
) RETURNS TABLE (
    id UUID,
    user_id UUID,
    name TEXT,
    price_per_unit NUMERIC,
    commission_type TEXT,
    commission_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO user_products (user_id, name, price_per_unit, commission_type, commission_value)
    VALUES (auth.uid(), product_name, product_price, product_commission_type, product_commission_value)
    RETURNING user_products.id, user_products.user_id, user_products.name, 
              user_products.price_per_unit, user_products.commission_type, 
              user_products.commission_value, user_products.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 