import { useState, useEffect, useCallback, useRef } from "react";
import { playSound } from "@/utils/sound";

const STORAGE_KEY = "randomizer-items";
const TELEGRAM_TIMEOUT_MS = 5000; // 5 seconds - if no choice, pick random

const isDevelopment = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export type WheelStatus = "idle" | "spinning" | "landing";

export function useWheel() {
    const [items, setItems] = useState<string[]>([]);
    const [status, setStatus] = useState<WheelStatus>("idle");
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    
    const eventSourceRef = useRef<EventSource | null>(null);
    const animationRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTimeRef = useRef<number>(0);
    const lastTickSegmentRef = useRef<number>(-1);
    const currentRotationRef = useRef<number>(0);
    const itemsRef = useRef<string[]>([]);
    
    // Animation state
    const velocityRef = useRef<number>(0);
    const targetRotationRef = useRef<number | null>(null);
    const isDeceleratingRef = useRef<boolean>(false);
    const winnerIndexRef = useRef<number | null>(null);

    useEffect(() => {
        currentRotationRef.current = rotation;
    }, [rotation]);

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const spinning = status === "spinning" || status === "landing";
    const isLanding = status === "landing";

    // Load from local storage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch {
                // ignore parse errors
            }
        } else {
            setItems(["Pizza", "Burger", "Sushi", "Tacos"]);
        }
    }, []);

    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items]);

    useEffect(() => {
        return () => { cleanup(); };
    }, []);

    const cleanup = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
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

    const getRandomWinnerIndex = useCallback((itemCount: number): number => {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        return randomValues[0] % itemCount;
    }, []);

    const checkTick = useCallback((rot: number, itemCount: number) => {
        if (itemCount === 0) return;
        const segmentSize = 360 / itemCount;
        const currentSegment = Math.floor(((rot % 360) + 360) % 360 / segmentSize);
        
        if (currentSegment !== lastTickSegmentRef.current) {
            lastTickSegmentRef.current = currentSegment;
            playSound("spin");
        }
    }, []);

    // Main animation loop
    const animate = useCallback((timestamp: number) => {
        if (lastTimeRef.current === 0) {
            lastTimeRef.current = timestamp;
        }

        const deltaTime = Math.min(timestamp - lastTimeRef.current, 50); // Cap at 50ms
        lastTimeRef.current = timestamp;
        const dt = deltaTime / 1000;

        let newRotation = currentRotationRef.current;
        let continueAnimation = true;

        if (isDeceleratingRef.current && targetRotationRef.current !== null) {
            // Decelerating towards target
            const target = targetRotationRef.current;
            const distance = target - currentRotationRef.current;
            
            if (distance <= 1) {
                // Close enough, snap to target
                newRotation = target;
                continueAnimation = false;
                
                // Animation complete
                setStatus("idle");
                if (winnerIndexRef.current !== null) {
                    setWinner(itemsRef.current[winnerIndexRef.current]);
                    playSound("win");
                }
                isDeceleratingRef.current = false;
                targetRotationRef.current = null;
                winnerIndexRef.current = null;
            } else {
                // Smooth deceleration using lerp
                // Speed decreases as we approach target
                const progress = 1 - (distance / (distance + velocityRef.current * dt * 60));
                const minSpeed = 30; // Minimum degrees per second
                const speed = Math.max(minSpeed, velocityRef.current * (1 - progress * 0.03));
                velocityRef.current = speed;
                
                newRotation = currentRotationRef.current + speed * dt;
                
                // Don't overshoot
                if (newRotation >= target) {
                    newRotation = target;
                }
            }
        } else {
            // Constant speed spinning
            newRotation = currentRotationRef.current + velocityRef.current * dt;
        }

        setRotation(newRotation);
        checkTick(newRotation, itemsRef.current.length);

        if (continueAnimation) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [checkTick]);

    const startSpinning = useCallback(() => {
        setStatus("spinning");
        lastTimeRef.current = 0;
        lastTickSegmentRef.current = -1;
        velocityRef.current = 720; // Start at 720 deg/sec (2 rotations/sec)
        isDeceleratingRef.current = false;
        targetRotationRef.current = null;
        animationRef.current = requestAnimationFrame(animate);
    }, [animate]);

    const calculateLandingRotation = useCallback((winnerIndex: number, itemCount: number, currentRot: number): number => {
        const segmentSize = 360 / itemCount;
        const segmentCenter = winnerIndex * segmentSize + segmentSize / 2;
        
        // To bring segment N to top: rotate by negative of its center angle
        const targetAngle = -segmentCenter;
        
        // Need at least 3 more full rotations worth of distance
        const minDistance = 360 * 3;
        
        let target = targetAngle;
        while (target <= currentRot + minDistance) {
            target += 360;
        }
        
        // Small random offset for natural feel
        const maxOffset = segmentSize * 0.3;
        const randomOffset = (Math.random() - 0.5) * 2 * maxOffset;
        target += randomOffset;
        
        return target;
    }, []);

    const landOnWinner = useCallback((winnerIndex: number) => {
        const currentItems = itemsRef.current;
        const currentRot = currentRotationRef.current;
        
        const target = calculateLandingRotation(winnerIndex, currentItems.length, currentRot);
        
        setStatus("landing");
        isDeceleratingRef.current = true;
        targetRotationRef.current = target;
        winnerIndexRef.current = winnerIndex;
        // Keep current velocity for smooth transition
    }, [calculateLandingRotation]);

    const spin = useCallback(async () => {
        if (items.length < 2 || status !== "idle") return;

        cleanup();
        setWinner(null);
        startSpinning();

        if (isDevelopment) {
            setTimeout(() => {
                const winnerIndex = getRandomWinnerIndex(itemsRef.current.length);
                landOnWinner(winnerIndex);
            }, 2000);
            return;
        }

        try {
            const response = await fetch("/api/spin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) {
                const winnerIndex = getRandomWinnerIndex(items.length);
                landOnWinner(winnerIndex);
                return;
            }

            const { sessionId, sentTo } = await response.json();

            if (sentTo === 0) {
                setTimeout(() => {
                    const winnerIndex = getRandomWinnerIndex(itemsRef.current.length);
                    landOnWinner(winnerIndex);
                }, 2000);
                return;
            }

            const eventSource = new EventSource(`/api/spin/${sessionId}/stream`);
            eventSourceRef.current = eventSource;

            timeoutRef.current = setTimeout(() => {
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
                const winnerIndex = getRandomWinnerIndex(itemsRef.current.length);
                landOnWinner(winnerIndex);
            }, TELEGRAM_TIMEOUT_MS);

            eventSource.addEventListener("chosen", (event) => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                const data = JSON.parse(event.data);
                eventSource.close();
                eventSourceRef.current = null;
                landOnWinner(data.chosenIndex);
            });

            eventSource.addEventListener("timeout", () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                eventSource.close();
                eventSourceRef.current = null;
                const winnerIndex = getRandomWinnerIndex(itemsRef.current.length);
                landOnWinner(winnerIndex);
            });

            eventSource.onerror = () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                eventSource.close();
                eventSourceRef.current = null;
                const winnerIndex = getRandomWinnerIndex(itemsRef.current.length);
                landOnWinner(winnerIndex);
            };

        } catch {
            const winnerIndex = getRandomWinnerIndex(items.length);
            landOnWinner(winnerIndex);
        }
    }, [items, status, cleanup, startSpinning, getRandomWinnerIndex, landOnWinner]);

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
