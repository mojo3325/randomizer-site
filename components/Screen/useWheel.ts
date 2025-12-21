import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "randomizer-items";
const TELEGRAM_TIMEOUT_MS = 5000; // 5 seconds to wait for Telegram choice

export type WheelStatus = "idle" | "waiting" | "spinning";

// Check if we're in development mode
const isDevelopment = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export function useWheel() {
    const [items, setItems] = useState<string[]>([]);
    const [status, setStatus] = useState<WheelStatus>("idle");
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [isLanding, setIsLanding] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
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

    // Start continuous spinning animation
    const startContinuousSpin = useCallback(() => {
        if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
        }
        spinIntervalRef.current = setInterval(() => {
            setRotation(prev => prev + 25);
        }, 50);
    }, []);

    // Stop spinning and land on specific winner
    const landOnWinner = useCallback((winnerIndex: number, currentItems: string[]) => {
        // Stop continuous spin
        if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
            spinIntervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        setStatus("spinning");
        setIsLanding(true);

        // Calculate final rotation to land on winner
        const singleSegment = 360 / currentItems.length;
        const winnerAngle = winnerIndex * singleSegment;
        const currentRot = rotation;
        const minSpinAmount = 360 * 4;
        const randomOffset = (Math.random() - 0.5) * (singleSegment * 0.7);

        const targetBase = -winnerAngle + randomOffset;
        let target = targetBase;
        while (target < currentRot + minSpinAmount) {
            target += 360;
        }

        setRotation(target);

        // Complete animation after 4 seconds
        setTimeout(() => {
            setStatus("idle");
            setIsLanding(false);
            setWinner(currentItems[winnerIndex]);
        }, 4000);
    }, [rotation]);

    // Main spin function
    const spin = useCallback(async () => {
        if (items.length < 2 || status !== "idle") return;

        setStatus("waiting");
        setWinner(null);

        // Start continuous spinning animation immediately
        startContinuousSpin();

        // DEVELOPMENT MODE: Always use random immediately
        if (isDevelopment) {
            console.log("[DEV] Using local random");
            setTimeout(() => {
                const winnerIndex = getRandomWinnerIndex(items.length);
                landOnWinner(winnerIndex, items);
            }, 1500); // Small delay for visual effect
            return;
        }

        // PRODUCTION MODE: Wait for Telegram choice
        try {
            const response = await fetch("/api/spin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) {
                // API error - fallback to random
                const winnerIndex = getRandomWinnerIndex(items.length);
                landOnWinner(winnerIndex, items);
                return;
            }

            const { sessionId, subscriberCount } = await response.json();

            if (subscriberCount === 0) {
                // No subscribers - use random immediately
                console.log("[PROD] No subscribers, using random");
                const winnerIndex = getRandomWinnerIndex(items.length);
                landOnWinner(winnerIndex, items);
                return;
            }

            // Has subscribers - wait for their choice via SSE
            console.log("[PROD] Waiting for Telegram choice...");
            
            const eventSource = new EventSource(`/api/spin/${sessionId}/stream`);
            eventSourceRef.current = eventSource;

            // Set timeout - if no choice in 5 seconds, fallback to random
            timeoutRef.current = setTimeout(() => {
                console.log("[PROD] Timeout - falling back to random");
                eventSource.close();
                eventSourceRef.current = null;
                const winnerIndex = getRandomWinnerIndex(items.length);
                landOnWinner(winnerIndex, items);
            }, TELEGRAM_TIMEOUT_MS);

            eventSource.addEventListener("chosen", (event) => {
                console.log("[PROD] Received choice from Telegram");
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                const data = JSON.parse(event.data);
                eventSource.close();
                eventSourceRef.current = null;
                landOnWinner(data.chosenIndex, items);
            });

            eventSource.addEventListener("timeout", () => {
                console.log("[PROD] Server timeout");
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                eventSource.close();
                eventSourceRef.current = null;
                const winnerIndex = getRandomWinnerIndex(items.length);
                landOnWinner(winnerIndex, items);
            });

            eventSource.onerror = () => {
                console.log("[PROD] SSE error - falling back to random");
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                eventSource.close();
                eventSourceRef.current = null;
                const winnerIndex = getRandomWinnerIndex(items.length);
                landOnWinner(winnerIndex, items);
            };

        } catch (e) {
            console.error("[PROD] API error:", e);
            const winnerIndex = getRandomWinnerIndex(items.length);
            landOnWinner(winnerIndex, items);
        }
    }, [items, status, startContinuousSpin, getRandomWinnerIndex, landOnWinner]);

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
