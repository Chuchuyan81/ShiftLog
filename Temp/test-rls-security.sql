-- ТЕСТ БЕЗОПАСНОСТИ RLS
-- Выполнить после применения исправлений

-- 1. Проверка статуса RLS на всех таблицах
SELECT 
    'RLS Status Check' as test_name,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS включен'
        ELSE '❌ RLS ОТКЛЮЧЕН - КРИТИЧЕСКАЯ ОШИБКА!'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('venues', 'user_products', 'shifts', 'shift_products')
ORDER BY tablename;

-- 2. Проверка количества политик для каждой таблицы
SELECT 
    'Policy Count Check' as test_name,
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Все политики на месте'
        ELSE '⚠️ Недостаточно политик'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('venues', 'user_products', 'shifts', 'shift_products')
GROUP BY tablename
ORDER BY tablename;

-- 3. Детальная проверка политик
SELECT 
    'Policy Details' as test_name,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN '✅ Использует auth.uid()'
        ELSE '⚠️ Проверить логику политики'
    END as auth_check
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('venues', 'user_products', 'shifts', 'shift_products')
ORDER BY tablename, cmd;

-- 4. Проверка, что таблицы доступны через PostgREST
SELECT 
    'PostgREST Access Check' as test_name,
    table_name,
    CASE 
        WHEN table_schema = 'public' THEN '✅ Доступна через API'
        ELSE '❌ Недоступна через API'
    END as api_status
FROM information_schema.tables 
WHERE table_name IN ('venues', 'user_products', 'shifts', 'shift_products')
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 5. Итоговый отчет
SELECT 
    'ИТОГОВЫЙ ОТЧЕТ' as summary,
    COUNT(*) as total_tables,
    SUM(CASE WHEN rowsecurity = true THEN 1 ELSE 0 END) as rls_enabled_count,
    CASE 
        WHEN COUNT(*) = SUM(CASE WHEN rowsecurity = true THEN 1 ELSE 0 END) 
        THEN '🎉 ВСЕ ТАБЛИЦЫ ЗАЩИЩЕНЫ RLS!'
        ELSE '🚨 ЕСТЬ НЕЗАЩИЩЕННЫЕ ТАБЛИЦЫ!'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('venues', 'user_products', 'shifts', 'shift_products');
