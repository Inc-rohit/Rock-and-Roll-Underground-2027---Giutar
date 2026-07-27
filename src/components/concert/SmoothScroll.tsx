"use client";

import { ReactNode, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { useStore } from "@/hooks/useStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Butter-smooth scrolling via Lenis, synced to GSAP ScrollTrigger.
 * Lenis interpolates (lerps) the scroll position and drives ScrollTrigger from
 * GSAP's ticker, so pins + scrubs (and the video scrub) glide instead of
 * stepping with raw wheel deltas. Disabled for prefers-reduced-motion.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
    // Flips true once the Monster 3D canvas has mounted its scene.
    const ready = useStore((state) => state.ready);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const lenis = new Lenis({
            // Kept smooth, but far more RESPONSIVE: a short glide + higher wheel
            // sensitivity so a single scroll moves a meaningful amount right away
            // (was 1.5s / multiplier 1, which made each scroll feel like nothing
            // happened until you scrolled several times).
            duration: 0.9,
            easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.6,
            touchMultiplier: 1.8,
            syncTouch: true,
        });

        // Expose the instance so UI (e.g. the back-to-top button) can drive a
        // smooth programmatic scroll through Lenis instead of fighting it.
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

        lenis.on("scroll", ScrollTrigger.update);

        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(raf);
            gsap.ticker.lagSmoothing(500, 33);
            delete (window as unknown as { __lenis?: Lenis }).__lenis;
            lenis.destroy();
        };
    }, []);

    // Re-measure every ScrollTrigger once the page geometry has actually
    // settled. The concert pin is built on first paint, but the Monster
    // slices build their pins later (only when the 3D canvas is `ready`) and
    // the web-font swap reflows the big headlines — both AFTER GSAP's one-time
    // on-load refresh. Without this, the concert pin and the Monster pins
    // disagree on the layout, and releasing the concert pin can skip the
    // mis-measured Monster sections straight to the footer. Refresh on mount,
    // when the 3D becomes ready, and after fonts finish loading.
    useEffect(() => {
        const id = requestAnimationFrame(() => ScrollTrigger.refresh());
        let cancelled = false;
        if (typeof document !== "undefined" && "fonts" in document) {
            document.fonts.ready.then(() => {
                if (!cancelled) ScrollTrigger.refresh();
            });
        }
        return () => {
            cancelAnimationFrame(id);
            cancelled = true;
        };
    }, [ready]);

    return <>{children}</>;
}
