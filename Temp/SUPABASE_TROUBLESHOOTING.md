# 🔧 Решение проблем с Supabase

## 🚨 Ошибка "Failed to fetch"

### Причина 1: Опечатка в URL (ИСПРАВЛЕНО ✅)
```javascript
// БЫЛО (неправильно):
const SUPABASE_URL = 'Yhttps://ukuhwaulkvpqkwqbqqag.supabase.co';

// СТАЛО (правильно):
const SUPABASE_URL = 'https://ukuhwaulkvpqkwqbqqag.supabase.co';
```

### Причина 2: Неправильные настройки в Supabase

#### Шаг 1: Проверьте URL и ключи
1. Откройте [supabase.com](https://supabase.com)
2. Выберите ваш проект
3. Перейдите в **Settings → API**
4. Проверьте:
   - **Project URL**: `https://ukuhwaulkvpqkwqbqqag.supabase.co`
   - **anon public key**: должен начинаться с `eyJhbGciOiJIUzI1NiI...`

#### Шаг 2: Настройте Site URL
1. В Supabase перейдите: **Authentication → Settings**
2. Найдите **Site URL**
3. Добавьте URL вашего приложения:
   - Для локального тестирования: `http://localhost:3003`
   - Для Netlify: `https://your-app-name.netlify.app`
4. Нажмите **Save**

#### Шаг 3: Настройте Redirect URLs
В том же разделе **Authentication → Settings**:
1. Найдите **Redirect URLs**
2. Добавьте:
   - `http://localhost:3003/**` (для локального тестирования)
   - `https://your-app-name.netlify.app/**` (для Netlify)

### Причина 3: База данных не создана

#### Выполните SQL скрипт:
1. В Supabase откройте **SQL Editor**
2. Создайте новый запрос (New Query)
3. Скопируйте содержимое файла `supabase-setup.sql`
4. Нажмите **Run** (или Ctrl+Enter)
5. Убедитесь, что нет ошибок

#### Проверьте созданные таблицы:
1. Перейдите в **Database → Tables**
2. Должны быть таблицы:
   - `venues`
   - `user_products`
   - `shifts`
   - `shift_products`

### Причина 4: Проблемы с RLS (Row Level Security)

#### Проверьте RLS политики:
1. В **Database → Tables** выберите таблицу
2. Перейдите на вкладку **Authentication**
3. Убедитесь, что есть политики:
   - `Users can view own [table]`
   - `Users can create own [table]`
   - `Users can update own [table]`
   - `Users can delete own [table]`

## 🧪 Тестирование подключения

### Быстрый тест:
1. Откройте файл `test-connection.html` в браузере
2. Нажмите "Тест подключения"
3. Проверьте результаты

### Ручной тест в консоли браузера:
```javascript
// Откройте консоль (F12) и выполните:
console.log('Supabase URL:', 'https://ukuhwaulkvpqkwqbqqag.supabase.co');
console.log('Supabase работает:', !!window.supabase);

// Проверьте подключение:
supabase.auth.getSession().then(result => {
    console.log('Результат подключения:', result);
});
```

## 📋 Чек-лист устранения проблем

### 1. Проверка файла app.js ✅
- [ ] URL правильный (без лишних букв)
- [ ] Ключ правильный
- [ ] Нет опечаток

### 2. Проверка настроек Supabase
- [ ] Site URL добавлен
- [ ] Redirect URLs настроены
- [ ] Проект активен

### 3. Проверка базы данных
- [ ] SQL скрипт выполнен
- [ ] Таблицы созданы
- [ ] RLS политики активны

### 4. Проверка браузера
- [ ] Очистить кеш (Ctrl+F5)
- [ ] Проверить консоль на ошибки (F12)
- [ ] Попробовать в другом браузере

## 🔄 Пошаговое решение

### Если до сих пор не работает:

1. **Пересоздайте проект Supabase:**
   - Создайте новый проект
   - Выполните SQL скрипт
   - Обновите URL и ключи в app.js

2. **Проверьте интернет-соединение:**
   - Откройте https://ukuhwaulkvpqkwqbqqag.supabase.co в браузере
   - Должна открыться страница Supabase

3. **Проверьте CORS:**
   - Убедитесь, что ваш домен добавлен в Site URL
   - Попробуйте с `localhost:3003`

## 📞 Получить помощь

Если проблема не решилась:
1. Откройте `test-connection.html`
2. Сделайте скриншот результатов тестов
3. Проверьте консоль браузера (F12) на ошибки
4. Опишите проблему с деталями

---

**После исправления проблем приложение должно работать! ✅** 