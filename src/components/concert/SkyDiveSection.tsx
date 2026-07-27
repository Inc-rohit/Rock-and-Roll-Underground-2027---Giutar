"use client";

import { useEffect } from "react";
import { View } from "@react-three/drei";

import { Bounded } from "@/components/Bounded";
import Scene from "@/slices/SkyDive/Scene";
import { useStore } from "@/hooks/useStore";

/**
 * Standalone sky-dive section — the falling green can, red stage-smoke clouds,
 * and gold 3D words, reusing the original SkyDive `Scene`. It sits after the
 * Sponsor Benefits finale as a beat of our own experience.
 *
 * `.skydive-bg` is a backdrop layer behind the (transparent) 3D view; the Scene
 * fades it dark → deep RRU red across the scroll so it hands off seamlessly into
 * the red AlternatingText section below.
 *
 * The negative top-margin overlaps the tail of the audience section so there's
 * no dead-black gap — but only partway, leaving a beat of breathing room before
 * the can and first word arrive.
 */
const SENTENCE = "Amplify Your Impact";

export default function SkyDiveSection() {
    const isReady = useStore((state) => state.isReady);

    useEffect(() => {
        isReady();
    }, [isReady]);

    return (
        <Bounded className="relative skydive -mt-[40vh] h-screen">
            <div className="skydive-bg pointer-events-none absolute inset-0" />
            <h2 className="sr-only">{SENTENCE}</h2>
            <View className="h-screen w-screen">
                <Scene flavor="monsterGreen" sentence={SENTENCE} />
            </View>
        </Bounded>
    );
}
