-- ПРОСТОЕ ИСПРАВЛЕНИЕ RLS - выполнить по частям

-- Шаг 1: Включить RLS на всех таблицах
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_products ENABLE ROW LEVEL SECURITY;

-- Шаг 2: Проверка результата (выполнить отдельно)
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('venues', 'user_products', 'shifts', 'shift_products')
ORDER BY tablename;
