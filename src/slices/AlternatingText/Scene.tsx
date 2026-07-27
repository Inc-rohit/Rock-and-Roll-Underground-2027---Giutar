"use client";

import { Environment } from "@react-three/drei";
import { useRef } from "react";
import { Group } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import FloatingCan from "@/components/FloatingCan";
import { useMediaQuery } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

            // Smooth glide + tilt: the can stays on screen the whole time and
            // glides side-to-side WITH the scroll — leaning into the direction of
            // travel (z-tilt that peaks mid-glide and straightens) and settling
            // with a slight turn toward the active block (y). Continuous & scrubbed,
            // so there's no pop timing to mis-fire; it rests at each block, then
            // glides across to the next.
            sections.forEach((_, index) => {
                if (index === 0) return;

                const isOdd = index % 2 !== 0;
                const xPosition = isDesktop ? (isOdd ? -1 : 1) : 0;
                const yLean = isDesktop ? (isOdd ? 0.4 : -0.4) : 0;
                const tilt = isDesktop ? (isOdd ? 0.22 : -0.22) : 0;

                scrollTl
                    .to(can.position, { x: xPosition, duration: 1, ease: "power2.inOut", delay: 0.5 })
                    .to(can.rotation, { y: yLean, duration: 1, ease: "power2.inOut" }, "<")
                    .to(
                        can.rotation,
                        { z: tilt, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 1 },
                        "<",
                    );
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
            <FloatingCan flavor="monsterGreen" scale={0.6} />
            <Environment files={"/hdr/lobby.hdr"} environmentIntensity={1.5} />
        </group>
    );
}
