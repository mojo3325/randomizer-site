import React, { useState, useEffect } from "react";
import { Wheel } from "./Wheel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, Plus, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TVScreenUIProps {
    wheelState: {
        items: string[];
        addItem: (item: string) => void;
        removeItem: (index: number) => void;
        clearItems: () => void;
        spin: () => void;
        spinning: boolean;
        rotation: number;
        winner: string | null;
        isLanding: boolean;
    };
}

// Enhanced Confetti
const ConfettiParticles = () => {
    const [particles, setParticles] = useState<{ id: number; color: string; delay: number; duration: number; left: string; size: number }[]>([]);

    useEffect(() => {
        const colors = ["#ff3366", "#33ff66", "#3366ff", "#ffff33", "#33ffff", "#ff33ff", "#ff6633", "#66ff33"];
        const newParticles = Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 1.5,
            duration: 2 + Math.random() * 2,
            left: Math.random() * 100 + "%",
            size: 4 + Math.random() * 6
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: p.left,
                        top: "-10px",
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 ${p.size}px ${p.color}`,
                        animation: `fall ${p.duration}s ease-out ${p.delay}s infinite`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translateY(350px) rotate(720deg) scale(0.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export const TVScreenUI = ({ wheelState }: TVScreenUIProps) => {
    const { items, addItem, removeItem, clearItems, spin, spinning, rotation, winner, isLanding } = wheelState;
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

    return (
        <div
            style={{ width: "100%", height: "100%" }}
            className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] text-retro-phosphor p-4 flex flex-col font-mono relative select-none overflow-hidden"
        >
            {/* Confetti */}
            {winner && !spinning && showConfetti && <ConfettiParticles />}

            {/* CRT Overlay Effects */}
            <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-15" />
            <div className="absolute inset-0 pointer-events-none z-50 animate-flicker bg-white/3 mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-retro-phosphor/40 pb-2 mb-3 z-10">
                <h1 className="text-base font-bold tracking-[0.25em] crt-text uppercase" style={{ textShadow: "0 0 10px rgba(51,255,51,0.8), 0 0 20px rgba(51,255,51,0.4)" }}>
                    RANDOMIZER
                </h1>
                <div className="text-xs opacity-90 flex items-center gap-1.5 font-bold">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                    REC
                </div>
            </header>

            <div className="flex flex-1 gap-3 z-10 min-h-0">
                {/* Left Column: Controls & List */}
                <div className="w-[38%] flex flex-col gap-2">
                    {/* Input */}
                    <form onSubmit={handleAdd} className="flex gap-1.5">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="ADD ITEM..."
                            disabled={spinning}
                            className="h-9 text-xs px-2.5 bg-black/80 border-2 border-retro-phosphor/40 text-retro-phosphor placeholder:text-retro-phosphor/25 uppercase rounded-sm focus:ring-0 focus:border-retro-phosphor font-bold tracking-wide"
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={spinning} 
                            className="h-9 w-9 flex-shrink-0 rounded-sm bg-retro-phosphor text-black hover:bg-[#55ff55] shadow-[0_0_12px_rgba(51,255,51,0.4)] border-b-2 border-r-2 border-[#005500]"
                        >
                            <Plus className="w-5 h-5" strokeWidth={3} />
                        </Button>
                    </form>

                    {/* List */}
                    <div
                        className="flex-1 overflow-y-auto border-2 border-retro-phosphor/25 bg-black/60 p-1.5 rounded-sm custom-scrollbar"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {items.length === 0 && (
                            <div className="text-center text-xs opacity-40 mt-6 uppercase tracking-wider">No Data</div>
                        )}
                        <ul className="space-y-0.5">
                            {items.map((item, idx) => (
                                <li 
                                    key={idx} 
                                    className="flex justify-between items-center group text-xs hover:bg-retro-phosphor/15 px-2 py-1.5 border-b border-retro-phosphor/10 last:border-0 rounded-sm transition-colors"
                                >
                                    <span className="truncate max-w-[90px] uppercase font-semibold tracking-wide">{item}</span>
                                    <button
                                        onClick={() => removeItem(idx)}
                                        disabled={spinning}
                                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
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
                        className="h-7 text-[10px] border-dashed border-retro-phosphor/30 rounded-sm uppercase hover:bg-red-900/40 hover:text-red-300 hover:border-red-500/50 tracking-wider font-bold"
                    >
                        <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Clear All
                    </Button>
                </div>

                {/* Right Column: Wheel & Result */}
                <div className="flex-1 flex flex-col items-center justify-between relative">
                    {/* Wheel - Larger */}
                    <div className="flex-1 flex items-center justify-center w-full">
                        <Wheel items={items} rotation={rotation} isLanding={isLanding} />
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex flex-col items-center gap-2 w-full">
                        <Button
                            onClick={spin}
                            disabled={spinning || items.length < 2}
                            className={cn(
                                "w-full max-w-[160px] h-12 text-lg font-black uppercase tracking-[0.2em] transition-all rounded-sm",
                                spinning 
                                    ? "opacity-40 cursor-not-allowed bg-gray-600 border-0" 
                                    : "bg-gradient-to-b from-retro-phosphor to-[#22cc22] text-black hover:from-[#55ff55] hover:to-[#33dd33] shadow-[0_0_20px_rgba(51,255,51,0.5),0_4px_0_#005500] hover:shadow-[0_0_30px_rgba(51,255,51,0.7),0_4px_0_#006600] active:shadow-[0_0_15px_rgba(51,255,51,0.4),0_2px_0_#004400] active:translate-y-[2px]"
                            )}
                        >
                            {spinning ? "..." : "SPIN"}
                        </Button>

                        {/* Winner Display */}
                        <div className="h-10 flex items-center justify-center w-full">
                            {winner && !spinning && (
                                <div 
                                    className="animate-bounce text-base font-black text-yellow-300 text-center bg-black/90 px-4 py-1.5 border-2 border-yellow-400 rounded-sm uppercase tracking-wider"
                                    style={{ 
                                        textShadow: "0 0 10px rgba(255,255,0,0.8)",
                                        boxShadow: "0 0 20px rgba(255,255,0,0.4), inset 0 0 10px rgba(255,255,0,0.1)"
                                    }}
                                >
                                    ★ {winner} ★
                                </div>
                            )}
                            {items.length < 2 && !spinning && (
                                <div className="text-xs text-red-400 text-center uppercase font-bold animate-pulse tracking-wider">
                                    Add at least 2 items
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
