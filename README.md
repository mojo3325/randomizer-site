# Randomizer Site

3D-сцена с ретро-телевизором и интерактивным рандомайзером. Результат выбирается через Telegram бота.

## Как это работает

1. Пользователь на сайте добавляет варианты и нажимает "SPIN"
2. Telegram бот отправляет сообщение с кнопками выбора всем подписчикам
3. Первый кто нажмёт кнопку - определяет результат
4. Колесо на сайте "приземляется" на выбранный вариант

## Настройка

### 1. Создайте Telegram бота

1. Напишите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Скопируйте токен бота

### 2. Создайте Upstash Redis

1. Зарегистрируйтесь на [console.upstash.com](https://console.upstash.com)
2. Создайте новую Redis базу
3. Скопируйте `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`

### 3. Настройте переменные окружения

Создайте файл `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Запустите проект

```bash
npm install
npm run dev
```

### 5. Зарегистрируйте webhook

После деплоя на Vercel (или при использовании ngrok для тестирования):

1. Обновите `NEXT_PUBLIC_APP_URL` на ваш публичный URL
2. Откройте в браузере: `https://your-domain.vercel.app/api/telegram/setup-webhook`
3. Вы увидите подтверждение регистрации webhook

### 6. Подпишитесь на бота

Напишите `/start` вашему боту в Telegram, чтобы подписаться на уведомления.

## API Endpoints

- `POST /api/spin` - создать сессию и отправить в Telegram
- `GET /api/spin/[id]/stream` - SSE для ожидания выбора
- `POST /api/telegram/webhook` - webhook для Telegram
- `GET /api/telegram/setup-webhook` - регистрация webhook
- `GET /api/telegram/subscribe` - количество подписчиков

## Deploy on Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в настройках проекта
3. Задеплойте
4. Вызовите `/api/telegram/setup-webhook` для регистрации webhook
