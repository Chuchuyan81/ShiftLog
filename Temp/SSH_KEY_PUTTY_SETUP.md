# Настройка SSH ключей через PuTTY для деплоя на Beget

## 🔧 Установка и настройка PuTTY

### 1. Скачивание PuTTY
- Скачайте PuTTY с официального сайта: https://www.putty.org/
- Или используйте portable версию: https://www.putty.org/download.html

### 2. Генерация SSH ключа через PuTTYgen

#### Шаг 1: Запуск PuTTYgen
1. Найдите и запустите `puttygen.exe`
2. В окне "PuTTY Key Generator" выберите:
   - **Type of key to generate**: RSA
   - **Number of bits in a generated key**: 4096

#### Шаг 2: Генерация ключа
1. Нажмите кнопку **"Generate"**
2. Двигайте мышкой в пустой области для генерации случайности
3. Дождитесь завершения генерации

#### Шаг 3: Настройка ключа
1. В поле **"Key comment"** введите: `github-actions@beget.com`
2. В поле **"Key passphrase"** оставьте пустым (для автоматического деплоя)
3. Нажмите **"Save private key"** - сохраните как `github_actions_key.ppk`
4. Нажмите **"Save public key"** - сохраните как `github_actions_key.pub`

## 📋 Получение ключей для настройки

### 1. Публичный ключ (для Beget)
Откройте файл `github_actions_key.pub` в блокноте. Содержимое должно выглядеть примерно так:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC... github-actions@beget.com
```

### 2. Приватный ключ (для GitHub)
1. В PuTTYgen нажмите **"Conversions"** → **"Export OpenSSH key"**
2. Сохраните файл как `github_actions_key_openssh`
3. Откройте файл в блокноте - это будет приватный ключ для GitHub

## 🔑 Добавление ключей

### 1. Добавление публичного ключа на Beget
1. Войдите в панель управления Beget: https://cp.beget.com
2. Найдите раздел **"SSH"** или **"SSH-доступ"**
3. Нажмите **"Добавить ключ"**
4. Вставьте содержимое файла `github_actions_key.pub`
5. Сохраните

### 2. Добавление приватного ключа в GitHub
1. Перейдите в ваш репозиторий: https://github.com/Chuchuyan81/ShiftLog
2. Settings → Secrets and variables → Actions
3. Нажмите **"New repository secret"**
4. Имя: `SSH_PRIVATE_KEY`
5. Значение: вставьте содержимое файла `github_actions_key_openssh`

## 🧪 Тестирование подключения

### 1. Настройка PuTTY для подключения
1. Запустите `putty.exe`
2. В поле **"Host Name"** введите: `chuchuc3.beget.tech`
3. В поле **"Port"** введите: `22`
4. В разделе **"Connection type"** выберите: **SSH**

### 2. Настройка приватного ключа
1. В левом меню перейдите в **"Connection"** → **"SSH"** → **"Auth"**
2. В поле **"Private key file for authentication"** нажмите **"Browse"**
3. Выберите файл `github_actions_key.ppk`
4. Нажмите **"Open"**

### 3. Подключение
1. Введите логин: `chuchuc3`
2. Если все настроено правильно, вы должны подключиться без пароля

## 📁 Создание директории на сервере

После успешного подключения выполните команды:
```bash
mkdir -p ~/shiftlog/public_html
chmod 755 ~/shiftlog/public_html
echo "<h1>Сайт настраивается</h1>" > ~/shiftlog/public_html/index.html
```

## ✅ Проверка настройки

### 1. Тест деплоя
После настройки всех ключей сделайте пуш в GitHub:
```bash
git commit --allow-empty -m "Тест SSH деплоя"
git push origin main
```

### 2. Проверка логов
1. Перейдите в GitHub → Actions
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

### Проблема: "Connection refused"
1. Проверьте правильность домена: `chuchuc3.beget.tech`
2. Убедитесь, что SSH доступен на Beget
3. Проверьте настройки файрвола

### Проблема: "Key format error"
1. Убедитесь, что используете правильный формат ключа
2. Для GitHub используйте OpenSSH формат (через Conversions → Export OpenSSH key)
3. Для Beget используйте публичный ключ

## 📋 Альтернативный способ (если PuTTY не работает)

### Генерация через командную строку Windows:
```cmd
# Установите OpenSSH (если не установлен)
# В Windows 10/11: Settings → Apps → Optional features → Add feature → OpenSSH Client

# Генерация ключа
ssh-keygen -t rsa -b 4096 -C "github-actions@beget.com"
# Сохраните в: C:\Users\Admin\.ssh\github_actions_key

# Просмотр публичного ключа
type C:\Users\Admin\.ssh\github_actions_key.pub

# Просмотр приватного ключа
type C:\Users\Admin\.ssh\github_actions_key
```

## 🎯 Готово!

После настройки каждый пуш в ветку `main` будет автоматически деплоить изменения на ваш сайт `chuchuc3.beget.tech`.

## 🔗 Полезные ссылки

- [PuTTY Download](https://www.putty.org/)
- [PuTTY Documentation](https://www.putty.org/docs.html)
- [Beget SSH Setup](https://beget.com/ru/help/managers/ssh)
- [GitHub SSH Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) 