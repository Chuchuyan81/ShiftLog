// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Запуск тестов параллельно */
  fullyParallel: true,
  /* Запрет на использование теста только локально */
  forbidOnly: !!process.env.CI,
  /* Количество повторных попыток при ошибке в CI */
  retries: process.env.CI ? 2 : 0,
  /* Количество воркеров для запуска тестов */
  workers: process.env.CI ? 1 : undefined,
  /* Репорт результатов тестирования */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  /* Общие настройки для всех тестов */
  use: {
    /* URL приложения */
    baseURL: 'http://localhost:3003',
    
    /* Собирать скриншоты при неудаче */
    screenshot: 'only-on-failure',
    
    /* Записывать видео при неудаче */
    video: 'retain-on-failure',
    
    /* Записывать трассировку при неудаче */
    trace: 'on-first-retry',
    
    /* Таймаут для действий */
    actionTimeout: 10000,
    
    /* Таймаут для навигации */
    navigationTimeout: 30000,
    
    /* Игнорировать HTTPS ошибки */
    ignoreHTTPSErrors: true,
    
    /* Локаль */
    locale: 'ru-RU',
    
    /* Таймзона */
    timezoneId: 'Europe/Moscow',
  },

  /* Конфигурация проектов для разных браузеров и устройств */
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    /* Мобильные браузеры */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Планшеты */
    {
      name: 'tablet-chrome',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* Запуск локального сервера перед тестами */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3003',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
}); 