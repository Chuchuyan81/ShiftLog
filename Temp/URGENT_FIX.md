# СРОЧНОЕ ИСПРАВЛЕНИЕ UUID ОШИБКИ

## Проблема
Ошибка: `invalid input syntax for type uuid: "undefined"`

## БЫСТРОЕ РЕШЕНИЕ (2 минуты)

### Шаг 1: Выполните SQL скрипт
1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor  
3. Скопируйте и выполните содержимое файла `disable-rls-temp.sql`

### Шаг 2: Перезагрузите приложение
1. Обновите страницу приложения (F5)
2. Попробуйте создать заведение снова

## Что это делает
- Временно отключает RLS (Row Level Security) 
- Добавляет триггеры для автоматической подстановки user_id
- Устраняет проблему с undefined в UUID полях

## ВАЖНО
⚠️ Это временное решение для тестирования
⚠️ После тестирования нужно будет включить RLS обратно

## Если не помогло
Проверьте консоль браузера (F12) и отправьте логи разработчику.

## Включение RLS обратно (после тестирования)
```sql
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;  
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_products ENABLE ROW LEVEL SECURITY;
``` 