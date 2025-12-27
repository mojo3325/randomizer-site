import { NextRequest, NextResponse } from "next/server";
import { addSubscriber, removeSubscriber, getSubscribers } from "@/lib/telegram";

// Add subscriber
export async function POST(request: NextRequest) {
    try {
        const { chatId } = await request.json();

        if (!chatId) {
            return NextResponse.json(
                { error: "chatId required" },
                { status: 400 }
            );
        }

        await addSubscriber(chatId);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Remove subscriber
export async function DELETE(request: NextRequest) {
    try {
        const { chatId } = await request.json();

        if (!chatId) {
            return NextResponse.json(
                { error: "chatId required" },
                { status: 400 }
            );
        }

        await removeSubscriber(chatId);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get subscriber count (for admin/debug)
export async function GET() {
    try {
        const subscribers = await getSubscribers();
        return NextResponse.json({ count: subscribers.length });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

