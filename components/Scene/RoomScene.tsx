import React, { useEffect } from "react";
import { TV } from "./TV";
import { VideoTV } from "./VideoTV";
import { Keyboard } from "./Keyboard";
import { Mouse } from "./Mouse";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { useWheel } from "@/components/Screen/useWheel";

import { playSound } from "@/utils/sound";

export function RoomScene() {
    const wheelState = useWheel();
    const { winner, spinning } = wheelState;

    // Sound Effects
    useEffect(() => {
        if (winner) {
            playSound("win");
        }
    }, [winner]);

    useEffect(() => {
        if (spinning) {
            // Loop spin sound
            const interval = setInterval(() => {
                playSound("spin");
            }, 50); // Ratchet sound every 50ms
            return () => clearInterval(interval);
        }
    }, [spinning]);

    return (
        <>
            {/* Lighting - Cozy & Directed */}
            <ambientLight intensity={0.4} color="#fff0e0" />
            <spotLight
                position={[5, 8, 5]}
                angle={0.4}
                penumbra={0.5}
                intensity={3}
                castShadow
                shadow-bias={-0.0001}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffaa00" />

            {/* Screen Glows */}
            <pointLight position={[-3, 0, 2]} intensity={0.5} color="#aaffaa" distance={4} decay={2} />
            <pointLight position={[3, 0, 2]} intensity={0.3} color="#aaaaff" distance={4} decay={2} />

            {/* Environment for clear reflections */}
            <Environment preset="city" blur={0.5} background={false} />

            {/* The Main TV (Randomizer) */}
            <TV position={[-2.5, 0, 0]} rotation={[0, 0.1, 0]} wheelState={wheelState} />

            {/* The Second TV (Video) */}
            <VideoTV position={[2.5, 0, 0]} rotation={[0, -0.1, 0]} />

            {/* Peripherals */}
            <Keyboard position={[-2.5, -1.7, 3]} scale={0.2} rotation={[-0.1, 0.1, 0]} />
            <Mouse position={[0, -1.7, 3]} scale={0.2} rotation={[0, -0.1, 0]} />



            {/* Table Top - Widened */}
            <mesh position={[0, -1.9, 1]} receiveShadow castShadow>
                <boxGeometry args={[14, 0.2, 6]} />
                <meshStandardMaterial color="#3d2817" roughness={0.6} />
            </mesh>

            {/* Table Legs */}
            <mesh position={[-6.5, -3.9, 3.5]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 4]} />
                <meshStandardMaterial color="#2a1d10" />
            </mesh>
            <mesh position={[6.5, -3.9, 3.5]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 4]} />
                <meshStandardMaterial color="#2a1d10" />
            </mesh>
            <mesh position={[-6.5, -3.9, -1.5]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 4]} />
                <meshStandardMaterial color="#2a1d10" />
            </mesh>
            <mesh position={[6.5, -3.9, -1.5]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 4]} />
                <meshStandardMaterial color="#2a1d10" />
            </mesh>

            {/* Clutter - Books */}
            <group position={[-5.5, -1.65, 1]} rotation={[0, 0.5, 0]}>
                <mesh castShadow position={[0, 0, 0]}>
                    <boxGeometry args={[0.8, 0.3, 1]} />
                    <meshStandardMaterial color="#8b0000" />
                </mesh>
                <mesh castShadow position={[0.1, 0.3, 0]} rotation={[0, 0.2, 0]}>
                    <boxGeometry args={[0.7, 0.3, 0.9]} />
                    <meshStandardMaterial color="#00008b" />
                </mesh>
            </group>

            {/* Clutter - Mug */}
            <group position={[5, -1.8, 1]}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.15, 0.15, 0.4]} />
                    <meshStandardMaterial color="#eee" />
                </mesh>
                <mesh position={[0.15, 0, 0]} rotation={[0, 0, 1.57]}>
                    <torusGeometry args={[0.1, 0.02, 8, 16]} />
                    <meshStandardMaterial color="#eee" />
                </mesh>
            </group>

            {/* Floor */}
            <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[30, 20]} />
                <meshStandardMaterial color="#3d2817" roughness={0.8} />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 0, -5]} receiveShadow>
                <planeGeometry args={[30, 15]} />
                <meshStandardMaterial color="#d0d0d0" />
            </mesh>

            {/* Poster on Wall */}
            <mesh position={[0, 2, -4.9]}>
                <planeGeometry args={[2, 3]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 2, -4.89]}>
                <planeGeometry args={[1.8, 2.8]} />
                <meshStandardMaterial color="#ff5555" emissive="#550000" emissiveIntensity={0.5} />
            </mesh>

            {/* Shadows */}
            <ContactShadows position={[0, -1.79, 0]} opacity={0.7} scale={15} blur={2} far={4} />

            {/* Camera Control */}
            <OrbitControls target={[0, -1, 0]} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} enableZoom={true} enablePan={false} />
        </>
    );
}
