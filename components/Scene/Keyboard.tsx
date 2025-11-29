import React, { useRef, useState, useEffect, useMemo } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { playSound } from "@/utils/sound";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIGITS = "1234567890".split("");

const KEYBOARD_CODES: Record<string, string[]> = LETTERS.reduce((acc, letter) => {
    acc[letter] = [`Key${letter}`];
    return acc;
}, {} as Record<string, string[]>);

DIGITS.forEach((digit) => {
    const code = digit === "0" ? "Digit0" : `Digit${digit}`;
    KEYBOARD_CODES[digit] = [code];
});

Object.assign(KEYBOARD_CODES, {
    "-": ["Minus"],
    "=": ["Equal"],
    "[": ["BracketLeft"],
    "]": ["BracketRight"],
    ";": ["Semicolon"],
    "'": ["Quote"],
    ",": ["Comma"],
    ".": ["Period"],
    "/": ["Slash"],
    "Ent": ["Enter"],
    "Back": ["Backspace"],
    "Space": ["Space"],
    "Sft": ["ShiftLeft", "ShiftRight"],
    "Ctrl": ["ControlLeft", "ControlRight"],
    "Alt": ["AltLeft", "AltRight"],
    "Fn": []
});

const KEY_META: Record<string, { width?: number; color?: string; offset?: number; text?: string }> = {
    "Ent": { width: 1.8, color: "#ccc", offset: 0.5, text: "ENTER" },
    "Sft": { width: 1.8, color: "#ccc", offset: 0.5, text: "SHIFT" },
    "Back": { width: 1.8, color: "#cfcfcf", offset: 0.6, text: "BACK" },
    "Ctrl": { width: 1.6, color: "#ccc", text: "CTRL" },
    "Alt": { width: 1.4, color: "#ccc", text: "ALT" },
    "Fn": { width: 1.4, color: "#bbb", text: "FN" },
    "Space": { width: 5, text: "" }
};

const KEY_ROWS = [
    { id: "numbers", z: -2, baseX: -5.5, keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Back"] },
    { id: "qwerty", z: -1, baseX: -5.5, keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"] },
    { id: "asdf", z: 0, baseX: -5.5, keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Ent"] },
    { id: "zxcv", z: 1, baseX: -5.2, keys: ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Sft"] }
] as const;

const playKeyboardSound = () => playSound("keyboard");

function Key({
    position,
    width = 0.8,
    label = "",
    color = "#e0e0e0",
    pressed = false
}: {
    position: [number, number, number];
    width?: number;
    label?: string;
    color?: string;
    pressed?: boolean;
}) {
    const ref = useRef<THREE.Group>(null);
    const [pointerPressed, setPointerPressed] = useState(false);
    const isPressed = pressed || pointerPressed;

    useFrame(() => {
        if (!ref.current) return;
        const targetY = isPressed ? -0.1 : 0;
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, position[1] + targetY, 0.4);
    });

    const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setPointerPressed(true);
        playKeyboardSound();
    };

    const release = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setPointerPressed(false);
    };

    return (
        <group
            ref={ref}
            position={position}
            onPointerDown={handlePointerDown}
            onPointerUp={release}
            onPointerOut={release}
        >
            <RoundedBox args={[width, 0.4, 0.8]} radius={0.05} smoothness={4} castShadow>
                <meshStandardMaterial color={isPressed ? "#d0d0d0" : color} />
            </RoundedBox>
            {label && (
                <Text
                    position={[0, 0.21, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={label.length > 3 ? 0.22 : 0.3}
                    color="#333"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            )}
        </group>
    );
}

export function Keyboard(props: any) {
    const [pressedCodes, setPressedCodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const code = event.code;
            setPressedCodes((prev) => {
                if (prev.has(code)) return prev;
                const next = new Set(prev);
                next.add(code);
                playKeyboardSound();
                return next;
            });
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            const code = event.code;
            setPressedCodes((prev) => {
                if (!prev.has(code)) return prev;
                const next = new Set(prev);
                next.delete(code);
                return next;
            });
        };

        const handleBlur = () => {
            setPressedCodes(new Set());
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    const isKeyPressed = (label: string) => {
        const codes = KEYBOARD_CODES[label];
        if (!codes) return false;
        return codes.some((code) => pressedCodes.has(code));
    };

    return (
        <group {...props}>
            <RoundedBox args={[14, 0.5, 6]} radius={0.2} smoothness={4} position={[0, -0.25, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#dcd3b2" />
            </RoundedBox>

            <group position={[0, 0.1, 0]} rotation={[0.1, 0, 0]}>
                {KEY_ROWS.map((row) => (
                    <React.Fragment key={row.id}>
                        {row.keys.map((keyLabel, index) => {
                            const meta = KEY_META[keyLabel] ?? {};
                            const x = row.baseX + index * 1 + (meta.offset ?? 0);
                            const label = meta.text ?? keyLabel;
                            return (
                                <Key
                                    key={`${row.id}-${keyLabel}-${index}`}
                                    position={[x, 0, row.z]}
                                    label={label}
                                    width={meta.width}
                                    color={meta.color}
                                    pressed={isKeyPressed(keyLabel)}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}

                <Key
                    position={[-4, 0, 2]}
                    width={KEY_META["Ctrl"].width}
                    label={KEY_META["Ctrl"].text}
                    color={KEY_META["Ctrl"].color}
                    pressed={isKeyPressed("Ctrl")}
                />
                <Key
                    position={[-2, 0, 2]}
                    width={KEY_META["Alt"].width}
                    label={KEY_META["Alt"].text}
                    color={KEY_META["Alt"].color}
                    pressed={isKeyPressed("Alt")}
                />
                <Key
                    position={[0, 0, 2]}
                    width={KEY_META["Space"].width}
                    label={KEY_META["Space"].text}
                    color={KEY_META["Space"].color}
                    pressed={isKeyPressed("Space")}
                />
                <Key
                    position={[2.5, 0, 2]}
                    width={KEY_META["Alt"].width}
                    label={KEY_META["Alt"].text}
                    color={KEY_META["Alt"].color}
                    pressed={isKeyPressed("Alt")}
                />
                <Key
                    position={[4.5, 0, 2]}
                    width={KEY_META["Fn"].width}
                    label={KEY_META["Fn"].text}
                    color={KEY_META["Fn"].color}
                />
            </group>
        </group>
    );
}
