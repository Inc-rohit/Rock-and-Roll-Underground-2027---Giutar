"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/Soda-can.gltf");

const flavorTextures = {
    monsterGreen: "/labels/monster-green.png",
    lemonLime: "/labels/lemon-lime.png",
    grape: "/labels/grape.png",
    blackCherry: "/labels/cherry.png",
    strawberryLemonade: "/labels/strawberry.png",
    watermelon: "/labels/watermelon.png",
};

const metalMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 1,
    color: "#bbbbbb",
});

// The GLTF model reads as a ~12 oz can. A real 16 oz can is taller at the SAME
// diameter (≈4.83" → ≈6.13"), so we stretch the model vertically by this ratio
// (Y only — X/Z/diameter unchanged). Applied here so every can — the finale
// pair, the falling can, and the sliding can — matches automatically.
const CAN_HEIGHT_RATIO = 1.27;

export type SodaCanProps = {
    flavor?: keyof typeof flavorTextures;
    scale?: number;
};

export function SodaCan({
    flavor = "monsterGreen",
    scale = 2,
    ...props
}: SodaCanProps) {
    const { nodes } = useGLTF("/Soda-can.gltf");

    const labels = useTexture(flavorTextures);

    // Fixes upside down labels
    labels.monsterGreen.flipY = false;
    // Rotate the Monster wrap so the claw logo faces the camera (front)
    labels.monsterGreen.wrapS = THREE.RepeatWrapping;
    labels.monsterGreen.offset.x = 0.25;
    labels.strawberryLemonade.flipY = false;
    labels.blackCherry.flipY = false;
    labels.watermelon.flipY = false;
    labels.grape.flipY = false;
    labels.lemonLime.flipY = false;

    const label = labels[flavor];

    return (
        <group {...props} dispose={null} scale={[scale, scale * CAN_HEIGHT_RATIO, scale]} rotation={[0, -Math.PI, 0]}>
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.cylinder as THREE.Mesh).geometry}
                material={metalMaterial}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.cylinder_1 as THREE.Mesh).geometry}
            >
                <meshStandardMaterial roughness={0.15} metalness={0.7} map={label} />
            </mesh>
            <mesh
                castShadow
                receiveShadow
                geometry={(nodes.Tab as THREE.Mesh).geometry}
                material={metalMaterial}
            />
        </group>
    );
}
