"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

useGLTF.preload("/guitar.glb");

export type GuitarProps = {
    /** Uniform scale. The model is ~2.5 units tall natively (upright). */
    scale?: number;
    /** Extra rotation (radians) applied on top, e.g. to face the camera. */
    rotation?: [number, number, number];
};

/**
 * The acoustic-guitar 3D model — drop-in replacement for the old <SodaCan>.
 * Each instance clones the cached scene so multiple guitars (e.g. the finale
 * pair) don't share one object in the scene graph.
 */
export function Guitar({ scale = 1, rotation = [0, 0, 0] }: GuitarProps) {
    const { scene } = useGLTF("/guitar.glb");
    const model = useMemo(() => {
        const clone = scene.clone(true);
        // A touch of material warmth + reflectivity so it isn't flat under the
        // stage lighting / HDR environment.
        clone.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.isMesh) {
                mesh.castShadow = false;
                mesh.receiveShadow = false;
            }
        });
        return clone;
    }, [scene]);

    return <primitive object={model} scale={scale} rotation={rotation} />;
}
