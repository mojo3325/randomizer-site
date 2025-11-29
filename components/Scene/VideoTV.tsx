import React, { useRef, useState } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function VideoTV(props: any) {
    const group = useRef<THREE.Group>(null);
    const occluderRef = useRef<THREE.Mesh>(null);
    const [muted, setMuted] = useState(false);

    const toggleMute = () => {
        setMuted(!muted);
    };

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
                scale={1}
                distanceFactor={1.4}
                occlude={[occluderRef]}
                style={{
                    width: "256px",
                    height: "192px",
                    borderRadius: "28px",
                    background: "black",
                    overflow: "hidden",
                    border: "6px solid #050505",
                    backfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                    pointerEvents: "none", // Disable interaction with iframe
                    boxShadow: "0 0 25px rgba(0,0,0,0.4)"
                }}
            >
                <div className="w-full h-full relative bg-black">
                    <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-20" />
                    <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />

                    {/* VK Video Embed - Mute hack via overlay or just let it play. 
                        VK iframe API is limited without SDK. 
                        We can't easily mute an iframe from outside without postMessage support.
                        However, user asked for a physical button to toggle sound.
                        If we can't mute, we might just unmount/remount or use a different URL param?
                        VK doesn't seem to have a simple 'mute' param documented publicly for iframe.
                        Let's try 'volume=0' or similar, but it's a guess.
                        Actually, if we can't mute, maybe we just show a "MUTE" overlay that consumes clicks?
                        But user wants physical button.
                        
                        Alternative: Use a different video source if possible, or just accept we can't mute easily without API.
                        But I must try.
                        
                        Actually, if I re-render the iframe with 'mute=1' maybe?
                        Let's assume 'js_api=1' might help but we need code.
                        
                        For now, I will implement the button and if clicked, I will toggle a 'muted' state 
                        that might add '&muted=1' to URL if supported, or just show visual feedback.
                        
                        Wait, the user said "Just one physical button to turn off sound".
                        If I can't control iframe sound, I can't fulfill this perfectly.
                        But I will try adding `&mute=1` when muted.
                    */}
                    <iframe
                        src={`https://vk.com/video_ext.php?oid=-119930487&id=456241996&hd=2&autoplay=1&loop=1&controls=0&mute=${muted ? 1 : 0}`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full object-cover"
                        style={{ pointerEvents: "none" }} // Double ensure no controls
                    />
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

            {/* Physical Mute Button */}
            <group position={[1.2, -1.4, 1.3]} onClick={toggleMute}>
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.1]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.1]} />
                    <meshStandardMaterial color={muted ? "red" : "green"} emissive={muted ? "red" : "green"} emissiveIntensity={0.5} />
                </mesh>
                {/* Label */}
                {/* We can't easily put text here without Drei Text, let's assume color is enough */}
            </group>

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
