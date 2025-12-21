import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "randomizer-items";

export type WheelStatus = "idle" | "waiting" | "spinning";

export function useWheel() {
    const [items, setItems] = useState<string[]>([]);
    const [status, setStatus] = useState<WheelStatus>("idle");
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLanding, setIsLanding] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            if (spinIntervalRef.current) {
                clearInterval(spinIntervalRef.current);
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

    // Start continuous spin animation
    const startContinuousSpin = useCallback(() => {
        if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
        }
        
        spinIntervalRef.current = setInterval(() => {
            setRotation(prev => prev + 30); // Rotate 30 degrees every 50ms
        }, 50);
    }, []);

    // Stop continuous spin and land on specific index
    const stopSpinOnIndex = useCallback((winnerIndex: number, currentItems: string[]) => {
        if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
            spinIntervalRef.current = null;
        }

        setStatus("spinning");
        setIsLanding(true);

        const singleSegment = 360 / currentItems.length;
        const winnerAngle = winnerIndex * singleSegment;
        const currentRot = rotation;
        const minSpinAmount = 360 * 3; // Less spins since already spinning
        const randomOffset = (Math.random() - 0.5) * (singleSegment * 0.8);

        const targetBase = -winnerAngle + randomOffset;
        let target = targetBase;
        while (target < currentRot + minSpinAmount) {
            target += 360;
        }

        setRotation(target);

        setTimeout(() => {
            setStatus("idle");
            setIsLanding(false);
            setWinner(currentItems[winnerIndex]);
        }, 4000);
    }, [rotation]);

    // Get random winner index
    const getRandomWinnerIndex = useCallback((itemCount: number): number => {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        return randomValues[0] % itemCount;
    }, []);

    // Fallback to random selection
    const fallbackToRandom = useCallback((currentItems: string[]) => {
        const winnerIndex = getRandomWinnerIndex(currentItems.length);
        stopSpinOnIndex(winnerIndex, currentItems);
    }, [getRandomWinnerIndex, stopSpinOnIndex]);

    // Main spin function
    const spin = useCallback(async () => {
        if (items.length < 2 || status !== "idle") return;

        setStatus("waiting");
        setWinner(null);
        setError(null);

        // Start spinning immediately
        startContinuousSpin();

        try {
            // Check subscriber count first
            const subResponse = await fetch("/api/telegram/subscribe");
            const { count } = await subResponse.json();

            if (count === 0) {
                // No subscribers - use random immediately
                fallbackToRandom(items);
                return;
            }

            // Create spin session and send to Telegram
            const response = await fetch("/api/spin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) {
                fallbackToRandom(items);
                return;
            }

            const { sessionId } = await response.json();

            // Connect to SSE to wait for choice
            const eventSource = new EventSource(`/api/spin/${sessionId}/stream`);
            eventSourceRef.current = eventSource;

            eventSource.addEventListener("chosen", (event) => {
                const data = JSON.parse(event.data);
                eventSource.close();
                eventSourceRef.current = null;
                stopSpinOnIndex(data.chosenIndex, items);
            });

            eventSource.addEventListener("timeout", () => {
                eventSource.close();
                eventSourceRef.current = null;
                // Timeout - fallback to random
                fallbackToRandom(items);
            });

            eventSource.addEventListener("expired", () => {
                eventSource.close();
                eventSourceRef.current = null;
                fallbackToRandom(items);
            });

            eventSource.addEventListener("error", () => {
                eventSource.close();
                eventSourceRef.current = null;
                fallbackToRandom(items);
            });

        } catch {
            // Any error - fallback to random
            fallbackToRandom(items);
        }
    }, [items, status, startContinuousSpin, fallbackToRandom, stopSpinOnIndex]);

    // Cancel (for internal use)
    const cancelSpin = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
            spinIntervalRef.current = null;
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
        spinning,
        status,
        rotation,
        winner,
        error,
        isLanding,
    };
}
