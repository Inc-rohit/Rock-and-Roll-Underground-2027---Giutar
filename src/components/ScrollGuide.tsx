"use client";

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll affordances:
 *   1. side NAV DOTS on the right edge — each resolves to an absolute scroll
 *      position (recomputed live, so it tracks the pinned-section geometry).
 *      "About" and "Sponsor Benefits" are two points WITHIN the pinned audience
 *      section: its start (the 16th-Annual / about copy) and its 2-cans finale
 *      near the end. Clicking a dot smooth-scrolls there; the current one is gold.
 *   2. a "Scroll to explore" prompt that appears where the intro auto-scroll
 *      PARKS (the hero end / hand-off to the details) to cue the visitor to
 *      scroll on, then fades once they've scrolled into the details. (Reduced
 *      motion has no auto-scroll → the prompt stays as the top-of-page cue.)
 */
const getLenis = () => (window as unknown as { __lenis?: Lenis }).__lenis;
const getScroll = () => getLenis()?.scroll ?? window.scrollY;

const scrollTopOf = (sel: string): number | null => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return el.getBoundingClientRect().top + getScroll();
};
const audienceST = () =>
    ScrollTrigger.getAll().find((st) => st.trigger === document.querySelector(".audience-section"));
// The concert-hero pinned trigger — its `end` is exactly where the intro
// auto-scroll parks (band line-up / hand-off to the details).
const heroST = () =>
    ScrollTrigger.getAll().find((st) => st.trigger === document.querySelector(".concert-hero"));
// A position inside the audience section's pinned scroll range (0 = start,
// 1 = end). Falls back to the section top before the trigger is built.
const audiencePos = (frac: number): number | null => {
    const st = audienceST();
    if (st) return st.start + (st.end - st.start) * frac;
    return scrollTopOf(".audience-section");
};

const NAV: { label: string; pos: () => number | null }[] = [
    { label: "Concert", pos: () => scrollTopOf(".concert-hero") },
    { label: "About", pos: () => audiencePos(0) },
    { label: "Sponsor Benefits", pos: () => audiencePos(0.96) },
    { label: "Partner With Us", pos: () => scrollTopOf("#sec-partner") },
];

export default function ScrollGuide() {
    const hintRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef(0);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let raf = 0;
        let pending = false;
        const apply = () => {
            pending = false;
            const scroll = getScroll();
            // "Scroll to explore": with the intro auto-scroll running, show it where
            // the auto-scroll PARKS — the hero end (band line-up / hand-off to the
            // details) — not at the top. Hidden during the auto-scroll itself and
            // once the visitor scrolls on into the details. Reduced-motion has no
            // auto-scroll, so it keeps the original top-of-page cue.
            if (hintRef.current) {
                const ih = window.innerHeight;
                if (reduce) {
                    hintRef.current.style.opacity = scroll < ih * 0.45 ? "1" : "0";
                } else {
                    const st = heroST();
                    // `st.end` is 0 until ScrollTrigger positions the pin; ignore
                    // that stale value (it would spuriously match at scroll 0 and
                    // flash the prompt at the top) and wait for the real end.
                    const heroEnd = st && st.end > ih ? st.end : null;
                    const atHandoff =
                        heroEnd != null && scroll > heroEnd - ih * 0.35 && scroll < heroEnd + ih * 0.5;
                    hintRef.current.style.opacity = atHandoff ? "1" : "0";
                }
            }
            // active = the last dot whose target we've reached (within ~0.4 screen).
            const offset = window.innerHeight * 0.4;
            let idx = 0;
            for (let i = 0; i < NAV.length; i++) {
                const p = NAV[i].pos();
                if (p != null && p <= scroll + offset) idx = i;
            }
            if (idx !== activeRef.current) {
                activeRef.current = idx;
                setActive(idx);
            }
        };
        const onScroll = () => {
            if (!pending) {
                pending = true;
                raf = requestAnimationFrame(apply);
            }
        };
        apply();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        let lenis: Lenis | undefined;
        let retry: ReturnType<typeof setInterval> | undefined;
        const attach = () => {
            const l = getLenis();
            if (l && !lenis) {
                lenis = l;
                l.on("scroll", onScroll);
            }
            return !!lenis;
        };
        if (!attach()) retry = setInterval(() => attach() && retry && clearInterval(retry), 300);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (retry) clearInterval(retry);
            lenis?.off("scroll", onScroll);
        };
    }, []);

    const jump = (i: number) => {
        const p = NAV[i].pos();
        if (p == null) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(p, { duration: 1.0 });
        else window.scrollTo({ top: p, behavior: "smooth" });
    };

    return (
        <>
            {/* side nav dots */}
            <nav
                aria-label="Sections"
                className="fixed right-5 top-1/2 z-[140] hidden -translate-y-1/2 flex-col items-end gap-3.5 md:flex"
            >
                {NAV.map((s, i) => (
                    <button
                        key={s.label}
                        type="button"
                        onClick={() => jump(i)}
                        aria-label={`Go to ${s.label}`}
                        aria-current={active === i}
                        className="group flex items-center gap-2.5"
                    >
                        <span
                            className={`whitespace-nowrap rounded-full bg-black/55 px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-[#f4c020] backdrop-blur-sm transition-opacity duration-200 [font-family:var(--font-bebas)] ${
                                active === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                        >
                            {s.label}
                        </span>
                        <span
                            className={`block rounded-full transition-all duration-300 ${
                                active === i
                                    ? "h-3 w-3 bg-[#f4c020] shadow-[0_0_10px_rgba(244,192,32,0.85)]"
                                    : "h-2.5 w-2.5 border border-[#f4c020]/50 group-hover:border-[#f4c020] group-hover:bg-[#f4c020]/30"
                            }`}
                        />
                    </button>
                ))}
            </nav>

            {/* bottom "scroll to explore" prompt */}
            <div
                ref={hintRef}
                aria-hidden="true"
                className="scroll-hint pointer-events-none fixed inset-x-0 bottom-6 z-[130] flex flex-col items-center gap-2 opacity-0 transition-opacity duration-500"
            >
                <span className="[font-family:var(--font-bebas)] text-base uppercase tracking-[0.42em] text-[#f4c020] [text-shadow:0_2px_12px_rgba(0,0,0,0.95)]">
                    Scroll to explore
                </span>
                <span className="scroll-hint-arrow text-[#f4c020] [filter:drop-shadow(0_0_8px_rgba(244,192,32,0.5))]">
                    <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M6 4l6 6 6-6" opacity="0.5" />
                        <path d="M6 11l6 6 6-6" />
                    </svg>
                </span>
            </div>
        </>
    );
}
