import { NextResponse } from "next/server";

// Call this endpoint once to register your webhook with Telegram
// GET /api/telegram/setup-webhook
export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!token) {
        return NextResponse.json(
            { error: "TELEGRAM_BOT_TOKEN not configured" },
            { status: 500 }
        );
    }

    if (!appUrl) {
        return NextResponse.json(
            { error: "NEXT_PUBLIC_APP_URL not configured" },
            { status: 500 }
        );
    }

    // Remove trailing slash from appUrl if present
    const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
    const webhookUrl = `${baseUrl}/api/telegram/webhook`;

    try {
        // Set webhook
        const response = await fetch(
            `https://api.telegram.org/bot${token}/setWebhook`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: webhookUrl,
                    allowed_updates: ["message", "callback_query"],
                }),
            }
        );

        const result = await response.json();

        if (result.ok) {
            return NextResponse.json({
                success: true,
                message: "Webhook registered successfully",
                webhookUrl,
            });
        } else {
            return NextResponse.json(
                { error: "Failed to set webhook", details: result },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Setup webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

