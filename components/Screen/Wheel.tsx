import React from "react";

interface WheelProps {
    items: string[];
    rotation: number;
    isLanding?: boolean;
}

export const Wheel: React.FC<WheelProps> = ({ items, rotation, isLanding = false }) => {
    const numItems = items.length;
    const radius = 50;
    const center = 50;

    const colors = [
        "#ff3333", // Red
        "#33ff33", // Green
        "#3333ff", // Blue
        "#ffff33", // Yellow
        "#33ffff", // Cyan
        "#ff33ff", // Magenta
        "#ff9933", // Orange
        "#9933ff", // Purple
    ];

    const getCoordinatesForPercent = (percent: number) => {
        const x = center + radius * Math.cos(2 * Math.PI * percent);
        const y = center + radius * Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="relative w-44 h-44 mx-auto">
            {/* Pointer at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />

            {/* Wheel */}
            <div
                className="w-full h-full rounded-full border-4 border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(0,0,0,0.3)] overflow-hidden"
                style={{
                    transform: `rotate(${rotation}deg)`,
                }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
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

                        // Text in center of segment
                        const textAngle = (i * 360) / numItems + (360 / numItems) / 2;

                        return (
                            <g key={i}>
                                <path 
                                    d={pathData} 
                                    fill={colors[i % colors.length]} 
                                    stroke="rgba(255,255,255,0.5)" 
                                    strokeWidth="0.5" 
                                />
                                <text
                                    x="70"
                                    y="50"
                                    fill="white"
                                    stroke="rgba(0,0,0,0.8)"
                                    strokeWidth="0.4"
                                    fontSize="5.5"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    transform={`rotate(${textAngle}, 50, 50)`}
                                    style={{ textTransform: "uppercase" }}
                                >
                                    {item.length > 8 ? item.substring(0, 7) + ".." : item}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Center Cap */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg flex items-center justify-center border-2 border-gray-300">
                <div className="w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full" />
            </div>
        </div>
    );
};
