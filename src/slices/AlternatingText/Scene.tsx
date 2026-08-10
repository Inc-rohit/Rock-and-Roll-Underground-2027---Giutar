"use client";

import { Environment } from "@react-three/drei";
import { useRef } from "react";
import { Group } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import FloatingCan from "@/components/FloatingCan";
import { guitarScaleFor } from "@/components/Guitar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Shared <ViewCanvas> camera: fov 30 at z 5 → a 2.68-unit-tall frame. This slice
// already fit (the old 0.6 ≈ 56% of the frame); derived here so it stays correct
// if the canvas camera is ever retuned. The guitar only turns ±0.4 rad here, so
// it never reaches the edge-on angles and needs no faceOnBias.
const GUITAR_SCALE = guitarScaleFor(30, 5, 0.56);

type Props = object;

export default function Scene({ }: Props) {
    const canRef = useRef<Group>(null);
    const isDesktop = useMediaQuery("(min-width: 768px)", true);

    useGSAP(
        () => {
            const can = canRef.current;
            if (!can) return;

            const sections = gsap.utils.toArray<HTMLElement>(".alternating-section");
            if (!sections.length) return;

            gsap.set(can.scale, { x: 1, y: 1, z: 1 });

            const scrollTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".alternating-text-view",
                    endTrigger: ".alternating-text-container",
                    pin: true,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.6,
                },
            });

            // Smooth glide: the guitar stays UPRIGHT the whole time and glides
            // side-to-side WITH the scroll, settling with a slight turn toward the
            // active block (a rotation around its vertical axis only — no z-tilt,
            // so it always stands straight). Continuous & scrubbed; it rests at
            // each block, then glides across to the next.
            sections.forEach((_, index) => {
                if (index === 0) return;

                const isOdd = index % 2 !== 0;
                const xPosition = isDesktop ? (isOdd ? -1 : 1) : 0;
                const yLean = isDesktop ? (isOdd ? 0.4 : -0.4) : 0;

                scrollTl
                    .to(can.position, { x: xPosition, duration: 1, ease: "power2.inOut", delay: 0.5 })
                    .to(can.rotation, { y: yLean, duration: 1, ease: "power2.inOut" }, "<");
            });
        },
        { dependencies: [isDesktop] },
    );

    return (
        <group
            ref={canRef}
            position-x={isDesktop ? 1 : 0}
            rotation-y={isDesktop ? -0.3 : 0}
        >
            <FloatingCan flavor="monsterGreen" scale={GUITAR_SCALE} />
            <Environment files={"/hdr/lobby.hdr"} environmentIntensity={1.5} />
        </group>
    );
}
