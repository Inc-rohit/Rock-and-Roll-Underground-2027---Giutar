"use client"

import { forwardRef, ReactNode } from 'react'
import { Float } from '@react-three/drei'

import { Guitar } from '@/components/Guitar'
import { Group } from 'three'

type FloatingCanProps = {
    /** kept for API compatibility with the old can; ignored (guitar has one look) */
    flavor?: string;
    floatSpeed?: number;
    rotationIntensity?: number;
    floatIntensity?: number;
    floatingRange?: [number, number];
    /** inner guitar model scale */
    scale?: number;
    children?: ReactNode;
}

const FloatingCan = forwardRef<Group, FloatingCanProps>(
    ({
        flavor: _flavor,
        floatSpeed = 1.5,
        rotationIntensity = 1,
        floatIntensity = 1,
        floatingRange = [-0.1, 0.1],
        scale = 1,
        children,
        ...props
    }, ref

    ) => {
        void _flavor; // ignored — the guitar has a single look
        return (
            <group ref={ref} {...props}>
                <Float
                    speed={floatSpeed} // Animation speed, defaults to 1
                    rotationIntensity={rotationIntensity} // XYZ rotation intensity, defaults to 1
                    floatIntensity={floatIntensity} // Up/down float intensity, works like a multiplier with floatingRange, defaults to 1
                    floatingRange={floatingRange}
                >
                    {children}
                    <Guitar scale={scale} />
                </Float>
            </group>
        );
    }
);

FloatingCan.displayName = "FloatingCan"

export default FloatingCan;
