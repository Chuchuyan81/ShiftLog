-- Миграция данных из user_products в venue_products
-- ВАЖНО: Выполнять только после создания новой структуры

-- 1. Создаем временную функцию для миграции
CREATE OR REPLACE FUNCTION migrate_user_products_to_venue_products()
RETURNS TEXT AS $$
DECLARE
    user_record RECORD;
    venue_record RECORD;
    product_record RECORD;
    current_venue_id UUID;
    venues_count INTEGER;
    migrated_count INTEGER := 0;
    warning_message TEXT := '';
BEGIN
    -- Проходим по всем пользователям
    FOR user_record IN SELECT DISTINCT user_id FROM user_products LOOP
        -- Получаем количество заведений пользователя
        SELECT COUNT(*) INTO venues_count FROM venues WHERE user_id = user_record.user_id;
        
        -- Если у пользователя только одно заведение - мигрируем автоматически
        IF venues_count = 1 THEN
            -- Получаем ID единственного заведения
            SELECT id INTO current_venue_id FROM venues WHERE user_id = user_record.user_id LIMIT 1;
            
            -- Мигрируем все продукты этого пользователя в его единственное заведение
            FOR product_record IN 
                SELECT * FROM user_products WHERE user_id = user_record.user_id 
            LOOP
                INSERT INTO venue_products (
                    venue_id, 
                    name, 
                    price_per_unit, 
                    commission_type, 
                    commission_value,
                    created_at
                ) VALUES (
                    current_venue_id,
                    product_record.name,
                    product_record.price_per_unit,
                    product_record.commission_type,
                    product_record.commission_value,
                    product_record.created_at
                );
                
                migrated_count := migrated_count + 1;
            END LOOP;
            
        ELSE
            -- Если у пользователя несколько заведений или ни одного
            warning_message := warning_message || 
                'ВНИМАНИЕ: Пользователь ' || user_record.user_id || 
                ' имеет ' || venues_count || 
                ' заведений. Миграция пропущена.' || E'\n';
        END IF;
    END LOOP;
    
    RETURN 'Мигрировано продуктов: ' || migrated_count || E'\n' || warning_message;
END;
$$ LANGUAGE plpgsql;

-- 2. Выполняем миграцию
SELECT migrate_user_products_to_venue_products();

-- 3. Удаляем временную функцию
DROP FUNCTION migrate_user_products_to_venue_products();

-- 4. Проверяем результат миграции
SELECT 
    'Старых продуктов (user_products): ' || (SELECT COUNT(*) FROM user_products) ||
    ', Новых продуктов (venue_products): ' || (SELECT COUNT(*) FROM venue_products) as migration_result; 