-- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ: Включение RLS
-- Этот скрипт исправляет ошибки безопасности в базе данных
-- RLS политики созданы, но сам RLS не включен на таблицах

-- ⚠️ ВНИМАНИЕ: Выполнить в Supabase SQL Editor как суперпользователь

BEGIN;

-- Включаем RLS на всех таблицах приложения
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_products ENABLE ROW LEVEL SECURITY;

-- Проверяем статус RLS (для диагностики)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('venues', 'user_products', 'shifts', 'shift_products')
ORDER BY tablename;

COMMIT;

-- Дополнительная проверка политик безопасности
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('venues', 'user_products', 'shifts', 'shift_products')
ORDER BY tablename, policyname;
