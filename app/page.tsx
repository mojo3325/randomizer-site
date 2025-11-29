"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { RoomScene } from "@/components/Scene/RoomScene";
import { Loader } from "@react-three/drei";

export default function Home() {
  return (
    <main className="w-full h-screen bg-black relative">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3, 11], fov: 30 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <RoomScene />
        </Suspense>
      </Canvas>
      <Loader />

      {/* Overlay Instructions */}
      <div className="absolute bottom-4 left-4 text-white/30 text-xs font-mono pointer-events-none">
        <p>RETRO RANDOMIZER v1.0</p>
        <p>INTERACT WITH TV SCREEN</p>
      </div>
    </main>
  );
}
