import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { broadcastSpinOptions } from "@/lib/telegram";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items } = body;

        if (!Array.isArray(items) || items.length < 2) {
            return NextResponse.json(
                { error: "At least 2 items required" },
                { status: 400 }
            );
        }

        // Create session in Redis
        const session = await createSession(items);

        // Send to Telegram subscribers
        const sentCount = await broadcastSpinOptions(session.id, items);

        return NextResponse.json({
            sessionId: session.id,
            sentTo: sentCount,
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

