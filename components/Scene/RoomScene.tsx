import React from "react";
import { TV } from "./TV";
import { VideoTV } from "./VideoTV";
import { Keyboard } from "./Keyboard";
import { Mouse } from "./Mouse";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { useWheel } from "@/components/Screen/useWheel";

export function RoomScene({ started }: { started: boolean }) {
    const wheelState = useWheel();

    return (
        <>
            {/* Lighting - Dramatic & Focused */}
            <ambientLight intensity={0.25} color="#ffeedd" />
            
            {/* Main key light */}
            <spotLight
                position={[0, 10, 8]}
                angle={0.5}
                penumbra={0.6}
                intensity={2.5}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
            />
            
            {/* Warm fill light */}
            <pointLight position={[-6, 4, -3]} intensity={0.4} color="#ff8844" />
            
            {/* Cool accent */}
            <pointLight position={[6, 3, -2]} intensity={0.3} color="#4488ff" />

            {/* Main TV Screen Glow - Stronger */}
            <pointLight 
                position={[0, 0.5, 4]} 
                intensity={started ? 1.2 : 0} 
                color="#33ff55" 
                distance={6} 
                decay={2} 
            />
            
            {/* Secondary TV Glow */}
            <pointLight 
                position={[5.5, 0, 3]} 
                intensity={started ? 0.4 : 0} 
                color="#8888ff" 
                distance={4} 
                decay={2} 
            />

            {/* Environment for reflections */}
            <Environment preset="night" blur={0.6} background={false} />

            {/* The Main TV (Randomizer) - CENTERED & PROMINENT */}
            <TV 
                position={[0, 0.3, 0]} 
                rotation={[0, 0, 0]} 
                wheelState={wheelState} 
                active={started} 
            />

            {/* The Second TV (Video) - Smaller, to the side */}
            <VideoTV 
                position={[5.5, -0.3, -0.5]} 
                rotation={[0, -0.3, 0]} 
                scale={0.7}
                active={started} 
            />

            {/* Peripherals */}
            <Keyboard position={[0, -1.85, 4]} scale={0.22} rotation={[-0.1, 0, 0]} />
            <Mouse position={[2.5, -1.85, 3.8]} scale={0.22} rotation={[0, -0.2, 0]} />

            {/* Table Top - Premium Wood */}
            <mesh position={[0, -2.1, 1]} receiveShadow castShadow>
                <boxGeometry args={[16, 0.25, 7]} />
                <meshStandardMaterial color="#2a1f14" roughness={0.5} metalness={0.05} />
            </mesh>
            
            {/* Table edge detail */}
            <mesh position={[0, -2.0, 4.45]} receiveShadow>
                <boxGeometry args={[16, 0.1, 0.15]} />
                <meshStandardMaterial color="#1a1510" roughness={0.4} />
            </mesh>

            {/* Table Legs - Thicker */}
            {[[-7.5, 4], [7.5, 4], [-7.5, -2], [7.5, -2]].map(([x, z], i) => (
                <mesh key={i} position={[x, -4.1, z]} castShadow>
                    <cylinderGeometry args={[0.15, 0.12, 4]} />
                    <meshStandardMaterial color="#1a1510" roughness={0.6} />
                </mesh>
            ))}

            {/* Decorative Items */}
            
            {/* Stack of books - left side */}
            <group position={[-6, -1.85, 0.5]} rotation={[0, 0.4, 0]}>
                <mesh castShadow position={[0, 0, 0]}>
                    <boxGeometry args={[0.9, 0.35, 1.1]} />
                    <meshStandardMaterial color="#8b2020" roughness={0.8} />
                </mesh>
                <mesh castShadow position={[0.05, 0.35, 0]} rotation={[0, 0.15, 0]}>
                    <boxGeometry args={[0.8, 0.3, 1]} />
                    <meshStandardMaterial color="#1a3366" roughness={0.8} />
                </mesh>
                <mesh castShadow position={[-0.05, 0.65, 0.05]} rotation={[0, -0.1, 0]}>
                    <boxGeometry args={[0.75, 0.25, 0.9]} />
                    <meshStandardMaterial color="#2d5a27" roughness={0.8} />
                </mesh>
            </group>

            {/* Coffee mug */}
            <group position={[-3, -1.85, 3.5]}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.18, 0.16, 0.45]} />
                    <meshStandardMaterial color="#f5f5f0" roughness={0.3} />
                </mesh>
                <mesh position={[0.2, 0, 0]} rotation={[0, 0, 1.57]}>
                    <torusGeometry args={[0.12, 0.025, 12, 24]} />
                    <meshStandardMaterial color="#f5f5f0" roughness={0.3} />
                </mesh>
                {/* Coffee inside */}
                <mesh position={[0, 0.18, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.05]} />
                    <meshStandardMaterial color="#3d2817" roughness={0.2} />
                </mesh>
            </group>

            {/* Small plant */}
            <group position={[6.5, -1.6, 2]}>
                <mesh castShadow position={[0, -0.25, 0]}>
                    <cylinderGeometry args={[0.2, 0.15, 0.5]} />
                    <meshStandardMaterial color="#8b4513" roughness={0.8} />
                </mesh>
                {/* Leaves */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <mesh key={i} position={[Math.cos(angle * Math.PI / 180) * 0.1, 0.1, Math.sin(angle * Math.PI / 180) * 0.1]} rotation={[0.3, angle * Math.PI / 180, 0.2]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="#228b22" roughness={0.7} />
                    </mesh>
                ))}
            </group>

            {/* Floor - Darker wood */}
            <mesh position={[0, -6.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[40, 25]} />
                <meshStandardMaterial color="#1a1410" roughness={0.85} />
            </mesh>

            {/* Back Wall - Subtle texture */}
            <mesh position={[0, 2, -6]} receiveShadow>
                <planeGeometry args={[40, 18]} />
                <meshStandardMaterial color="#2a2520" roughness={0.9} />
            </mesh>

            {/* Decorative Wall Art */}
            <group position={[-5, 3, -5.9]}>
                {/* Frame */}
                <mesh>
                    <boxGeometry args={[2.5, 3.5, 0.1]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
                </mesh>
                {/* Art */}
                <mesh position={[0, 0, 0.06]}>
                    <planeGeometry args={[2.2, 3.2]} />
                    <meshStandardMaterial color="#ff4444" emissive="#441111" emissiveIntensity={0.3} />
                </mesh>
            </group>
            
            {/* Second frame */}
            <group position={[5, 3.5, -5.9]}>
                <mesh>
                    <boxGeometry args={[2, 2, 0.1]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.06]}>
                    <planeGeometry args={[1.7, 1.7]} />
                    <meshStandardMaterial color="#4466aa" emissive="#112244" emissiveIntensity={0.3} />
                </mesh>
            </group>

            {/* Shadows */}
            <ContactShadows 
                position={[0, -1.97, 1]} 
                opacity={0.6} 
                scale={18} 
                blur={2.5} 
                far={5} 
            />

            {/* Camera Control */}
            <OrbitControls 
                target={[0, 0, 0]} 
                minPolarAngle={Math.PI / 4} 
                maxPolarAngle={Math.PI / 2.2} 
                minDistance={6}
                maxDistance={15}
                enableZoom={true} 
                enablePan={false} 
            />
        </>
    );
}
