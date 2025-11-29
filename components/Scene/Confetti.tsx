import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 200;

export function Confetti({ active }: { active: boolean }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const [dummy] = useState(() => new THREE.Object3D());

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < COUNT; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0, color });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (!mesh.current || !active) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Reset if fell down
            if (particle.my < -5) {
                particle.t = Math.random() * 100;
                particle.my = 5; // Start from top
                particle.mx = (Math.random() - 0.5) * 5;
            } else {
                particle.my -= speed * 10; // Gravity
            }

            dummy.position.set(
                particle.mx + (particle.xFactor / 100) * Math.sin(t),
                particle.my,
                (particle.zFactor / 100) * Math.cos(t)
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current!.setMatrixAt(i, dummy.matrix);
            mesh.current!.setColorAt(i, particle.color);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} position={[0, 0, 0]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial side={THREE.DoubleSide} />
        </instancedMesh>
    );
}
