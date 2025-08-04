# Быстрый старт: Развертывание на Vercel

## Краткий чек-лист

### ✅ Подготовка (5 минут)
- [ ] Аккаунт на GitHub
- [ ] Аккаунт на Vercel  
- [ ] Аккаунт на Supabase
- [ ] Форк репозитория

### ✅ Настройка Supabase (10 минут)
- [ ] Создать проект в Supabase
- [ ] Выполнить SQL-скрипт создания таблиц
- [ ] Скопировать Project URL и anon key
- [ ] Настроить Site URL и Redirect URLs

### ✅ Настройка кода (2 минуты)
- [ ] Заменить `SUPABASE_URL` в `main.js` (строка 1)
- [ ] Заменить `SUPABASE_ANON_KEY` в `main.js` (строка 2)
- [ ] Закоммитить изменения в GitHub

### ✅ Развертывание на Vercel (3 минуты)
- [ ] Импортировать репозиторий в Vercel
- [ ] Framework: `Other`
- [ ] Добавить переменные окружения (опционально)
- [ ] Нажать Deploy

### ✅ Финальная проверка (5 минут)
- [ ] Открыть сайт в браузере
- [ ] Протестировать регистрацию
- [ ] Создать заведение и продукт
- [ ] Добавить смену
- [ ] Проверить PWA (установить на устройство)

## Основные файлы

```
main.js           # Основная логика (обновить конфигурацию Supabase)
vercel.json       # Конфигурация Vercel (уже настроена)
manifest.json     # PWA манифест
sw.js             # Service Worker
_headers          # Заголовки безопасности
_redirects        # Перенаправления для SPA
```

## Важные URL

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com/
- **GitHub**: https://github.com/YOUR_USERNAME/ShiftLog

## Переменные окружения

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

## Команды для локальной разработки

```bash
# Клонирование
git clone https://github.com/YOUR_USERNAME/ShiftLog.git
cd ShiftLog

# Локальный сервер
npm start
# или
npx http-server -p 8080

# Тестирование
npm test
```

## Быстрая диагностика

Откройте DevTools (F12) и выполните:

```javascript
// Проверка состояния приложения
window.checkAppState();

// Экстренная диагностика
window.emergencyDiagnose();

// Проверка подключения к Supabase
window.diagnoseConnection();
```

## Часто встречающиеся проблемы

| Проблема | Решение |
|----------|---------|
| Белый экран | Проверить переменные Supabase |
| Ошибка входа | Настроить Site URL в Supabase |
| Не сохраняются данные | Проверить RLS политики |
| PWA не устанавливается | Проверить HTTPS и manifest.json |

## Время развертывания

- **Опытный разработчик**: 15-20 минут
- **Начинающий**: 30-45 минут
- **Первый раз**: 1-2 часа (с изучением)

**Готово!** 🚀 Ваш проект развернут на Vercel!

📖 Подробная инструкция: `ИНСТРУКЦИЯ_РАЗВЕРТЫВАНИЯ_VERCEL.md` 