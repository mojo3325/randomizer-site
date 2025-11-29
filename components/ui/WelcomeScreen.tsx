import React from "react";
import { playSound } from "@/utils/sound";
import { Power } from "lucide-react";

interface WelcomeScreenProps {
    onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
    const handleStart = () => {
        playSound("mouse");
        onStart();
    };

    return (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-green-500">
            {/* Retro Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(transparent 95%, #0f0 95%), linear-gradient(90deg, transparent 95%, #0f0 95%)",
                    backgroundSize: "20px 20px"
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-shadow-glow animate-pulse">
                        RETRO SYSTEM
                    </h1>
                    <p className="text-sm md:text-base opacity-70 tracking-[0.5em] uppercase">
                        Randomizer & Media Station
                    </p>
                </div>

                <button
                    onClick={handleStart}
                    className="group relative px-8 py-4 bg-transparent border-2 border-green-500 text-green-500 font-bold text-xl tracking-widest uppercase hover:bg-green-500 hover:text-black transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    <span className="flex items-center gap-3">
                        <Power className="w-6 h-6" />
                        Initialize
                    </span>

                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-50 bg-green-400 blur-md transition-opacity -z-10" />
                </button>

                <div className="mt-12 text-[10px] opacity-40 animate-bounce">
                    INSERT COIN TO START
                </div>
            </div>
        </div>
    );
};
