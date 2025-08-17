# Инструкция по настройке деплоя на Beget.com

## 🔧 Настройка SSH ключей

### 1. Генерация SSH ключа
```bash
# Создайте SSH ключ для GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions@beget.com"
# Сохраните в файл: ~/.ssh/github_actions_key
```

### 2. Добавление публичного ключа на Beget
```bash
# Скопируйте содержимое публичного ключа
cat ~/.ssh/github_actions_key.pub
```

**В панели управления Beget:**
1. Войдите в панель управления Beget
2. Перейдите в раздел "SSH ключи"
3. Добавьте новый ключ с содержимым из команды выше

### 3. Настройка секрета в GitHub
1. Перейдите в ваш репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Нажмите "New repository secret"
4. Имя: `SSH_PRIVATE_KEY`
5. Значение: содержимое приватного ключа
```bash
cat ~/.ssh/github_actions_key
```

## 🚀 Настройка сервера Beget

### 1. Подключение к серверу
```bash
ssh chuchuc3@chuchuc3.beget.tech
```

### 2. Создание директории для сайта
```bash
# Перейдите в домашнюю директорию
cd ~

# Создайте директорию для проекта
mkdir -p shiftlog/public_html

# Перейдите в директорию сайта
cd shiftlog/public_html

# Создайте тестовый файл
echo "<h1>Сайт настраивается</h1>" > index.html
```

### 3. Настройка прав доступа
```bash
# Установите правильные права
chmod 755 ~/shiftlog/public_html
chmod 644 ~/shiftlog/public_html/*
```

## 📋 Проверка настройки

### 1. Тест SSH подключения
```bash
# Проверьте подключение с вашего компьютера
ssh -i ~/.ssh/github_actions_key chuchuc3@chuchuc3.beget.tech
```

### 2. Тест деплоя
После настройки секретов в GitHub, сделайте пуш в ветку `main`:
```bash
git add .
git commit -m "Тестовый деплой"
git push origin main
```

### 3. Проверка логов
В GitHub репозитории:
1. Перейдите в Actions
2. Найдите последний запущенный workflow
3. Проверьте логи на наличие ошибок

## 🔍 Устранение проблем

### Проблема: "Permission denied"
```bash
# Проверьте права на директорию
ls -la ~/shiftlog/public_html

# Установите правильные права
chmod 755 ~/shiftlog
chmod 755 ~/shiftlog/public_html
```

### Проблема: "SSH key not found"
1. Проверьте, что секрет `SSH_PRIVATE_KEY` добавлен в GitHub
2. Убедитесь, что публичный ключ добавлен в Beget
3. Проверьте формат ключа (должен начинаться с `-----BEGIN OPENSSH PRIVATE KEY-----`)

### Проблема: "Connection refused"
1. Проверьте правильность домена: `chuchuc3.beget.tech`
2. Убедитесь, что SSH доступен на Beget
3. Проверьте настройки файрвола

## 📁 Структура файлов на сервере

После успешного деплоя на сервере должна быть структура:
```
~/shiftlog/public_html/
├── index.html
├── app.js
├── style.css
├── manifest.json
├── sw.js
├── vercel.json
└── package.json
```

## ✅ Готово!

После настройки каждый пуш в ветку `main` будет автоматически деплоить изменения на ваш сайт `chuchuc3.beget.tech`.

## 🔗 Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Beget SSH Setup](https://beget.com/ru/help/managers/ssh)
- [SSH Key Generation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) 