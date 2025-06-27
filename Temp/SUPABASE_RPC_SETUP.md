# 🔧 Настройка RPC функций в Supabase для решения UUID проблемы

## 📋 Проблема
Ошибка `invalid input syntax for type uuid: "undefined"` при создании заведений и позиций.

## ✅ Решение через RPC функции

### 1. Откройте Supabase Dashboard
1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в раздел **SQL Editor**

### 2. Выполните SQL скрипт
Скопируйте и выполните следующий код:

```sql
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
```

### 3. Нажмите кнопку "Run"
После выполнения должно появиться сообщение об успешном создании функций.

## 🧪 Тестирование

1. **Обновите страницу приложения** (Ctrl+F5)
2. **Откройте консоль браузера** (F12)
3. **Попробуйте добавить заведение**
4. **Проверьте логи в консоли** - должны быть попытки:
   - Попытка 1: создание без user_id
   - Попытка 2: создание с user_id  
   - Попытка 3: создание через RPC функцию (если нужно)

## ✅ Ожидаемый результат

В консоли браузера вы увидите:
```
Попытка 1: создание без user_id
Результат создания заведения (без user_id): {data: null, error: {...}}
Попытка 2: создание с user_id
Результат создания заведения (с user_id): {data: null, error: {...}}
Попытка 3: создание через RPC функцию
Результат создания заведения (через RPC): {data: [{...}], error: null}
```

**Если RPC функция работает - заведение будет успешно создано! ✅**

## 🔍 Диагностика

### Если RPC функции не работают:
1. Проверьте, что функции созданы в Supabase SQL Editor
2. Убедитесь, что нет синтаксических ошибок в SQL
3. Проверьте права доступа к функциям

### Если все еще есть ошибки:
1. Откройте **Supabase Dashboard → Authentication → Users**
2. Найдите вашего пользователя и скопируйте его UUID
3. Сравните с UUID в логах консоли - они должны совпадать

## 🎯 Преимущества RPC подхода

- ✅ **Автоматическая подстановка** `auth.uid()`
- ✅ **Обход проблем RLS** политик
- ✅ **Гарантированная валидность** UUID
- ✅ **Безопасность** через `SECURITY DEFINER`

---

**После выполнения этих шагов проблема UUID должна быть полностью решена! 🎉** 