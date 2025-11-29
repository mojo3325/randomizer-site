import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "randomizer-items";

export function useWheel() {
    const [items, setItems] = useState<string[]>([]);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);

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

    const spin = useCallback(() => {
        if (items.length < 2 || spinning) return;

        setSpinning(true);
        setWinner(null);

        // Pick a random winner index
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        const winnerIndex = randomValues[0] % items.length;

        // Calculate rotation
        // Each segment is (360 / items.length) degrees
        // We want the pointer (at top, 0deg) to point to the winner.
        // If we rotate the wheel, the segment at the top changes.
        // Let's say we rotate CLOCKWISE.
        // To land on index i, we need the wheel to rotate such that segment i is at 0deg.
        // Segment 0 starts at 0deg. Segment 1 starts at 360/N deg, etc.
        // Actually, usually 0 is at top.
        // Let's assume standard math: 0 is at 0 degrees (top).
        // Segment angle = 360 / N.
        // Center of segment i is at i * SegmentAngle + SegmentAngle/2.
        // To bring that to the top (0 or 360), we need to rotate by -(i * SegmentAngle + SegmentAngle/2).
        // We add extra full spins (e.g. 5 * 360).

        const segmentAngle = 360 / items.length;
        // Target angle for the center of the winning segment to align with the pointer (assumed at 0 deg)
        // We want: currentRotation + delta = target
        // target should be such that (target % 360) aligns the winner.
        // Actually, simpler:
        // The wheel rotates. The pointer is fixed.
        // If we rotate by X degrees, the item at (0 - X) is at the top.
        // We want item[winnerIndex] to be at the top.
        // So we want the wheel's rotation to be such that the winner is at the top.
        // Let's say items are arranged clockwise 0, 1, 2...
        // If we rotate -360/N, item 1 comes to top.
        // So to get item i to top, we rotate by -i * (360/N).
        // Let's add some randomness within the segment for realism? No, center is fine for now.
        // Let's add 5-8 full spins.

        const fullSpins = 360 * (5 + Math.floor(Math.random() * 3));
        const targetRotation = fullSpins - (winnerIndex * segmentAngle);

        // We accumulate rotation so it always spins forward (or backward consistently)
        // Current rotation might be huge.
        // Let's just add to the current rotation.

        // We need to find the next multiple of 360 that is > current, plus the offset.
        // Actually, let's just add a large amount relative to current.

        // Better logic:
        // We want to land on 'winnerIndex'.
        // That means final rotation % 360 should place winnerIndex at top.
        // If items are drawn 0..N clockwise.
        // 0 is at 0-X deg.
        // We want winnerIndex to be at 0 deg (top).
        // So finalRotation = - (winnerIndex * segmentAngle) + K * 360.
        // But we want to animate from currentRotation.
        // So we find a K such that finalRotation > currentRotation + minSpins.

        const singleSegment = 360 / items.length;
        // The angle where the winner is centered, relative to the start of the wheel (0 index)
        const winnerAngle = winnerIndex * singleSegment;

        // We want the wheel to end up such that `winnerAngle` is at the top (0 degrees).
        // Since the wheel rotates, we need to rotate the wheel by `-winnerAngle` (plus full turns).
        // But we are likely already at some rotation.
        // Let's normalize current rotation to 0..360 for calculation, then add back?
        // No, just keep increasing.

        const currentRot = rotation;
        const minSpinAmount = 360 * 5;
        const randomOffset = (Math.random() - 0.5) * (singleSegment * 0.8); // Randomness within segment

        // We want finalRot = currentRot + minSpinAmount + adjustment
        // The adjustment must ensure we land on the winner.
        // Let's say we just add minSpinAmount. Where do we land?
        // (currentRot + minSpinAmount) % 360.
        // We want to land at (360 - winnerAngle) % 360. (Because positive rotation moves index 0 away)
        // Wait, if we rotate +10 degrees, index 0 moves to 10 degrees? Or -10?
        // Usually CSS rotate(Xdeg) rotates clockwise.
        // If 0 is at top, and we rotate +90, 0 is at right.
        // The pointer is at top. So now index that was at -90 (or 270) is at top.
        // So if we rotate +Angle, the item at index `Angle / SegmentAngle` (counter-clockwise) is at top.
        // Let's stick to: We want the final rotation to be such that the winner is under the pointer.

        // Let's just use a simple target calculation:
        // We want to rotate to `target`.
        // `target` = currentRot + minSpinAmount + remainder.
        // We calculate the exact angle we want to end up at.
        // We want to end up at `-winnerAngle` (plus some multiple of 360).
        // So `target = -winnerAngle + K * 360`.
        // We find K such that `target > currentRot + minSpinAmount`.

        const targetBase = -winnerAngle + randomOffset;
        let target = targetBase;
        while (target < currentRot + minSpinAmount) {
            target += 360;
        }

        setRotation(target);

        // Wait for animation to finish
        setTimeout(() => {
            setSpinning(false);
            setWinner(items[winnerIndex]);
        }, 4000); // 4 seconds spin

    }, [items, rotation, spinning]);

    return {
        items,
        addItem,
        removeItem,
        clearItems,
        spin,
        spinning,
        rotation,
        winner,
    };
}
