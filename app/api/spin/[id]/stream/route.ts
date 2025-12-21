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
            const sendEvent = (event: string, data: unknown) => {
                controller.enqueue(
                    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
                );
            };

            // Check session exists
            const session = await getSession(id);
            if (!session) {
                sendEvent("error", { message: "Session not found" });
                controller.close();
                return;
            }

            // If already chosen, send immediately
            if (session.status === "chosen") {
                sendEvent("chosen", {
                    chosenIndex: session.chosenIndex,
                    chosenItem: session.items[session.chosenIndex!],
                });
                controller.close();
                return;
            }

            // Poll for changes (Vercel Edge has limits, so we poll every 500ms for max 60s)
            const maxWait = 60000; // 60 seconds
            const pollInterval = 500;
            let elapsed = 0;

            const poll = async () => {
                if (elapsed >= maxWait) {
                    sendEvent("timeout", { message: "No choice made in time" });
                    controller.close();
                    return;
                }

                try {
                    const currentSession = await getSession(id);

                    if (!currentSession) {
                        sendEvent("error", { message: "Session expired" });
                        controller.close();
                        return;
                    }

                    if (currentSession.status === "chosen") {
                        sendEvent("chosen", {
                            chosenIndex: currentSession.chosenIndex,
                            chosenItem: currentSession.items[currentSession.chosenIndex!],
                        });
                        controller.close();
                        return;
                    }

                    if (currentSession.status === "expired") {
                        sendEvent("expired", { message: "Session expired" });
                        controller.close();
                        return;
                    }

                    // Send heartbeat to keep connection alive
                    sendEvent("heartbeat", { elapsed });

                    elapsed += pollInterval;
                    setTimeout(poll, pollInterval);
                } catch (error) {
                    console.error("SSE poll error:", error);
                    sendEvent("error", { message: "Server error" });
                    controller.close();
                }
            };

            // Start polling
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

