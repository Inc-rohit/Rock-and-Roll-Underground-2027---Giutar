"use client";

import * as THREE from "three";
import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import gsap from "gsap";

// Shared scratch object for writing instance matrices.
const o = new THREE.Object3D();

const PALETTE = [
    new THREE.Color("#e23b2e"), // red
    new THREE.Color("#84c226"), // Monster green
    new THREE.Color("#ffffff"), // white
];

/**
 * A field of carbonation bubbles drifting upward on the Sponsor Benefits black
 * backdrop. Each bubble carries a per-instance red / green / white tint, varies
 * in size, and gets a fresnel pass (see-through centre, lit rim) so it reads as
 * a hollow bubble. Kept deliberately cheap for scroll performance: a standard
 * material (no clearcoat/iridescence), capped dpr, and the canvas only runs its
 * render loop while the section is on screen (see AudienceBubbles).
 */
function BubbleField({ count = 55 }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const speed = useRef(new Float32Array(count));
    const sizes = useRef(new Float32Array(count));

    const material = useMemo(() => {
        const m = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 1,
            roughness: 0.12,
            metalness: 0.1,
            envMapIntensity: 1.3,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        // Fresnel: transparent centre, brighter/opaque rim.
        m.onBeforeCompile = (shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <dithering_fragment>",
                `{
                    float rim = pow(1.0 - abs(normalize(vNormal).z), 2.0);
                    gl_FragColor.a *= mix(0.06, 0.92, rim);
                    gl_FragColor.rgb += rim * 0.35;
                }
                #include <dithering_fragment>`,
            );
        };
        return m;
    }, []);

    useEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;
        for (let i = 0; i < count; i++) {
            const big = gsap.utils.random(0, 1) > 0.78;
            const s = big ? gsap.utils.random(1.7, 2.8) : gsap.utils.random(0.4, 1.1);
            sizes.current[i] = s;
            o.position.set(
                gsap.utils.random(-5.5, 5.5),
                gsap.utils.random(-4, 4),
                gsap.utils.random(-1, 2),
            );
            o.scale.setScalar(s);
            o.rotation.set(0, 0, 0);
            o.updateMatrix();
            mesh.setMatrixAt(i, o.matrix);
            mesh.setColorAt(i, PALETTE[Math.floor(gsap.utils.random(0, PALETTE.length))]);
            speed.current[i] = gsap.utils.random(0.004, 0.02);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }, [count]);

    useFrame(() => {
        const mesh = meshRef.current;
        if (!mesh) return;
        for (let i = 0; i < count; i++) {
            mesh.getMatrixAt(i, o.matrix);
            o.position.setFromMatrixPosition(o.matrix);
            o.position.y += speed.current[i];
            if (o.position.y > 4.4) {
                o.position.y = -4.4;
                o.position.x = gsap.utils.random(-5.5, 5.5);
            }
            o.scale.setScalar(sizes.current[i]);
            o.rotation.set(0, 0, 0);
            o.updateMatrix();
            mesh.setMatrixAt(i, o.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, count]}
            material={material}
            frustumCulled={false}
        >
            <sphereGeometry args={[0.06, 14, 14]} />
        </instancedMesh>
    );
}

export default function AudienceBubbles() {
    // Only run the (second) WebGL render loop while this section is on screen —
    // otherwise it renders every frame across the whole page and starves the
    // scroll. IntersectionObserver flips frameloop on/off.
    const [active, setActive] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
            rootMargin: "200px",
        });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={wrapRef} className="h-full w-full">
            <Canvas
                frameloop={active ? "always" : "never"}
                camera={{ fov: 42, position: [0, 0, 6] }}
                gl={{ alpha: true, powerPreference: "high-performance" }}
                dpr={1}
            >
                <BubbleField />
                <ambientLight intensity={0.8} />
                <directionalLight position={[3, 4, 5]} intensity={1.4} />
                <Environment files="/hdr/lobby.hdr" environmentIntensity={0.8} />
            </Canvas>
        </div>
    );
}
