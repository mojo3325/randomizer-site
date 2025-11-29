import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                retro: {
                    bg: "#1a1a1a",
                    screen: "#111",
                    phosphor: "#33ff33",
                    phosphorDim: "#1a801a",
                },
            },
            animation: {
                "spin-slow": "spin 3s linear infinite",
                flicker: "flicker 0.15s infinite",
            },
            keyframes: {
                flicker: {
                    "0%": { opacity: "0.97" },
                    "50%": { opacity: "1" },
                    "100%": { opacity: "0.98" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
