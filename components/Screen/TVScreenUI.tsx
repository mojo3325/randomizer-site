import React, { useState, useEffect } from "react";
import { Wheel } from "./Wheel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, Plus, RefreshCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WheelStatus } from "./useWheel";

interface TVScreenUIProps {
    wheelState: {
        items: string[];
        addItem: (item: string) => void;
        removeItem: (index: number) => void;
        clearItems: () => void;
        spin: () => void;
        cancelSpin: () => void;
        spinning: boolean;
        status: WheelStatus;
        rotation: number;
        winner: string | null;
        error: string | null;
    };
}

// Simple CSS Confetti
const ConfettiParticles = () => {
    const [particles, setParticles] = useState<{ id: number; color: string; delay: number; duration: number; left: string }[]>([]);

    useEffect(() => {
        const colors = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"];
        const newParticles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
            left: Math.random() * 100 + "%"
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full animate-fall"
                    style={{
                        left: p.left,
                        top: "-10px",
                        backgroundColor: p.color,
                        animation: `fall ${p.duration}s linear ${p.delay}s infinite`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(250px) rotate(360deg); opacity: 0; }
                }
                .animate-fall {
                    animation-name: fall;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
};

// Waiting overlay
const WaitingOverlay = ({ onCancel }: { onCancel: () => void }) => {
    return (
        <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center">
            <div className="text-retro-phosphor text-center">
                <div className="text-lg font-bold mb-2 animate-pulse">ОЖИДАНИЕ TELEGRAM</div>
                <div className="text-xs opacity-70 mb-4">Кто-то должен выбрать в боте...</div>
                <div className="flex gap-1 justify-center mb-4">
                    <div className="w-2 h-2 bg-retro-phosphor rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-retro-phosphor rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-retro-phosphor rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] border-red-500 text-red-400 hover:bg-red-900/50 hover:text-red-200 rounded-none"
                >
                    <X className="w-3 h-3 mr-1" /> ОТМЕНА
                </Button>
            </div>
        </div>
    );
};

export const TVScreenUI = ({ wheelState }: TVScreenUIProps) => {
    const { items, addItem, removeItem, clearItems, spin, cancelSpin, spinning, status, rotation, winner, error } = wheelState;
    const [inputValue, setInputValue] = useState("");

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (winner) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        } else {
            setShowConfetti(false);
        }
    }, [winner]);

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputValue.trim()) {
            addItem(inputValue);
            setInputValue("");
        }
    };

    const isWaiting = status === "waiting";
    const isSpinning = status === "spinning";

    return (
        <div
            style={{ width: "100%", height: "100%" }}
            className="bg-[#111] text-retro-phosphor p-3 flex flex-col font-mono relative select-none overflow-hidden"
        >
            {/* Waiting Overlay */}
            {isWaiting && <WaitingOverlay onCancel={cancelSpin} />}

            {/* Confetti inside the screen - Only shows when winner exists */}
            {winner && !spinning && showConfetti && <ConfettiParticles />}

            {/* CRT Overlay Effects */}
            <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-20" />
            <div className="absolute inset-0 pointer-events-none z-50 animate-flicker bg-white/5 mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />

            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-retro-phosphor/50 pb-1 mb-2 z-10">
                <h1 className="text-sm font-bold tracking-widest crt-text uppercase text-shadow-glow">RANDOMIZER</h1>
                <div className="text-[10px] opacity-80 flex items-center gap-1">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        isWaiting ? "bg-yellow-500 animate-pulse" : "bg-red-500 animate-pulse"
                    )} />
                    {isWaiting ? "WAIT" : "REC"}
                </div>
            </header>

            <div className="flex flex-1 gap-2 z-10 min-h-0">
                {/* Left Column: Controls & List */}
                <div className="w-5/12 flex flex-col gap-2">
                    {/* Input */}
                    <form onSubmit={handleAdd} className="flex gap-1">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="ADD ITEM..."
                            disabled={spinning}
                            className="h-8 text-[10px] px-2 bg-[#000] border-retro-phosphor/50 text-retro-phosphor placeholder:text-retro-phosphor/30 uppercase rounded-none focus:ring-0 focus:border-retro-phosphor"
                        />
                        <Button type="submit" size="icon" disabled={spinning} className="h-8 w-8 flex-shrink-0 rounded-none bg-retro-phosphor text-black hover:bg-retro-phosphorDim">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </form>

                    {/* List */}
                    <div
                        className="flex-1 overflow-y-auto border-2 border-retro-phosphor/30 bg-[#0a0a0a] p-1 custom-scrollbar"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {items.length === 0 && (
                            <div className="text-center text-[10px] opacity-50 mt-4 uppercase">No Data</div>
                        )}
                        <ul className="space-y-1">
                            {items.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center group text-[10px] hover:bg-retro-phosphor/20 p-1 border-b border-retro-phosphor/10 last:border-0">
                                    <span className="truncate max-w-[80px] uppercase">{item}</span>
                                    <button
                                        onClick={() => removeItem(idx)}
                                        disabled={spinning}
                                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button
                        onClick={clearItems}
                        variant="outline"
                        size="sm"
                        disabled={spinning || items.length === 0}
                        className="h-6 text-[8px] border-dashed rounded-none uppercase hover:bg-red-900/50 hover:text-red-200 hover:border-red-500"
                    >
                        <RefreshCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                </div>

                {/* Right Column: Wheel & Result */}
                <div className="flex-1 flex flex-col items-center justify-start relative pt-0">
                    <Wheel items={items} rotation={rotation} />

                    <div className="mt-auto flex flex-col items-center gap-2 w-full pb-1">
                        <Button
                            onClick={spin}
                            disabled={spinning || items.length < 2}
                            className={cn(
                                "w-full max-w-[140px] h-10 text-base font-black uppercase tracking-widest transition-all rounded-sm border-b-4 border-r-4 border-[#004400] active:border-0 active:translate-y-1",
                                spinning ? "opacity-50 cursor-not-allowed border-0 translate-y-1" : "bg-retro-phosphor text-black hover:bg-[#44ff44] shadow-[0_0_10px_rgba(51,255,51,0.3)]"
                            )}
                        >
                            {isSpinning ? "..." : isWaiting ? "WAIT" : "SPIN"}
                        </Button>

                        {/* Status Display */}
                        <div className="h-8 flex items-center justify-center w-full">
                            {winner && !spinning && (
                                <div className="animate-bounce text-sm font-bold text-yellow-300 crt-text text-center bg-black/80 px-2 py-1 border border-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.5)] uppercase">
                                    ★ {winner} ★
                                </div>
                            )}
                            {error && !spinning && (
                                <div className="text-[8px] text-red-500 text-center uppercase font-bold animate-pulse">
                                    {error}
                                </div>
                            )}
                            {items.length < 2 && !spinning && !error && (
                                <div className="text-[8px] text-red-500 text-center uppercase font-bold animate-pulse">Insert Tape</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
