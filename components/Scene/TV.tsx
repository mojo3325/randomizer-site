import React, { useRef } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import { TVScreenUI } from "@/components/Screen/TVScreenUI";
import * as THREE from "three";

export function TV({ active, wheelState, ...props }: any) {
    const group = useRef<THREE.Group>(null);
    const occluderRef = useRef<THREE.Mesh>(null);

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Main Casing - Deep Box */}
            <RoundedBox args={[5.5, 4.2, 3.5]} radius={0.6} smoothness={4} position={[0, 0, -0.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
            </RoundedBox>

            {/* CRT Hump (Back) - The "Tube" */}
            <mesh position={[0, 0, -3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[1.5, 2.2, 3, 32]} />
                <meshStandardMaterial color="#151515" roughness={0.4} />
            </mesh>

            {/* Screen Bezel (Front) */}
            <RoundedBox args={[5, 3.8, 0.5]} radius={0.15} smoothness={4} position={[0, 0, 1.2]}>
                <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </RoundedBox>

            {/* Screen Backing (Blocker for transparency) */}
            <mesh position={[0, 0, 1.25]}>
                <planeGeometry args={[4.2, 3.2]} />
                <meshStandardMaterial color="black" roughness={0.8} />
            </mesh>

            {/* Invisible occluder (prevents back-side visibility) */}
            <mesh ref={occluderRef} position={[0, 0, -1.5]}>
                <boxGeometry args={[5.6, 4.5, 2]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Interactive UI Layer - Fitted to bezel */}
            <Html
                transform
                position={[0, 0, 1.35]}
                scale={0.46}
                occlude={[occluderRef]}
                zIndexRange={[100, 0]}
                style={{
                    width: "400px",
                    height: "290px",
                    borderRadius: "12px",
                    background: "black",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    backfaceVisibility: "hidden",
                    boxShadow: active ? "0 0 25px rgba(16,255,16,0.25)" : "none"
                }}
            >
                {active ? (
                    <TVScreenUI wheelState={wheelState} />
                ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                    </div>
                )}
            </Html>

            {/* Screen Glass Overlay (Subtle Curve) */}
            <mesh position={[0, 0, 1.38]} scale={[1.03, 1.03, 1]}>
                <boxGeometry args={[4.3, 3.3, 0.08]} />
                <meshPhysicalMaterial
                    color="#88aaff"
                    roughness={0.15}
                    metalness={0.1}
                    transmission={0.92}
                    thickness={0.3}
                    opacity={0.25}
                    transparent
                />
            </mesh>

            {/* Vents (Side) */}
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} position={[2.76, 0.7 - i * 0.2, -0.5]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.05, 0.1, 1.8]} />
                    <meshStandardMaterial color="#0a0a0a" />
                </mesh>
            ))}

            {/* Front Controls Panel */}
            <mesh position={[0, -1.7, 1.35]}>
                <boxGeometry args={[4, 0.4, 0.25]} />
                <meshStandardMaterial color="#111" roughness={0.7} />
            </mesh>
            
            {/* Brand Logo */}
            <mesh position={[0, -1.7, 1.48]}>
                <boxGeometry args={[1, 0.12, 0.02]} />
                <meshStandardMaterial color="#c9a227" metalness={0.95} roughness={0.15} />
            </mesh>
            
            {/* Control Knobs */}
            <mesh position={[1.3, -1.7, 1.48]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.12]} />
                <meshStandardMaterial color="#222" metalness={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[-1.3, -1.7, 1.48]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.12]} />
                <meshStandardMaterial color="#222" metalness={0.3} roughness={0.5} />
            </mesh>
            
            {/* Power LED */}
            <mesh position={[1.7, -1.7, 1.48]}>
                <sphereGeometry args={[0.06]} />
                <meshStandardMaterial 
                    color={active ? "#00ff00" : "#ff0000"} 
                    emissive={active ? "#00ff00" : "#ff0000"} 
                    emissiveIntensity={active ? 3 : 1} 
                />
            </mesh>

            {/* Antenna */}
            <group position={[0, 2.1, -0.5]} rotation={[0, 0, 0.4]}>
                <mesh position={[0.6, 0.6, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 3]} />
                    <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.1} />
                </mesh>
                <mesh position={[0.6, 2.1, 0]}>
                    <sphereGeometry args={[0.08]} />
                    <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.5} />
                </mesh>
            </group>
            <group position={[0, 2.1, -0.5]} rotation={[0, 0, -0.4]}>
                <mesh position={[-0.6, 0.6, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 3]} />
                    <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.1} />
                </mesh>
                <mesh position={[-0.6, 2.1, 0]}>
                    <sphereGeometry args={[0.08]} />
                    <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.5} />
                </mesh>
            </group>

            {/* Feet */}
            <mesh position={[-2, -2.1, 0.6]} rotation={[0, 0, 0.15]}>
                <coneGeometry args={[0.18, 0.5, 16]} />
                <meshStandardMaterial color="#0a0a0a" />
            </mesh>
            <mesh position={[2, -2.1, 0.6]} rotation={[0, 0, -0.15]}>
                <coneGeometry args={[0.18, 0.5, 16]} />
                <meshStandardMaterial color="#0a0a0a" />
            </mesh>
            <mesh position={[-2, -2.1, -0.6]} rotation={[0.15, 0, 0.15]}>
                <coneGeometry args={[0.18, 0.5, 16]} />
                <meshStandardMaterial color="#0a0a0a" />
            </mesh>
            <mesh position={[2, -2.1, -0.6]} rotation={[0.15, 0, -0.15]}>
                <coneGeometry args={[0.18, 0.5, 16]} />
                <meshStandardMaterial color="#0a0a0a" />
            </mesh>
        </group>
    );
}
