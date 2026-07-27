"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Group } from "three";

import { Guitar } from "@/components/Guitar";

/**
 * Module-level 3D transform state for the audience cans. The AudienceSection
 * scrub timeline tweens these values directly and this canvas reads them each
 * frame (a plain object avoids per-frame React re-renders).
 *
 * This mirrors the Monster Hero's Scene.tsx EXACTLY: the two cans sit in a
 * shared group, and the signature motion is `group.rotation.y → Math.PI * 2`
 * — the whole group REVOLVES a full 360° as you scroll, so the cans orbit
 * through depth (toward/away from the camera) rather than spinning in place.
 *
 *   groupRotY — the Hero-style group revolution (0 → 2π across the finale).
 *   a — primary can (rises in for Pre-Event; right flank for the finale).
 *   b — the twin that flies in for the "convert into two" beat (left flank).
 */
export const audCan = {
    groupRotY: 0,
    a: { x: 0, y: -4.8, z: 0, rotZ: 0, scale: 0 },
    b: { x: -1.6, y: 0, z: 0, rotZ: 0, scale: 0 },
};

function apply(g: Group | null, s: { x: number; y: number; z: number; rotZ: number; scale: number }) {
    if (!g) return;
    g.position.set(s.x, s.y, s.z);
    g.rotation.z = s.rotZ;
    g.scale.setScalar(s.scale);
    g.visible = s.scale > 0.001;
}

function Cans() {
    const group = useRef<Group>(null); // revolves 360° on scroll (the Hero mechanic)
    const aOuter = useRef<Group>(null);
    const bOuter = useRef<Group>(null);
    const aSpin = useRef<Group>(null);
    const bSpin = useRef<Group>(null);

    useFrame((_, delta) => {
        if (group.current) group.current.rotation.y = audCan.groupRotY;
        apply(aOuter.current, audCan.a);
        apply(bOuter.current, audCan.b);
        // Gentle, always-on idle spin (opposite directions) so the cans never
        // read as frozen product shots when the scroll is at rest. It's slow
        // enough not to fight the scroll-driven group revolution.
        const d = delta * 0.45;
        if (aSpin.current) aSpin.current.rotation.y += d;
        if (bSpin.current) bSpin.current.rotation.y -= d;
    });

    return (
        <group ref={group}>
            <group ref={aOuter}>
                <group ref={aSpin}>
                    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={1.1}>
                        <Guitar scale={1.2} />
                    </Float>
                </group>
            </group>
            <group ref={bOuter}>
                <group ref={bSpin}>
                    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={1.1}>
                        <Guitar scale={1.2} />
                    </Float>
                </group>
            </group>
        </group>
    );
}

export default function AudienceCanStage() {
    return (
        <Canvas
            camera={{ fov: 28, position: [0, 0, 6.5] }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <Cans />
                <ambientLight intensity={1.1} />
                <directionalLight position={[4, 5, 6]} intensity={2.2} />
                <directionalLight position={[-4, 2, 3]} intensity={0.8} color="#84C226" />
                <Environment files="/hdr/lobby.hdr" environmentIntensity={1.4} />
            </Suspense>
        </Canvas>
    );
}
