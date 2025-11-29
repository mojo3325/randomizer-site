import React, { useRef, useState, useEffect } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { playSound } from "@/utils/sound";

const playMouseClick = () => {
    playSound("mouse");
};

export function Mouse(props: any) {
    const [clicked, setClicked] = useState(false);
    const group = useRef<THREE.Group>(null);
    const { camera, pointer } = useThree();

    // Virtual plane for mouse movement (at y = -1.7)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.7);
    const planeIntersectPoint = new THREE.Vector3();

    // Listen to global mouse events
    useEffect(() => {
        const handleMouseDown = () => {
            setClicked(true);
            playMouseClick();
        };
        const handleMouseUp = () => setClicked(false);

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useFrame(() => {
        if (group.current) {
            // Click animation
            const scale = clicked ? 0.9 : 1;
            group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, scale, 0.2));

            // Movement tracking
            // Create a ray from camera through pointer
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(pointer, camera);

            // Intersect with the virtual plane
            if (raycaster.ray.intersectPlane(plane, planeIntersectPoint)) {
                // Clamp the movement to keep it on the table/mousepad area
                // Initial position is roughly [0, -1.7, 3] passed via props, but we want to move relative to that or absolute?
                // The props.position is likely the starting point. 
                // Let's assume the mouse area is bounded.

                // We want the mouse to move somewhat with the cursor but not fly away.
                // Let's lerp towards the intersection point but clamp it.

                // Clamping limits (approximate table area for mouse)
                // Table is roughly centered at 0, width 14, depth 6.
                // Mouse usually sits on the right side.
                // Let's just make it follow the cursor with some lag and offset.

                const targetX = THREE.MathUtils.clamp(planeIntersectPoint.x, -1, 4); // Limit X range
                const targetZ = THREE.MathUtils.clamp(planeIntersectPoint.z, 2, 4);  // Limit Z range

                // We only update X and Z. Y is fixed by the plane/props.
                // However, props.position might be setting the initial transform.
                // If we overwrite position, we ignore props.position.
                // Let's use the ref's position.

                group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.1);
                group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.1);
            }
        }
    });

    return (
        <group
            ref={group}
            {...props}
        // We override position in useFrame, so props.position is just initial
        >
            {/* Mouse Body - Retro Beige Boxy Shape */}
            <RoundedBox args={[0.6, 0.3, 0.9]} radius={0.05} smoothness={4} position={[0, 0.15, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#dcd3b2" roughness={0.6} />
            </RoundedBox>

            {/* Left Button */}
            <mesh position={[-0.15, 0.31, -0.25]}>
                <boxGeometry args={[0.25, 0.02, 0.3]} />
                <meshStandardMaterial color={clicked ? "#b0b0b0" : "#d0c8a0"} />
            </mesh>

            {/* Right Button */}
            <mesh position={[0.15, 0.31, -0.25]}>
                <boxGeometry args={[0.25, 0.02, 0.3]} />
                <meshStandardMaterial color="#d0c8a0" />
            </mesh>

            {/* Cable Connector */}
            <mesh position={[0, 0.1, -0.45]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Cable */}
            <mesh position={[0, 0.1, -1]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1]} />
                <meshStandardMaterial color="#222" />
            </mesh>

            {/* Ball (Underneath - invisible but implies structure) */}
            <mesh position={[0, 0.05, 0]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="#111" />
            </mesh>
        </group>
    );
}
