"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Group } from "three";

import { Guitar, faceOnBias, guitarScaleFor } from "@/components/Guitar";

// Camera for this stage (kept next to the <Canvas> below — change both together).
const FOV = 28;
const CAM_Z = 6.5;
// Fill ~2/3 of the frame height. At fov 28 / z 6.5 the visible frame is 3.24
// world units tall, so the old hard-coded 1.2 made the guitar 3.0 units — 93%
// of the frame — and the neck and body were clipped off the top and bottom.
const GUITAR_SCALE = guitarScaleFor(FOV, CAM_Z, 0.66);

/**
 * Module-level 3D transform state for the audience cans. The AudienceSection
 * scrub timeline tweens these values directly and this canvas reads them each
 * frame (a plain object avoids per-frame React re-renders).
 *
 * The two guitars sit at fixed flank points and each STANDS STRAIGHT (upright,
 * no tilt) and rotates AT ITS OWN POINT — spinning around its own vertical axis
 * in place (a gentle idle spin + the scroll-driven amount). They do NOT orbit
 * through depth or tilt (that read fine for cans, not for guitars).
 *
 *   groupRotY — scroll-driven spin amount (0 → 2π across the finale), applied to
 *               each guitar's OWN vertical-axis rotation.
 *   a — primary guitar (rises in for Pre-Event; right flank for the finale).
 *   b — the twin that flies in for the "convert into two" beat (left flank).
 */
export const audCan = {
    groupRotY: 0,
    a: { x: 0, y: -4.8, z: 0, rotZ: 0, scale: 0 },
    b: { x: -1.6, y: 0, z: 0, rotZ: 0, scale: 0 },
};

// Slight backward lean so the guitar STANDS at ~80° (not stiff-vertical),
// applied on the OUTER group. Because the axis-spin lives on the inner group
// (around the guitar's long axis), the long axis stays fixed at this lean while
// the face rolls around — a clean "guitar on a rotating stand" look, no wobble.
const LEAN_X = -0.2; // ≈ 11.5° back-lean → ~78–80° upright

function apply(g: Group | null, s: { x: number; y: number; z: number; rotZ: number; scale: number }) {
    if (!g) return;
    g.position.set(s.x, s.y, s.z);
    g.rotation.set(LEAN_X, 0, 0); // stand at ~80° (slight back-lean), no z-tilt
    g.scale.setScalar(s.scale);
    g.visible = s.scale > 0.001;
}

function Cans() {
    const group = useRef<Group>(null); // revolves 360° on scroll (the Hero mechanic)
    const aOuter = useRef<Group>(null);
    const bOuter = useRef<Group>(null);
    const aSpin = useRef<Group>(null);
    const bSpin = useRef<Group>(null);
    const spin = useRef(0);

    useFrame((_, delta) => {
        // No group revolution — the guitars stay put at their flank points
        // instead of orbiting through depth.
        if (group.current) group.current.rotation.y = 0;
        apply(aOuter.current, audCan.a);
        apply(bOuter.current, audCan.b);
        // Each guitar rotates AT ITS OWN POINT: a gentle always-on spin around
        // its vertical axis + the scroll-driven amount (groupRotY, 0→2π over the
        // finale). Mirrored directions for the pair. The angle is warped by
        // faceOnBias so the pair lingers face-on and sweeps quickly through the
        // edge-on quarters, where a guitar is only 0.23 units thick and used to
        // read as if it had vanished.
        spin.current += delta * 0.22;
        const angle = faceOnBias(spin.current + audCan.groupRotY);
        if (aSpin.current) aSpin.current.rotation.y = angle;
        if (bSpin.current) bSpin.current.rotation.y = -angle;
    });

    return (
        <group ref={group}>
            <group ref={aOuter}>
                <group ref={aSpin}>
                    <Float speed={1.4} rotationIntensity={0} floatIntensity={0.8}>
                        <Guitar scale={GUITAR_SCALE} />
                    </Float>
                </group>
            </group>
            <group ref={bOuter}>
                <group ref={bSpin}>
                    <Float speed={1.4} rotationIntensity={0} floatIntensity={0.8}>
                        <Guitar scale={GUITAR_SCALE} />
                    </Float>
                </group>
            </group>
        </group>
    );
}

export default function AudienceCanStage() {
    return (
        <Canvas
            camera={{ fov: FOV, position: [0, 0, CAM_Z] }}
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
