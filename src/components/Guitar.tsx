"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { mergeVertices, toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const MODEL = "/electric-guitar.glb";
// The model is normalized to this height (world units) inside the component, so
// the scene-level scales stay valid no matter what the source GLB's native size
// is. 2.5 matches the height the scenes were originally tuned around.
const TARGET_HEIGHT = 2.5;
// Normals smoother than this angle are averaged (round the neck / curves);
// sharper edges (body outline, headstock) stay crisp.
const CREASE_ANGLE = (60 * Math.PI) / 180;

useGLTF.preload(MODEL);

/**
 * Prepare the source scene ONCE (cached across every instance): weld coincident
 * vertices and recompute CREASED normals so the model shades smoothly on its
 * curved surfaces instead of showing hard facets, and give it a glossier PBR
 * material so it catches the stage HDR like real lacquered wood/metal.
 *
 * NB: we deliberately do NOT geometrically subdivide this model — its mesh is
 * non-manifold, multi-primitive low-poly, which Loop subdivision can't process
 * (it either empties or shreds the geometry). Smoothing here is shading/material
 * only; a genuinely high-poly look needs a higher-detail source GLB (drop one in
 * public/ and it's a one-line swap — the normalization below handles any size).
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

        // Weld duplicated verts, then smooth normals below the crease angle.
        let geo = mesh.geometry;
        try {
            geo = mergeVertices(geo);
        } catch {
            /* some attribute layouts can't be merged — fall back to as-is */
        }
        geo = toCreasedNormals(geo, CREASE_ANGLE);
        mesh.geometry = geo;

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.isMeshStandardMaterial) {
            mat.metalness = 0.35;
            mat.roughness = 0.4;
            mat.envMapIntensity = 1.1;
            mat.flatShading = false;
            mat.needsUpdate = true;
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
 * Each instance clones the (once-)prepared scene so multiple guitars (e.g. the
 * finale pair) don't share one object in the scene graph. The clone is then
 * NORMALIZED — recentered to the origin and uniformly scaled to a fixed
 * TARGET_HEIGHT — and wrapped in a group, so the per-scene `scale`/`rotation`
 * props behave the same regardless of the source model's native dimensions
 * (swap the GLB and the scenes keep their tuning).
 */
export function Guitar({ scale = 1, rotation = [0, 0, 0] }: GuitarProps) {
    const { scene } = useGLTF(MODEL);
    const model = useMemo(() => {
        const clone = prepareScene(scene).clone(true);

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
