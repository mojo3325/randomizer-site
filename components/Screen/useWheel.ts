import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "randomizer-items";

export type WheelStatus = "idle" | "spinning";

export function useWheel() {
    const [items, setItems] = useState<string[]>([]);
    const [status, setStatus] = useState<WheelStatus>("idle");
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [isLanding, setIsLanding] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Backwards compatibility
    const spinning = status === "spinning";

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
            setItems(["Pizza", "Burger", "Sushi", "Tacos"]);
        }
    }, []);

    // Save to local storage whenever items change
    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items]);

    // Cleanup on unmount
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

    // Get random winner index using crypto
    const getRandomWinnerIndex = useCallback((itemCount: number): number => {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        return randomValues[0] % itemCount;
    }, []);

    // Main spin function
    const spin = useCallback(async () => {
        if (items.length < 2 || status !== "idle") return;

        setStatus("spinning");
        setWinner(null);
        setIsLanding(true);

        // Calculate winner immediately (local random)
        const winnerIndex = getRandomWinnerIndex(items.length);

        // Calculate final rotation
        const singleSegment = 360 / items.length;
        const winnerAngle = winnerIndex * singleSegment;
        const minSpinAmount = 360 * 5;
        const randomOffset = (Math.random() - 0.5) * (singleSegment * 0.8);

        const targetBase = -winnerAngle + randomOffset;
        let target = targetBase;
        while (target < rotation + minSpinAmount) {
            target += 360;
        }

        setRotation(target);

        // Try to notify Telegram in background (non-blocking)
        try {
            const response = await fetch("/api/spin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (response.ok) {
                const { sessionId, subscriberCount } = await response.json();

                if (subscriberCount > 0) {
                    const eventSource = new EventSource(`/api/spin/${sessionId}/stream`);
                    eventSourceRef.current = eventSource;

                    setTimeout(() => {
                        eventSource.close();
                        eventSourceRef.current = null;
                    }, 30000);

                    eventSource.addEventListener("chosen", (event) => {
                        const data = JSON.parse(event.data);
                        eventSource.close();
                        eventSourceRef.current = null;
                        console.log("Telegram chose:", items[data.chosenIndex]);
                    });

                    eventSource.onerror = () => {
                        eventSource.close();
                        eventSourceRef.current = null;
                    };
                }
            }
        } catch {
            // API not available, continue with local random
        }

        // Complete animation after 4 seconds
        setTimeout(() => {
            setStatus("idle");
            setIsLanding(false);
            setWinner(items[winnerIndex]);
        }, 4000);
    }, [items, status, rotation, getRandomWinnerIndex]);

    return {
        items,
        addItem,
        removeItem,
        clearItems,
        spin,
        spinning,
        status,
        rotation,
        winner,
        isLanding,
    };
}
