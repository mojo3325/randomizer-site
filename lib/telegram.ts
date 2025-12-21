const TELEGRAM_API = "https://api.telegram.org/bot";

function getBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable");
    }
    return token;
}

interface InlineKeyboardButton {
    text: string;
    callback_data: string;
}

interface SendMessageOptions {
    chatId: number | string;
    text: string;
    replyMarkup?: {
        inline_keyboard: InlineKeyboardButton[][];
    };
}

export async function sendMessage(options: SendMessageOptions): Promise<boolean> {
    const token = getBotToken();
    const url = `${TELEGRAM_API}${token}/sendMessage`;

    const body: Record<string, unknown> = {
        chat_id: options.chatId,
        text: options.text,
        parse_mode: "HTML",
    };

    if (options.replyMarkup) {
        body.reply_markup = options.replyMarkup;
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const result = await response.json();
    return result.ok === true;
}

export async function answerCallbackQuery(
    callbackQueryId: string,
    text?: string
): Promise<boolean> {
    const token = getBotToken();
    const url = `${TELEGRAM_API}${token}/answerCallbackQuery`;

    const body: Record<string, unknown> = {
        callback_query_id: callbackQueryId,
    };

    if (text) {
        body.text = text;
        body.show_alert = true;
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const result = await response.json();
    return result.ok === true;
}

export async function editMessageText(
    chatId: number | string,
    messageId: number,
    text: string
): Promise<boolean> {
    const token = getBotToken();
    const url = `${TELEGRAM_API}${token}/editMessageText`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: "HTML",
        }),
    });

    const result = await response.json();
    return result.ok === true;
}

// Build inline keyboard for spin options
export function buildSpinKeyboard(
    sessionId: string,
    items: string[]
): { inline_keyboard: InlineKeyboardButton[][] } {
    // Create rows of 2 buttons each
    const keyboard: InlineKeyboardButton[][] = [];
    for (let i = 0; i < items.length; i += 2) {
        const row: InlineKeyboardButton[] = [];
        row.push({
            text: items[i],
            callback_data: `spin:${sessionId}:${i}`,
        });
        if (items[i + 1]) {
            row.push({
                text: items[i + 1],
                callback_data: `spin:${sessionId}:${i + 1}`,
            });
        }
        keyboard.push(row);
    }
    return { inline_keyboard: keyboard };
}

// Get all subscribers from Redis
export async function getSubscribers(): Promise<string[]> {
    const { getRedis } = await import("./redis");
    const redis = getRedis();
    const subscribers = await redis.smembers("telegram:subscribers");
    return subscribers as string[];
}

// Add subscriber
export async function addSubscriber(chatId: string | number): Promise<void> {
    const { getRedis } = await import("./redis");
    const redis = getRedis();
    await redis.sadd("telegram:subscribers", String(chatId));
}

// Remove subscriber
export async function removeSubscriber(chatId: string | number): Promise<void> {
    const { getRedis } = await import("./redis");
    const redis = getRedis();
    await redis.srem("telegram:subscribers", String(chatId));
}

// Send spin options to all subscribers
export async function broadcastSpinOptions(
    sessionId: string,
    items: string[]
): Promise<number> {
    const subscribers = await getSubscribers();
    const keyboard = buildSpinKeyboard(sessionId, items);

    let sent = 0;
    for (const chatId of subscribers) {
        try {
            const success = await sendMessage({
                chatId,
                text: "🎰 <b>Выбери результат рулетки!</b>\n\nНажми на один из вариантов:",
                replyMarkup: keyboard,
            });
            if (success) sent++;
        } catch (error) {
            console.error(`Failed to send to ${chatId}:`, error);
        }
    }

    return sent;
}

