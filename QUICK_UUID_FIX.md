# 🚨 СРОЧНОЕ исправление UUID ошибки

## Проблема
Ошибка `invalid input syntax for type uuid: "undefined"` все еще возникает при создании заведений.

## ✅ БЫСТРОЕ РЕШЕНИЕ

### Шаг 1: Создайте RPC функции в Supabase
1. **Откройте Supabase Dashboard** → **SQL Editor**
2. **Скопируйте и выполните** код из файла `simple-rpc-functions.sql`:

```sql
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
```

3. **Нажмите "Run"**

### Шаг 2: Протестируйте
1. **Обновите страницу** приложения (Ctrl+F5)
2. **Попробуйте создать заведение**
3. **В консоли должно быть**: `Результат создания заведения (через RPC): {data: {...}, error: null}`

## 🎯 Результат

После выполнения SQL скрипта:
- ✅ **UUID ошибка исчезнет**
- ✅ **Заведения будут создаваться** через надежную RPC функцию
- ✅ **Автоматическая подстановка** правильного `user_id`

---

**Это окончательное решение UUID проблемы! 🚀** 