import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (ev: string, data: unknown) => {
                controller.enqueue(
                    encoder.encode(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`)
                );
            };

            const session = await getSession(id);
            if (!session) {
                send("e", { m: 1 });
                controller.close();
                return;
            }

            if (session.status === "chosen") {
                send("c", {
                    i: session.chosenIndex,
                });
                controller.close();
                return;
            }

            const maxWait = 60000;
            const interval = 500;
            let elapsed = 0;

            const poll = async () => {
                if (elapsed >= maxWait) {
                    send("t", { m: 0 });
                    controller.close();
                    return;
                }

                try {
                    const s = await getSession(id);

                    if (!s) {
                        send("e", { m: 2 });
                        controller.close();
                        return;
                    }

                    if (s.status === "chosen") {
                        send("c", {
                            i: s.chosenIndex,
                        });
                        controller.close();
                        return;
                    }

                    if (s.status === "expired") {
                        send("x", { m: 3 });
                        controller.close();
                        return;
                    }

                    send("h", { t: elapsed });

                    elapsed += interval;
                    setTimeout(poll, interval);
                } catch {
                    send("e", { m: 4 });
                    controller.close();
                }
            };

            poll();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}

