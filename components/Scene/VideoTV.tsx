import React, { useRef } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function VideoTV({ active, ...props }: any) {
    const group = useRef<THREE.Group>(null);
    const occluderRef = useRef<THREE.Mesh>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [muted, setMuted] = React.useState(true);
    const [volume, setVolume] = React.useState(10);

    // Unmute when active becomes true
    React.useEffect(() => {
        if (active) {
            setMuted(false);
        }
    }, [active]);

    // Handle Volume Changes via PostMessage
    React.useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            try {
                // YouTube Player API
                iframeRef.current.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'setVolume',
                    args: [volume]
                }), '*');

                if (!muted) {
                    iframeRef.current.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'unMute',
                        args: []
                    }), '*');
                } else {
                    iframeRef.current.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'mute',
                        args: []
                    }), '*');
                }
            } catch (e) {
                console.error("Failed to send volume command", e);
            }
        }
    }, [volume, muted]);

    // Force Unmute / Play on Mount
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'playVideo',
                    args: []
                }), '*');
            }
        }, 2000); // Check every 2s
        return () => clearInterval(interval);
    }, []);

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Main Casing - Deep Box */}
            <RoundedBox args={[4.2, 3.2, 3]} radius={0.5} smoothness={4} position={[0, 0, -0.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#353535" roughness={0.4} metalness={0.1} />
            </RoundedBox>

            {/* CRT Hump (Back) */}
            <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[1.2, 1.8, 2.5, 32]} />
                <meshStandardMaterial color="#303030" roughness={0.5} />
            </mesh>

            {/* Screen Bezel (Front) */}
            <RoundedBox args={[3.8, 2.8, 0.4]} radius={0.1} smoothness={4} position={[0, 0, 1.1]}>
                <meshStandardMaterial color="#222" roughness={0.8} />
            </RoundedBox>

            {/* Screen Backing */}
            <mesh position={[0, 0, 1.14]}>
                <planeGeometry args={[3.2, 2.4]} />
                <meshStandardMaterial color="black" roughness={0.8} />
            </mesh>

            {/* Invisible occluder */}
            <mesh ref={occluderRef} position={[0, 0, -0.2]}>
                <boxGeometry args={[4.3, 3.5, 2.6]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Video Player Layer */}
            <Html
                transform
                position={[0, 0, 1.17]}
                scale={0.2}
                occlude={[occluderRef]}
                zIndexRange={[50, 0]}
                style={{
                    width: "640px",
                    height: "480px",
                    borderRadius: "36px",
                    background: "black",
                    overflow: "hidden",
                    border: "8px solid #050505",
                    boxSizing: "border-box",
                    backfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                    boxShadow: active ? "0 0 25px rgba(0,0,0,0.4)" : "none"
                }}
            >
                <div className="w-full h-full relative bg-black group">
                    <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-20" />
                    <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />

                    {active ? (
                        <>
                            <iframe
                                ref={iframeRef}
                                src={`https://www.youtube.com/embed/gT2wY0DjYGo?list=RDgT2wY0DjYGo&autoplay=1&controls=0&loop=1&enablejsapi=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allow="autoplay *; encrypted-media; fullscreen; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full object-cover pointer-events-none"
                            />

                            {/* Controls Overlay */}
                            <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 p-3 rounded-xl backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setMuted(!muted)}
                                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase min-w-[50px] transition-colors"
                                    >
                                        {muted ? "UNMUTE" : "MUTE"}
                                    </button>
                                    <div className="text-white text-[12px] font-mono font-bold w-[40px] text-right">{volume}%</div>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => {
                                        const newVol = parseInt(e.target.value);
                                        setVolume(newVol);
                                        setMuted(false);
                                    }}
                                    className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                            <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse" />
                        </div>
                    )}
                </div>
            </Html>

            {/* Screen Glass Overlay */}
            <mesh position={[0, 0, 1.25]} scale={[1.05, 1.05, 1]}>
                <boxGeometry args={[3.3, 2.5, 0.1]} />
                <meshPhysicalMaterial
                    color="#aaf"
                    roughness={0.2}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={0.5}
                    opacity={0.3}
                    transparent
                />
            </mesh>

            {/* Vents (Side) */}
            {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} position={[2.11, 0.5 - i * 0.2, -0.5]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.05, 0.1, 1.5]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            ))}

            {/* Feet */}
            <mesh position={[-1.5, -1.6, 0.5]} rotation={[0, 0, 0.2]}>
                <coneGeometry args={[0.15, 0.4, 16]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[1.5, -1.6, 0.5]} rotation={[0, 0, -0.2]}>
                <coneGeometry args={[0.15, 0.4, 16]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[-1.5, -1.6, -0.5]} rotation={[0.2, 0, 0.2]}>
                <coneGeometry args={[0.15, 0.4, 16]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[1.5, -1.6, -0.5]} rotation={[0.2, 0, -0.2]}>
                <coneGeometry args={[0.15, 0.4, 16]} />
                <meshStandardMaterial color="#111" />
            </mesh>
        </group>
    );
}
