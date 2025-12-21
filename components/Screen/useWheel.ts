import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "randomizer-items";

export type WheelStatus = "idle" | "waiting" | "spinning";

export function useWheel() {
    const [items, setItems] = useState<string[]>([]);
    const [status, setStatus] = useState<WheelStatus>("idle");
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Backwards compatibility
    const spinning = status === "spinning" || status === "waiting";

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse stored items", e);
            }
        } else {
            // Default items
            setItems(["Pizza", "Burger", "Sushi", "Tacos"]);
        }
    }, []);

    // Save to local storage whenever items change
    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items]);

    // Cleanup SSE on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const addItem = useCallback((item: string) => {
        if (!item.trim()) return;
        setItems((prev) => [...prev, item.trim()]);
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const clearItems = useCallback(() => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Spin to a specific winner index
    const spinToIndex = useCallback((winnerIndex: number, currentItems: string[]) => {
        setStatus("spinning");

        const singleSegment = 360 / currentItems.length;
        const winnerAngle = winnerIndex * singleSegment;
        const currentRot = rotation;
        const minSpinAmount = 360 * 5;
        const randomOffset = (Math.random() - 0.5) * (singleSegment * 0.8);

        const targetBase = -winnerAngle + randomOffset;
        let target = targetBase;
        while (target < currentRot + minSpinAmount) {
            target += 360;
        }

        setRotation(target);

        // Wait for animation to finish
        setTimeout(() => {
            setStatus("idle");
            setWinner(currentItems[winnerIndex]);
        }, 4000);
    }, [rotation]);

    // Main spin function - now uses Telegram integration
    const spin = useCallback(async () => {
        if (items.length < 2 || status !== "idle") return;

        setStatus("waiting");
        setWinner(null);
        setError(null);

        try {
            // Create spin session and send to Telegram
            const response = await fetch("/api/spin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) {
                throw new Error("Failed to create spin session");
            }

            const { sessionId, sentTo } = await response.json();

            if (sentTo === 0) {
                setError("Нет подписчиков в Telegram боте!");
                setStatus("idle");
                return;
            }

            // Connect to SSE to wait for choice
            const eventSource = new EventSource(`/api/spin/${sessionId}/stream`);
            eventSourceRef.current = eventSource;

            eventSource.addEventListener("chosen", (event) => {
                const data = JSON.parse(event.data);
                eventSource.close();
                eventSourceRef.current = null;

                // Spin to the chosen index
                spinToIndex(data.chosenIndex, items);
            });

            eventSource.addEventListener("timeout", () => {
                eventSource.close();
                eventSourceRef.current = null;
                setError("Время ожидания истекло");
                setStatus("idle");
            });

            eventSource.addEventListener("expired", () => {
                eventSource.close();
                eventSourceRef.current = null;
                setError("Сессия истекла");
                setStatus("idle");
            });

            eventSource.addEventListener("error", (event) => {
                console.error("SSE error:", event);
                eventSource.close();
                eventSourceRef.current = null;
                setError("Ошибка соединения");
                setStatus("idle");
            });

        } catch (err) {
            console.error("Spin error:", err);
            setError("Ошибка при запуске");
            setStatus("idle");
        }
    }, [items, status, spinToIndex]);

    // Cancel waiting
    const cancelSpin = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setStatus("idle");
        setError(null);
    }, []);

    return {
        items,
        addItem,
        removeItem,
        clearItems,
        spin,
        cancelSpin,
        spinning, // backwards compat
        status,
        rotation,
        winner,
        error,
    };
}
