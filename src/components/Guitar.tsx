"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const MODEL = "/electric-guitar.glb";
// The model is normalized to this height (world units) inside the component, so
// the scene-level scales stay valid no matter what the source GLB's native size
// is. 2.5 matches the height the scenes were originally tuned around.
const TARGET_HEIGHT = 2.5;

useGLTF.preload(MODEL);

export type GuitarProps = {
    /** Uniform scale, applied on top of the normalized (≈2.5-tall) model. */
    scale?: number;
    /** Extra rotation (radians) applied on top, e.g. to face the camera. */
    rotation?: [number, number, number];
};

/**
 * The electric-guitar 3D model — drop-in replacement for the old <SodaCan>.
 *
 * Each instance clones the cached scene so multiple guitars (e.g. the finale
 * pair) don't share one object in the scene graph. The clone is then NORMALIZED
 * — recentered to the origin and uniformly scaled to a fixed TARGET_HEIGHT —
 * and wrapped in a group, so the per-scene `scale`/`rotation` props behave the
 * same regardless of the source model's native dimensions (swap the GLB and the
 * scenes keep their tuning).
 */
export function Guitar({ scale = 1, rotation = [0, 0, 0] }: GuitarProps) {
    const { scene } = useGLTF(MODEL);
    const model = useMemo(() => {
        const clone = scene.clone(true);
        clone.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.isMesh) {
                mesh.castShadow = false;
                mesh.receiveShadow = false;
            }
        });

        // Recenter to origin + scale to a fixed height.
        clone.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const k = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
        clone.scale.setScalar(k);
        clone.position.set(-center.x * k, -center.y * k, -center.z * k);

        // Wrap so the scene-level scale/rotation apply cleanly on top of the
        // normalization transform baked into the clone.
        const group = new THREE.Group();
        group.add(clone);
        return group;
    }, [scene]);

    return <primitive object={model} scale={scale} rotation={rotation} />;
}
