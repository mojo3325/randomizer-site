import React from "react";

interface WheelProps {
    items: string[];
    rotation: number;
}

export const Wheel: React.FC<WheelProps> = ({ items, rotation }) => {
    const numItems = items.length;
    const radius = 50; // SVG coordinate system
    const center = 50;

    // Retro Color Palette
    const colors = [
        "#ff3333", // Red
        "#33ff33", // Green
        "#3333ff", // Blue
        "#ffff33", // Yellow
        "#33ffff", // Cyan
        "#ff33ff", // Magenta
    ];

    // Helper to calculate coordinates
    const getCoordinatesForPercent = (percent: number) => {
        const x = center + radius * Math.cos(2 * Math.PI * percent);
        const y = center + radius * Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="relative w-36 h-36 mx-auto my-2">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-md" />

            {/* Wheel Container */}
            <div
                className="w-full h-full rounded-full border-4 border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                style={{
                    transform: `rotate(${rotation}deg)`,
                }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {items.length === 0 && (
                        <circle cx="50" cy="50" r="50" fill="#333" />
                    )}
                    {items.map((item, i) => {
                        const startPercent = i / numItems;
                        const endPercent = (i + 1) / numItems;

                        const [startX, startY] = getCoordinatesForPercent(startPercent);
                        const [endX, endY] = getCoordinatesForPercent(endPercent);

                        const largeArcFlag = 1 / numItems > 0.5 ? 1 : 0;

                        const pathData = [
                            `M ${center} ${center}`,
                            `L ${startX} ${startY}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `Z`
                        ].join(' ');

                        // Text rotation
                        const angle = (i * 360) / numItems + (360 / numItems) / 2;

                        return (
                            <g key={i}>
                                <path d={pathData} fill={colors[i % colors.length]} stroke="white" strokeWidth="1" />
                                <text
                                    x="65" // Push text out from center
                                    y="50"
                                    fill="white"
                                    stroke="black"
                                    strokeWidth="0.5"
                                    fontSize="6"
                                    fontWeight="bold"
                                    textAnchor="start"
                                    alignmentBaseline="middle"
                                    transform={`rotate(${angle}, 50, 50)`}
                                    style={{ textTransform: "uppercase" }}
                                >
                                    {item.length > 10 ? item.substring(0, 8) + ".." : item}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Center Cap */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full border border-gray-400" />
            </div>
        </div>
    );
};
