"use client";

import { Cloud, Clouds, Environment, Text } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import FloatingCan from "@/components/FloatingCan";
import { SodaCanProps } from "@/components/SodaCan";
import { useMediaQuery } from "@/hooks/useMediaQuery";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type SkyDiveProps = {
    sentence: string | null;
    flavor: SodaCanProps["flavor"];
};

export default function Scene({ sentence, flavor }: SkyDiveProps) {
    const groupRef = useRef<THREE.Group>(null);
    const canRef = useRef<THREE.Group>(null);
    const cloud1Ref = useRef<THREE.Group>(null);
    const cloud2Ref = useRef<THREE.Group>(null);
    const cloudsRef = useRef<THREE.Group>(null);
    const wordsRef = useRef<THREE.Group>(null);

    const ANGLE = 75 * (Math.PI / 180);

    const getXPosition = (distance: number) => distance * Math.cos(ANGLE);
    const getYPosition = (distance: number) => distance * Math.sin(ANGLE);

    const getXYPositions = (distance: number) => ({
        x: getXPosition(distance),
        y: getYPosition(-1 * distance),
    });

    useGSAP(() => {
        if (
            !cloudsRef.current ||
            !canRef.current ||
            !wordsRef.current ||
            !cloud1Ref.current ||
            !cloud2Ref.current
        )
            return;

        // Set initial positions
        gsap.set(cloudsRef.current.position, { z: 10 });
        gsap.set(canRef.current.position, {
            ...getXYPositions(-4),
        });

        gsap.set(
            wordsRef.current.children.map((word) => word.position),
            { ...getXYPositions(7), z: 2 },
        );

        // Spinning can
        gsap.to(canRef.current.rotation, {
            y: Math.PI * 2,
            duration: 1.7,
            repeat: -1,
            ease: "none",
        });

        // Infinite cloud movement
        const DISTANCE = 15;
        const DURATION = 6;

        gsap.set([cloud2Ref.current.position, cloud1Ref.current.position], {
            ...getXYPositions(DISTANCE),
        });

        gsap.to(cloud1Ref.current.position, {
            y: `+=${getYPosition(DISTANCE * 2)}`,
            x: `+=${getXPosition(DISTANCE * -2)}`,
            ease: "none",
            repeat: -1,
            duration: DURATION,
        });

        gsap.to(cloud2Ref.current.position, {
            y: `+=${getYPosition(DISTANCE * 2)}`,
            x: `+=${getXPosition(DISTANCE * -2)}`,
            ease: "none",
            repeat: -1,
            delay: DURATION / 2,
            duration: DURATION,
        });

        // Backdrop starts dark (matching the Sponsor Benefits finale above).
        gsap.set(".skydive-bg", { backgroundColor: "#0a0505" });

        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".skydive",
                pin: true,
                start: "top top",
                end: "+=1200",
                scrub: 0.6,
            },
        });

        scrollTl
            .to(cloudsRef.current.position, { z: 0, duration: 0.3 }, 0)
            .to(canRef.current.position, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: "back.out(1.7)",
            })
            .to(
                wordsRef.current.children.map((word) => word.position),
                {
                    keyframes: [
                        { x: 0, y: 0, z: -1 },
                        { ...getXYPositions(-7), z: -7 },
                    ],
                    stagger: 0.3,
                },
                0,
            )
            // Keep the backdrop dark across the scroll so it hands off cleanly into
            // the black sponsor-tiers section below (the red clouds carry the colour).
            // Added LAST (at pos 0) so it does NOT push the can/word tweens later.
            .to(
                ".skydive-bg",
                {
                    backgroundColor: "#0a0505",
                    ease: "none",
                    overwrite: "auto",
                    duration: 1.3,
                },
                0,
            );
        // Note: the can is intentionally left centered at the end (no fly-away)
        // so the section scrolls into the next slice with content on screen
        // instead of ending on a blank frame.
    });

    return (
        <group ref={groupRef}>
            {/* Can */}
            <group rotation={[0, 0, 0.5]}>
                <FloatingCan
                    ref={canRef}
                    flavor={flavor}
                    scale={0.85}
                    rotationIntensity={0}
                    floatIntensity={3}
                    floatSpeed={3}
                >
                    <pointLight intensity={30} color="#84C226" decay={0.6} />
                </FloatingCan>
            </group>

            {/* Clouds — red stage smoke to match the RRU concert */}
            <Clouds ref={cloudsRef}>
                <Cloud ref={cloud1Ref} bounds={[10, 10, 2]} color="#8a3020" />
                <Cloud ref={cloud2Ref} bounds={[10, 10, 2]} color="#b5452a" />
            </Clouds>

            {/* Text — gold, matching the RRU headline/outlines */}
            <group ref={wordsRef}>
                {sentence && <ThreeText sentence={sentence} color="#f5c518" />}
            </group>

            {/* Lights — warm ambient + neutral reflections (no green tint) */}
            <ambientLight intensity={2} color="#ffd2b8" />
            <Environment files="/hdr/lobby.hdr" environmentIntensity={1.2} />
        </group>
    );
}

function ThreeText({
    sentence,
    color = "white",
}: {
    sentence: string;
    color?: string;
}) {
    const words = sentence.toUpperCase().split(" ");

    const material = new THREE.MeshLambertMaterial();
    const isDesktop = useMediaQuery("(min-width: 950px)", true);

    return words.map((word: string, wordIndex: number) => (
        <Text
            key={`${wordIndex}-${word}`}
            scale={isDesktop ? 0.4 : 0.24}
            color={color}
            material={material}
            font="/fonts/Alpino-Variable.woff"
            fontWeight={900}
            anchorX={"center"}
            anchorY={"middle"}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!,.?'"
        >
            {word}
        </Text>
    ));
}