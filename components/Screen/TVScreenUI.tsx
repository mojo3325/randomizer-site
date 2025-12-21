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

// Enhanced Confetti for celebration
const CelebrationConfetti = () => {
    const [particles, setParticles] = useState<{ id: number; color: string; delay: number; duration: number; left: string; size: number; type: string }[]>([]);

    useEffect(() => {
        const colors = ["#ff3366", "#33ff66", "#3366ff", "#ffff33", "#33ffff", "#ff33ff", "#ff6633", "#66ff33", "#ffd700", "#ff1493"];
        const types = ["circle", "star", "square"];
        const newParticles = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 2,
            duration: 2.5 + Math.random() * 2.5,
            left: Math.random() * 100 + "%",
            size: 6 + Math.random() * 10,
            type: types[Math.floor(Math.random() * types.length)]
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[60]">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className={cn(
                        "absolute",
                        p.type === "circle" && "rounded-full",
                        p.type === "square" && "rounded-sm rotate-45",
                        p.type === "star" && "rounded-full"
                    )}
                    style={{
                        left: p.left,
                        top: "-20px",
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                        animation: `celebrateFall ${p.duration}s ease-out ${p.delay}s infinite`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes celebrateFall {
                    0% { 
                        transform: translateY(0) rotate(0deg) scale(1); 
                        opacity: 1; 
                    }
                    50% {
                        opacity: 1;
                    }
                    100% { 
                        transform: translateY(400px) rotate(1080deg) scale(0.3); 
                        opacity: 0; 
                    }
                }
            `}</style>
        </div>
    );
};

// Full screen winner celebration overlay
const WinnerCelebration = ({ winner, onClose }: { winner: string; onClose: () => void }) => {
    return (
        <div 
            className="absolute inset-0 z-[55] flex flex-col items-center justify-center cursor-pointer"
            onClick={onClose}
            style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)"
            }}
        >
            <CelebrationConfetti />
            
            {/* Glow rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                    className="w-64 h-64 rounded-full opacity-30 animate-ping"
                    style={{ 
                        background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)",
                        animationDuration: "2s"
                    }}
                />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                    className="w-48 h-48 rounded-full opacity-40 animate-ping"
                    style={{ 
                        background: "radial-gradient(circle, rgba(255,255,0,0.5) 0%, transparent 70%)",
                        animationDuration: "1.5s",
                        animationDelay: "0.3s"
                    }}
                />
            </div>
            
            {/* Stars decoration */}
            <div className="absolute top-8 left-8 text-4xl animate-pulse" style={{ animationDelay: "0s" }}>⭐</div>
            <div className="absolute top-12 right-12 text-3xl animate-pulse" style={{ animationDelay: "0.2s" }}>✨</div>
            <div className="absolute bottom-16 left-12 text-3xl animate-pulse" style={{ animationDelay: "0.4s" }}>🌟</div>
            <div className="absolute bottom-12 right-8 text-4xl animate-pulse" style={{ animationDelay: "0.6s" }}>⭐</div>
            
            {/* Winner text */}
            <div className="relative z-10 text-center px-4">
                <div 
                    className="text-lg font-bold text-yellow-400 uppercase tracking-[0.3em] mb-2 animate-pulse"
                    style={{ textShadow: "0 0 20px rgba(255,215,0,0.8)" }}
                >
                    🎉 WINNER 🎉
                </div>
                
                <div 
                    className="text-3xl font-black text-white uppercase tracking-wider py-3 px-6 rounded-lg border-4 border-yellow-400 bg-gradient-to-b from-yellow-500/20 to-orange-500/20"
                    style={{ 
                        textShadow: "0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,215,0,0.8)",
                        boxShadow: "0 0 40px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,215,0,0.2)",
                        animation: "winnerPulse 1s ease-in-out infinite alternate"
                    }}
                >
                    {winner}
                </div>
                
                <div className="text-xs text-white/60 mt-4 uppercase tracking-widest animate-pulse">
                    Tap to continue
                </div>
            </div>
            
            <style jsx>{`
                @keyframes winnerPulse {
                    0% { 
                        transform: scale(1);
                        box-shadow: 0 0 40px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,215,0,0.2);
                    }
                    100% { 
                        transform: scale(1.05);
                        box-shadow: 0 0 60px rgba(255,215,0,0.8), inset 0 0 40px rgba(255,215,0,0.3);
                    }
                }
            `}</style>
        </div>
    );
};

export const TVScreenUI = ({ wheelState }: TVScreenUIProps) => {
    const { items, addItem, removeItem, clearItems, spin, spinning, rotation, winner, isLanding } = wheelState;
    const [inputValue, setInputValue] = useState("");
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        if (winner && !spinning) {
            // Show celebration after a small delay
            const timer = setTimeout(() => setShowCelebration(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowCelebration(false);
        }
    }, [winner, spinning]);

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputValue.trim()) {
            addItem(inputValue);
            setInputValue("");
        }
    };

    const closeCelebration = () => {
        setShowCelebration(false);
    };

    return (
        <div
            style={{ width: "100%", height: "100%" }}
            className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] text-retro-phosphor p-3 flex flex-col font-mono relative select-none overflow-hidden"
        >
            {/* Winner Celebration Overlay */}
            {showCelebration && winner && (
                <WinnerCelebration winner={winner} onClose={closeCelebration} />
            )}

            {/* CRT Overlay Effects */}
            <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-15" />
            <div className="absolute inset-0 pointer-events-none z-50 animate-flicker bg-white/3 mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-retro-phosphor/40 pb-1.5 mb-2 z-10">
                <h1 className="text-sm font-bold tracking-[0.2em] crt-text uppercase" style={{ textShadow: "0 0 10px rgba(51,255,51,0.8), 0 0 20px rgba(51,255,51,0.4)" }}>
                    RANDOMIZER
                </h1>
                <div className="text-[10px] opacity-90 flex items-center gap-1 font-bold">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                    REC
                </div>
            </header>

            <div className="flex flex-1 gap-2 z-10 min-h-0">
                {/* Left Column: Controls & List */}
                <div className="w-[38%] flex flex-col gap-1.5">
                    {/* Input */}
                    <form onSubmit={handleAdd} className="flex gap-1">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="ADD ITEM..."
                            disabled={spinning}
                            className="h-8 text-[10px] px-2 bg-black/80 border-2 border-retro-phosphor/40 text-retro-phosphor placeholder:text-retro-phosphor/25 uppercase rounded-sm focus:ring-0 focus:border-retro-phosphor font-bold tracking-wide"
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={spinning} 
                            className="h-8 w-8 flex-shrink-0 rounded-sm bg-retro-phosphor text-black hover:bg-[#55ff55] shadow-[0_0_10px_rgba(51,255,51,0.4)] border-b-2 border-r-2 border-[#005500]"
                        >
                            <Plus className="w-4 h-4" strokeWidth={3} />
                        </Button>
                    </form>

                    {/* List */}
                    <div
                        className="flex-1 overflow-y-auto border-2 border-retro-phosphor/25 bg-black/60 p-1 rounded-sm custom-scrollbar"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {items.length === 0 && (
                            <div className="text-center text-[10px] opacity-40 mt-4 uppercase tracking-wider">No Data</div>
                        )}
                        <ul className="space-y-0.5">
                            {items.map((item, idx) => (
                                <li 
                                    key={idx} 
                                    className="flex justify-between items-center group text-[10px] hover:bg-retro-phosphor/15 px-1.5 py-1 border-b border-retro-phosphor/10 last:border-0 rounded-sm transition-colors"
                                >
                                    <span className="truncate max-w-[80px] uppercase font-semibold tracking-wide">{item}</span>
                                    <button
                                        onClick={() => removeItem(idx)}
                                        disabled={spinning}
                                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
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
                        className="h-6 text-[8px] border-dashed border-retro-phosphor/30 rounded-sm uppercase hover:bg-red-900/40 hover:text-red-300 hover:border-red-500/50 tracking-wider font-bold"
                    >
                        <RefreshCcw className="w-3 h-3 mr-1" /> Clear
                    </Button>
                </div>

                {/* Right Column: Wheel & Result */}
                <div className="flex-1 flex flex-col items-center justify-between relative">
                    {/* Wheel */}
                    <div className="flex-1 flex items-center justify-center w-full">
                        <Wheel items={items} rotation={rotation} isLanding={isLanding} />
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex flex-col items-center gap-1.5 w-full">
                        <Button
                            onClick={spin}
                            disabled={spinning || items.length < 2}
                            className={cn(
                                "w-full max-w-[130px] h-10 text-base font-black uppercase tracking-[0.15em] transition-all rounded-sm",
                                spinning 
                                    ? "opacity-40 cursor-not-allowed bg-gray-600 border-0" 
                                    : "bg-gradient-to-b from-retro-phosphor to-[#22cc22] text-black hover:from-[#55ff55] hover:to-[#33dd33] shadow-[0_0_15px_rgba(51,255,51,0.5),0_3px_0_#005500] hover:shadow-[0_0_25px_rgba(51,255,51,0.7),0_3px_0_#006600] active:shadow-[0_0_12px_rgba(51,255,51,0.4),0_1px_0_#004400] active:translate-y-[2px]"
                            )}
                        >
                            {spinning ? "..." : "SPIN"}
                        </Button>

                        {/* Status Display */}
                        <div className="h-6 flex items-center justify-center w-full">
                            {items.length < 2 && !spinning && (
                                <div className="text-[9px] text-red-400 text-center uppercase font-bold animate-pulse tracking-wider">
                                    Add 2+ items
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
