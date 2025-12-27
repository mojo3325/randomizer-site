import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { broadcastSpinOptions } from "@/lib/telegram";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { d } = body;

        if (!Array.isArray(d) || d.length < 2) {
            return NextResponse.json(
                { e: 1 },
                { status: 400 }
            );
        }

        const session = await createSession(d);
        const cnt = await broadcastSpinOptions(session.id, d);

        return NextResponse.json({
            id: session.id,
            n: cnt,
        });
    } catch {
        return NextResponse.json(
            { e: 2 },
            { status: 500 }
        );
    }
}

