import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSessionChoice } from "@/lib/session";
import {
    answerCallbackQuery,
    editMessageText,
    sendMessage,
    addSubscriber,
} from "@/lib/telegram";

interface TelegramUpdate {
    update_id: number;
    message?: {
        message_id: number;
        from: { id: number; first_name: string };
        chat: { id: number };
        text?: string;
    };
    callback_query?: {
        id: string;
        from: { id: number; first_name: string };
        message: {
            message_id: number;
            chat: { id: number };
        };
        data: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const update: TelegramUpdate = await request.json();

        // Handle /start command - subscribe user
        if (update.message?.text === "/start") {
            const chatId = update.message.chat.id;
            await addSubscriber(chatId);
            await sendMessage({
                chatId,
                text: "✅ <b>Подписка активирована!</b>\n\nТеперь ты будешь получать уведомления о новых голосованиях рулетки.",
            });
            return NextResponse.json({ ok: true });
        }

        // Handle callback query (button press)
        if (update.callback_query) {
            const { id: queryId, data, from, message } = update.callback_query;

            // Parse callback data: spin:sessionId:itemIndex
            if (data.startsWith("spin:")) {
                const parts = data.split(":");
                if (parts.length !== 3) {
                    await answerCallbackQuery(queryId, "Некорректные данные");
                    return NextResponse.json({ ok: true });
                }

                const sessionId = parts[1];
                const itemIndex = parseInt(parts[2], 10);

                // Get session
                const session = await getSession(sessionId);
                if (!session) {
                    await answerCallbackQuery(queryId, "Сессия истекла!");
                    return NextResponse.json({ ok: true });
                }

                // Check if already chosen
                if (session.status === "chosen") {
                    const chosenItem = session.items[session.chosenIndex!];
                    await answerCallbackQuery(
                        queryId,
                        `Уже выбрано: ${chosenItem}`
                    );
                    return NextResponse.json({ ok: true });
                }

                // Update session with choice
                const updated = await updateSessionChoice(
                    sessionId,
                    itemIndex,
                    from.first_name
                );

                if (!updated) {
                    await answerCallbackQuery(queryId, "Не удалось сохранить выбор");
                    return NextResponse.json({ ok: true });
                }

                const chosenItem = session.items[itemIndex];

                // Confirm to user
                await answerCallbackQuery(queryId, `Ты выбрал: ${chosenItem}!`);

                // Update message to show result
                await editMessageText(
                    message.chat.id,
                    message.message_id,
                    `🎯 <b>Выбрано!</b>\n\n${from.first_name} выбрал: <b>${chosenItem}</b>`
                );

                return NextResponse.json({ ok: true });
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ ok: true }); // Always return 200 to Telegram
    }
}

// Telegram sends GET to verify webhook
export async function GET() {
    return NextResponse.json({ status: "Webhook endpoint active" });
}

