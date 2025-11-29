import React, { useRef } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import { TVScreenUI } from "@/components/Screen/TVScreenUI";
import * as THREE from "three";

export function TV(props: any) {
    const group = useRef<THREE.Group>(null);
    const occluderRef = useRef<THREE.Mesh>(null);

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Main Casing - Deep Box */}
            <RoundedBox args={[4.2, 3.2, 3]} radius={0.5} smoothness={4} position={[0, 0, -0.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#252525" roughness={0.4} metalness={0.1} />
            </RoundedBox>

            {/* CRT Hump (Back) - The "Tube" */}
            <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[1.2, 1.8, 2.5, 32]} />
                <meshStandardMaterial color="#202020" roughness={0.5} />
            </mesh>

            {/* Screen Bezel (Front) */}
            <RoundedBox args={[3.8, 2.8, 0.4]} radius={0.1} smoothness={4} position={[0, 0, 1.1]}>
                <meshStandardMaterial color="#151515" roughness={0.8} />
            </RoundedBox>

            {/* Screen Backing (Blocker for transparency) */}
            <mesh position={[0, 0, 1.14]}>
                <planeGeometry args={[3.2, 2.4]} />
                <meshStandardMaterial color="black" roughness={0.8} />
            </mesh>

            {/* Invisible occluder (prevents back-side visibility) */}
            <mesh ref={occluderRef} position={[0, 0, -0.2]}>
                <boxGeometry args={[4.3, 3.5, 2.6]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Interactive UI Layer */}
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
                    boxShadow: "0 0 25px rgba(16,255,16,0.2)"
                }}
            >
                <TVScreenUI wheelState={props.wheelState} />
            </Html>

            {/* Screen Glass Overlay (Subtle Curve) */}
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

            {/* Front Controls Panel */}
            {/* Brand Logo */}
            <mesh position={[0, -1.2, 1.22]}>
                <boxGeometry args={[0.8, 0.1, 0.02]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, -1.4, 1.2]}>
                <boxGeometry args={[3, 0.3, 0.2]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[1, -1.4, 1.31]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[-1, -1.4, 1.31]}>
                <boxGeometry args={[0.4, 0.1, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Power LED */}
            <mesh position={[1.3, -1.4, 1.31]}>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
            </mesh>


            {/* Antenna */}
            <group position={[0, 1.6, -0.5]} rotation={[0, 0, 0.5]}>
                <mesh position={[0.5, 0.5, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 2.5]} />
                    <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0.5, 1.75, 0]}>
                    <sphereGeometry args={[0.06]} />
                    <meshStandardMaterial color="#f00" />
                </mesh>
            </group>
            <group position={[0, 1.6, -0.5]} rotation={[0, 0, -0.5]}>
                <mesh position={[-0.5, 0.5, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 2.5]} />
                    <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[-0.5, 1.75, 0]}>
                    <sphereGeometry args={[0.06]} />
                    <meshStandardMaterial color="#f00" />
                </mesh>
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
