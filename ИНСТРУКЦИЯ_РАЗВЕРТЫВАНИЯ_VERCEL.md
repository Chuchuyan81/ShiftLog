# Инструкция по развертыванию проекта "Журнал Рабочих Смен" на Vercel

## Что это за проект?

**Журнал Рабочих Смен** - это PWA (Progressive Web App) для учета рабочих смен, продаж и заработка. Приложение использует:
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 
- **Backend**: Supabase (PostgreSQL, Authentication, PostgREST)
- **PWA**: Service Worker для оффлайн работы
- **Деплой**: Vercel (статический хостинг)

## Предварительные требования

### 1. Аккаунты
- ✅ Аккаунт на [GitHub](https://github.com) (для кода)
- ✅ Аккаунт на [Vercel](https://vercel.com) (для хостинга)
- ✅ Аккаунт на [Supabase](https://supabase.com) (для базы данных)

### 2. Инструменты
- ✅ Git (для работы с репозиторием)
- ✅ Текстовый редактор (для настройки конфигурации)

## Пошаговое развертывание

### Шаг 1: Подготовка базы данных Supabase

#### 1.1 Создание проекта Supabase
1. Зайдите на [supabase.com](https://supabase.com)
2. Нажмите **"New project"**
3. Выберите организацию
4. Заполните данные:
   - **Name**: `shift-log-app` (или любое имя)
   - **Database Password**: создайте надежный пароль
   - **Region**: выберите ближайший к вам регион
5. Нажмите **"Create new project"**
6. Дождитесь создания проекта (2-3 минуты)

#### 1.2 Настройка базы данных
1. В панели Supabase перейдите в **SQL Editor**
2. Создайте новый запрос и выполните SQL-скрипт создания таблиц:

```sql
-- Создание таблицы заведений
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы продуктов/услуг
CREATE TABLE user_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_type VARCHAR(20) DEFAULT 'percentage',
    commission_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы смен
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    shift_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working BOOLEAN DEFAULT false,
    fixed_payout DECIMAL(10,2) DEFAULT 0,
    tips DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы продаж в смене
CREATE TABLE shift_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES user_products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Включение RLS (Row Level Security)
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_products ENABLE ROW LEVEL SECURITY;

-- Создание политик безопасности
CREATE POLICY "Users can view their own venues" ON venues
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own venues" ON venues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own venues" ON venues
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own venues" ON venues
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own products" ON user_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON user_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON user_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON user_products
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own shifts" ON shifts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shifts" ON shifts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shifts" ON shifts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shifts" ON shifts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view shift products of their shifts" ON shift_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert shift products for their shifts" ON shift_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update shift products of their shifts" ON shift_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete shift products of their shifts" ON shift_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM shifts 
            WHERE shifts.id = shift_products.shift_id 
            AND shifts.user_id = auth.uid()
        )
    );

-- Создание индексов для оптимизации
CREATE INDEX idx_venues_user_id ON venues(user_id);
CREATE INDEX idx_user_products_user_id ON user_products(user_id);
CREATE INDEX idx_shifts_user_id ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shift_products_shift_id ON shift_products(shift_id);
CREATE INDEX idx_shift_products_product_id ON shift_products(product_id);
```

#### 1.3 Получение данных подключения
1. Перейдите в **Settings** → **API**
2. Скопируйте и сохраните:
   - **Project URL** (например: `https://your-project-id.supabase.co`)
   - **anon public key** (длинный JWT токен)

### Шаг 2: Подготовка кода

#### 2.1 Форк репозитория
1. Перейдите на GitHub страницу проекта
2. Нажмите **"Fork"** в правом верхнем углу
3. Выберите свой аккаунт
4. Дождитесь создания форка

#### 2.2 Клонирование репозитория
```bash
git clone https://github.com/ВАШ_ЛОГИН/ShiftLog.git
cd ShiftLog
```

#### 2.3 Настройка конфигурации Supabase
1. Откройте файл `main.js`
2. Найдите строки 1-2 и замените на ваши данные:

```javascript
// ЗАМЕНИТЬ НА ВАШИ ДАННЫЕ SUPABASE
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'ваш_anon_ключ_из_Settings_API';
```

3. Сохраните изменения
4. Закоммитьте изменения:

```bash
git add main.js
git commit -m "Обновлена конфигурация Supabase"
git push origin main
```

### Шаг 3: Создание проекта в Vercel

#### 3.1 Импорт репозитория
1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"New Project"**
3. Выберите **"Import Git Repository"**
4. Найдите ваш форк `ShiftLog`
5. Нажмите **"Import"**

#### 3.2 Настройка проекта
1. **Project Name**: `shift-log-app` (или любое имя)
2. **Framework Preset**: `Other` (это статический сайт)
3. **Root Directory**: оставить пустым
4. **Build Command**: оставить пустым (статический сайт)
5. **Install Command**: оставить пустым
6. **Output Directory**: оставить пустым

#### 3.3 Переменные окружения
1. Раскройте секцию **"Environment Variables"**
2. Добавьте переменные:

| Name | Value |
|------|--------|
| `SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `SUPABASE_ANON_KEY` | `ваш_anon_ключ` |

3. Нажмите **"Deploy"**

### Шаг 4: Настройка после деплоя

#### 4.1 Настройка домена (опционально)
1. В панели Vercel перейдите в **Settings** → **Domains**
2. Добавьте свой домен или используйте предоставленный `.vercel.app`

#### 4.2 Настройка заголовков безопасности
1. В панели Vercel перейдите в **Settings** → **Headers**
2. Добавьте заголовки безопасности:

```json
[
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "X-Frame-Options",
        "value": "SAMEORIGIN"
      },
      {
        "key": "X-Content-Type-Options",
        "value": "nosniff"
      },
      {
        "key": "Referrer-Policy",
        "value": "strict-origin-when-cross-origin"
      },
      {
        "key": "X-XSS-Protection",
        "value": "1; mode=block"
      },
      {
        "key": "Strict-Transport-Security",
        "value": "max-age=31536000; includeSubDomains"
      }
    ]
  }
]
```

#### 4.3 Настройка перенаправлений для SPA
1. В панели Vercel перейдите в **Settings** → **Redirects**
2. Добавьте правило для SPA:

```json
[
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

### Шаг 5: Финальная проверка

#### 5.1 Проверка работоспособности
1. Откройте ваш сайт в браузере
2. Попробуйте зарегистрироваться
3. Создайте заведение и продукт
4. Добавьте смену
5. Проверьте PWA функциональность

#### 5.2 Настройка аутентификации в Supabase
1. В панели Supabase перейдите в **Authentication** → **URL Configuration**
2. Добавьте ваш домен в **Site URL**: `https://your-app.vercel.app`
3. Добавьте в **Redirect URLs**: `https://your-app.vercel.app/**`

## Обновление приложения

### Автоматическое обновление
Vercel автоматически пересобирает и деплоит приложение при каждом push в главную ветку.

### Ручное обновление
1. Внесите изменения в код
2. Закоммитьте изменения:
```bash
git add .
git commit -m "Описание изменений"
git push origin main
```
3. Vercel автоматически запустит новый деплой

## Мониторинг и отладка

### Логи в Vercel
1. Перейдите в панель Vercel
2. Выберите ваш проект
3. Перейдите в **Functions** → **View Function Logs**

### Отладка в браузере
1. Откройте DevTools (F12)
2. Проверьте Console на ошибки
3. Используйте функции отладки:
   - `window.emergencyDiagnose()` - диагностика состояния
   - `window.checkAppState()` - проверка состояния приложения
   - `window.diagnoseConnection()` - проверка подключения к Supabase

## Резервное копирование

### Бэкап базы данных
1. В панели Supabase перейдите в **Settings** → **Database**
2. Нажмите **"Download backup"**
3. Сохраните SQL дамп

### Бэкап кода
Код автоматически сохраняется в GitHub. Дополнительно можно:
1. Создать релиз в GitHub
2. Скачать архив с кодом

## Безопасность

### Важные моменты:
- ✅ RLS политики настроены в Supabase
- ✅ Переменные окружения защищены в Vercel
- ✅ HTTPS принудительно включен
- ✅ Заголовки безопасности настроены

### Рекомендации:
1. Регулярно обновляйте пароли
2. Мониторьте логи на подозрительную активность
3. Используйте только HTTPS
4. Регулярно делайте бэкапы

## Поддержка

### Часто встречающиеся проблемы:

**Проблема**: Приложение не загружается
**Решение**: Проверьте переменные окружения в Vercel и настройки Supabase

**Проблема**: Ошибка аутентификации
**Решение**: Проверьте Site URL и Redirect URLs в настройках Supabase

**Проблема**: Данные не сохраняются
**Решение**: Проверьте RLS политики в Supabase и права доступа

### Контакты для поддержки:
- GitHub Issues: для багов и предложений
- Email: для критичных вопросов
- Documentation: [Vercel Docs](https://vercel.com/docs), [Supabase Docs](https://supabase.com/docs)

---

**Поздравляем!** 🎉 Ваше приложение "Журнал Рабочих Смен" успешно развернуто на Vercel и готово к использованию! 