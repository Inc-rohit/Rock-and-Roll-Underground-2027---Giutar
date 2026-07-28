"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const MODEL = "/electric-guitar.glb";
// The model is normalized to this height (world units) inside the component, so
// the scene-level scales stay valid no matter what the source GLB's native size
// is. 2.5 matches the height the scenes were originally tuned around.
const TARGET_HEIGHT = 2.5;
// This model already ships upright (long axis = Y, neck up), so no base
// re-orientation is needed before normalizing.
const BASE_ROTATION: [number, number, number] = [0, 0, 0];

useGLTF.preload(MODEL);

/**
 * Prepare the source scene ONCE (cached across every instance): disable shadows
 * and strip the baked ambient-occlusion. This is a high-poly model with authored
 * PBR textures (baseColor / normal / metallicRoughness), rendered essentially
 * AS-AUTHORED — no vertex welding or normal recompute (those would break the
 * normal map) — the only tweak is removing the AO "shadow" so it reads evenly lit.
 */
let preparedScene: THREE.Object3D | null = null;
function prepareScene(scene: THREE.Object3D): THREE.Object3D {
    if (preparedScene) return preparedScene;
    const base = scene.clone(true);
    base.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        // Remove the baked ambient-occlusion ("shadow") so the guitar reads
        // evenly lit — keeps metalness/roughness (they share the same texture).
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
            const sm = m as THREE.MeshStandardMaterial;
            if (sm && "aoMap" in sm) {
                sm.aoMap = null;
                sm.aoMapIntensity = 0;
                sm.needsUpdate = true;
            }
        }
    });
    preparedScene = base;
    return base;
}

export type GuitarProps = {
    /** Uniform scale, applied on top of the normalized (≈2.5-tall) model. */
    scale?: number;
    /** Extra rotation (radians) applied on top, e.g. to face the camera. */
    rotation?: [number, number, number];
};

/**
 * The electric-guitar 3D model — drop-in replacement for the old <SodaCan>.
 *
 * Each instance clones the (once-)prepared scene, applies the upright BASE
 * orientation, then NORMALIZES it — recentered to the origin and uniformly
 * scaled to a fixed TARGET_HEIGHT — via nested groups so the per-scene
 * `scale`/`rotation` props behave the same regardless of the source model's
 * native size/orientation (swap the GLB and the scenes keep their tuning).
 */
export function Guitar({ scale = 1, rotation = [0, 0, 0] }: GuitarProps) {
    const { scene } = useGLTF(MODEL);
    const model = useMemo(() => {
        const clone = prepareScene(scene).clone(true);
        clone.rotation.set(BASE_ROTATION[0], BASE_ROTATION[1], BASE_ROTATION[2]);
        clone.updateMatrixWorld(true);

        // Measure the (rotated) bounds, then recenter + scale to a fixed height.
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const k = size.y > 0 ? TARGET_HEIGHT / size.y : 1;

        // Normalization group (scale + recenter) wraps the oriented clone…
        const norm = new THREE.Group();
        norm.add(clone);
        norm.scale.setScalar(k);
        norm.position.set(-center.x * k, -center.y * k, -center.z * k);

        // …and an outer group takes the per-scene scale/rotation cleanly on top.
        const outer = new THREE.Group();
        outer.add(norm);
        return outer;
    }, [scene]);

    return <primitive object={model} scale={scale} rotation={rotation} />;
}
