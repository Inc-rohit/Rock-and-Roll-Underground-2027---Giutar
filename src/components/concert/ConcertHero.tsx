"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import StageBackground from "./StageBackground";
import StageOverlay from "./StageOverlay";
import MusiciansLayer from "./MusiciansLayer";
import CrossBandsLayer from "./CrossBandsLayer";
import CrowdLayer from "./CrowdLayer";
import LogoMark from "./LogoMark";
import ScrollSequence from "./ScrollSequence";
import SequencePanel from "./SequencePanel";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * ConcertHero — pins the stage and scrubs a foreground sequence through it.
 *
 * Layer order (back → front):
 *   0  StageBackground   (static image, never transformed)
 *   10 StageOverlay      (dark readability gradient)
 *   20 MusiciansLayer / CrossBandsLayer (independent decorative layers)
 *   30 ScrollSequence    (animated text/content panels)
 *
 * The background image is NEVER animated — only the foreground moves.
 */
export default function ConcertHero() {
    const hero = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const el = hero.current;
            if (!el) return;

            const panels = gsap.utils.toArray<HTMLElement>(".sequence-panel", el);
            const sil = gsap.utils.toArray<HTMLElement>(".musician", el);
            if (panels.length < 4) return; // 4 panels: logo, venue+address, date, logo header

            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            // Row spacing for the fan-out (px), based on viewport width.
            const sp = Math.min(window.innerWidth * 0.19, 250);
            const fx = [-2 * sp, -1 * sp, 0, sp, 2 * sp]; // final line-up, numeric L→R: #1 #2 #3 #4 #5

            // Reduced motion: no pin, no scrub — show a static final composition.
            if (reduce) {
                gsap.set(panels, { autoAlpha: 0 });
                gsap.set(panels[3], { autoAlpha: 1, yPercent: -34, scale: 0.62 }); // logo header
                gsap.set(".crowd-layer", { autoAlpha: 1, yPercent: 0 });
                sil.forEach((s, i) => gsap.set(s, { xPercent: -50, x: fx[i], y: 0, autoAlpha: 1 }));
                return;
            }

            gsap.set(panels, { autoAlpha: 0, yPercent: 12 });
            gsap.set(panels[0], { autoAlpha: 1, yPercent: 0 }); // logo visible at the top
            // Start each silhouette already at its final line-up position, just
            // below the floor + hidden — so they rise straight up in place.
            gsap.set(sil, { xPercent: -50, x: (i: number) => fx[i], y: 80, autoAlpha: 0 });
            gsap.set(".crowd-layer", { autoAlpha: 0, yPercent: 18 });

            // Intro (first load, once): a proper rock-show power-up —
            //   1) the headline buzzes on like a neon club sign (flicker),
            //   2) a strobe flash bursts as it locks fully lit, and
            //   3) the whole title PUNCHES in with a bass-drop amp-stack shake.
            const heroFlash = el.querySelector(".hero-intro .hero-flash");
            const heroLines = gsap.utils.toArray<HTMLElement>(".hero-intro .hero-line", el);
            const heroIntro = el.querySelector(".hero-intro");
            if (heroFlash && heroLines.length && heroIntro) {
                gsap.set(heroFlash, { scale: 0.35, autoAlpha: 0 });
                gsap.set(heroLines, { autoAlpha: 0 });
                gsap.set(".hero-headline", { scale: 1.14 });

                const intro = gsap.timeline({ delay: 0.2 });

                // 1) Neon flicker-on — each line stutters to life, top line first.
                heroLines.forEach((line, i) => {
                    intro.fromTo(
                        line,
                        { autoAlpha: 0 },
                        {
                            keyframes: [
                                { autoAlpha: 0, duration: 0.05 },
                                { autoAlpha: 1, duration: 0.04 },
                                { autoAlpha: 0.08, duration: 0.05 },
                                { autoAlpha: 0.95, duration: 0.04 },
                                { autoAlpha: 0.2, duration: 0.05 },
                                { autoAlpha: 1, duration: 0.05 },
                                { autoAlpha: 0.45, duration: 0.04 },
                                { autoAlpha: 1, duration: 0.09 },
                            ],
                            ease: "none",
                        },
                        i * 0.22,
                    );
                });

                // 2) Strobe flash bursts as the sign locks fully on.
                intro
                    .fromTo(
                        heroFlash,
                        { scale: 0.5, autoAlpha: 0 },
                        { scale: 1.5, autoAlpha: 1, duration: 0.12, ease: "power2.out" },
                        ">-0.04",
                    )
                    .to(heroFlash, { scale: 2.5, autoAlpha: 0, duration: 0.75, ease: "power2.in" });

                // 3) Bass-drop: the title snaps to size with an elastic punch while
                //    the whole block shakes like the first chord through the amps.
                intro
                    .to(".hero-headline", { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" }, "<")
                    .to(
                        heroIntro,
                        {
                            keyframes: [
                                { x: -9, y: 4 },
                                { x: 8, y: -5 },
                                { x: -6, y: 3 },
                                { x: 5, y: -2 },
                                { x: -2, y: 1 },
                                { x: 0, y: 0 },
                            ],
                            duration: 0.4,
                            ease: "none",
                        },
                        "<",
                    );
            }

            // Ongoing: a subtle "breathing" pulse on the headline. Delayed so it
            // begins only after the intro's bass-drop punch has settled.
            gsap.to(".hero-headline", {
                scale: 1.015,
                duration: 1.8,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: 2.2,
            });

            const tl = gsap.timeline({
                defaults: { ease: "power2.out" },
                scrollTrigger: {
                    trigger: el,
                    start: "top top",
                    end: "+=600%",
                    pin: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                },
            });

            // A full-screen "big text" beat: enter from below → hold → up & fade.
            const beat = (panel: HTMLElement) => {
                tl.fromTo(panel, { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 1 });
                tl.to(panel, { duration: 0.5 });
                tl.to(panel, { autoAlpha: 0, yPercent: -12, duration: 1, ease: "power2.in" });
            };

            // 1) Logo — already on screen → hold → up & fade
            tl.to(panels[0], { duration: 0.5 });
            tl.to(panels[0], { autoAlpha: 0, yPercent: -12, duration: 1, ease: "power2.in" });

            // 2) Date & time on one screen
            beat(panels[1]);

            // 3) Venue + address — the crowd rises in WITH it, then the text lifts
            //    away while the crowd stays for the band finale.
            tl.fromTo(panels[2], { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 1 });
            tl.to(".crowd-layer", { autoAlpha: 1, yPercent: 0, duration: 1.2, ease: "power2.out" }, "<");
            tl.to(panels[2], { duration: 0.6 });
            tl.to(panels[2], { autoAlpha: 0, yPercent: -12, duration: 1, ease: "power2.in" });

            // 4) Logo re-appears at centre, then rises to a header as the band comes in.
            tl.fromTo(panels[3], { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 1 });
            tl.to(panels[3], { duration: 0.4 });
            tl.to(panels[3], { yPercent: -34, scale: 0.62, duration: 1.6, ease: "power2.inOut" });

            // 6) Silhouettes ALL rise straight up TOGETHER, each already at its
            //    final line-up position (no centre cluster, no one-by-one) — after
            //    the logo has finished moving up.
            tl.to(sil, { autoAlpha: 1, y: 0, duration: 1.0, ease: "power2.out", stagger: 0.05 });
            tl.to({}, { duration: 0.6 }); // hold the finished line-up

            // --- Scroll-scrubbed stage video + subtle push ---
            // Driven from the SAME pinned timeline (one ScrollTrigger) so it stays
            // in sync with the pin spacer. Spanning tweens are added at position 0
            // for the timeline's full duration. The video's playback follows scroll:
            // scrolling forward sweeps the lights/smoke; scrolling back rewinds it.
            const total = tl.duration() || 1;
            const video = el.querySelector<HTMLVideoElement>(".stage-video");
            if (video) {
                video.pause();
                // Animate a proxy value and seek in onUpdate — setting currentTime
                // directly via gsap.to(video, …) is swallowed by the CSS plugin.
                const state = { t: 0 };
                tl.to(
                    state,
                    {
                        t: 9.9, // ~full 10s clip across the pinned scroll
                        duration: total,
                        ease: "none",
                        onUpdate: () => {
                            // Only seek once the previous seek finished so rapid
                            // scroll doesn't pile up seeks and stutter.
                            if (video.readyState >= 2 && !video.seeking) video.currentTime = state.t;
                        },
                    },
                    0,
                );
            }

            // Subtle scroll-linked push for depth (no rotation, no edge reveal).
            tl.fromTo(".stage-scroll", { scale: 1.04 }, { scale: 1.09, duration: total, ease: "none" }, 0);

            // Crowd: purely VERTICAL bounce (no horizontal drift). The front row
            // jumps; the back row stays low and always covers the bottom, so no
            // background peeks through when the front lifts.
            gsap.to(".crowd-front", { yPercent: -8, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true });
            gsap.set(".crowd-back", { xPercent: 4 }); // slight offset so the back reads as a distinct row
            gsap.to(".crowd-back", { yPercent: -4, duration: 4.2, ease: "sine.inOut", repeat: -1, yoyo: true });

            // Logo shine — a gleam that sweeps across the RRU marks every few seconds.
            gsap.fromTo(
                ".logo-shine-streak",
                { xPercent: -260 },
                { xPercent: 360, duration: 1.7, ease: "power1.inOut", repeat: -1, repeatDelay: 2.8 },
            );

            // Musicians idle — subtle "performing" sway around the feet + tiny bob,
            // staggered per figure so they don't look like static cut-outs.
            gsap.utils.toArray<HTMLElement>(".musician-inner", el).forEach((m, i) => {
                gsap.to(m, {
                    rotation: i % 2 === 0 ? 1.8 : -1.8,
                    yPercent: -1.6,
                    duration: 2.2 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Golden outline glow — NEON FLICKER: steady-bright stretches broken by
            // quick dips, desynced per musician so it reads like a rock-show sign.
            gsap.utils.toArray<HTMLElement>(".musician-glow", el).forEach((g, i) => {
                const flicker = gsap.to(g, {
                    keyframes: [
                        { autoAlpha: 1, duration: 0.03 },
                        { autoAlpha: 1, duration: 0.75 }, // hold bright
                        { autoAlpha: 0.25, duration: 0.035 },
                        { autoAlpha: 1, duration: 0.035 },
                        { autoAlpha: 0.55, duration: 0.03 },
                        { autoAlpha: 1, duration: 0.03 },
                        { autoAlpha: 1, duration: 1.15 }, // hold bright (long)
                        { autoAlpha: 0.2, duration: 0.04 },
                        { autoAlpha: 0.9, duration: 0.035 },
                        { autoAlpha: 0.4, duration: 0.035 },
                        { autoAlpha: 1, duration: 0.04 },
                        { autoAlpha: 1, duration: 0.7 }, // hold bright
                    ],
                    ease: "none",
                    repeat: -1,
                    delay: i * 0.45,
                });
                flicker.timeScale(0.85 + i * 0.12);
            });
        },
        { scope: hero },
    );

    const bigBase =
        "[font-family:var(--font-bebas)] uppercase leading-[0.92] tracking-[0.02em] text-balance text-[clamp(3rem,10vw,8rem)]";
    // Treatment C — chrome / metal gradient + dark stroke
    const bigText =
        bigBase +
        " bg-gradient-to-b from-white via-[#e2e8f0] to-[#8b95a3] bg-clip-text text-transparent" +
        " [-webkit-text-stroke:1px_rgba(0,0,0,0.28)] [filter:drop-shadow(0_3px_2px_rgba(0,0,0,0.6))]";
    const timeText =
        "[font-family:var(--font-bebas)] mt-2 uppercase tracking-[0.06em] text-[clamp(1.8rem,5.5vw,4rem)]" +
        " text-white/90 [text-shadow:0_2px_18px_rgba(0,0,0,0.85)]";
    // Chrome heading for the address, sized to match the "8:30 PM" time text.
    const midText =
        "[font-family:var(--font-bebas)] uppercase leading-[1] tracking-[0.04em] text-balance text-[clamp(1.8rem,5.5vw,4rem)]" +
        " bg-gradient-to-b from-white via-[#e2e8f0] to-[#9aa3b0] bg-clip-text text-transparent [filter:drop-shadow(0_2px_2px_rgba(0,0,0,0.55))]";

    return (
        <section
            ref={hero}
            // z-40 keeps the opaque stage above the shared 3D canvas (z-30) so
            // the Monster cans — whose sticky scene starts rendering one screen
            // early — stay hidden behind the concert until it scrolls away.
            // z-40 keeps the opaque stage above the shared 3D canvas (z-30) so
            // the Monster cans stay hidden behind the concert until it scrolls
            // away. (The composited-video clip is handled on .stage-scene, not
            // here — contain/clip on the pinned section breaks its ScrollTrigger.)
            className="concert-hero relative z-40 w-full min-h-screen overflow-hidden bg-black"
        >
            {/* 1 — static stage */}
            <StageBackground />
            {/* 2 — readability overlay */}
            <StageOverlay />
            {/* 3 — independent decorative layers */}
            <MusiciansLayer />
            <CrossBandsLayer />
            {/* 3b — foreground audience */}
            <CrowdLayer />
            {/* 3c — gentle fade of the stage's bottom into black (keeps the crowd
                readable; the seam itself is covered by the black band in page.tsx). */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] h-[22vh]"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.9) 100%)",
                }}
            />
            {/* 4 — animated content panels */}
            <ScrollSequence>
                <SequencePanel>
                    <div className="hero-intro relative isolate flex items-center justify-center px-6 text-center">
                        {/* bass pulse — a red "subwoofer" glow that throbs on the
                            beat behind the headline, in rhythm with the ripple */}
                        <div
                            aria-hidden="true"
                            className="hero-bass pointer-events-none absolute left-1/2 top-1/2 h-[100vh] w-[100vh] rounded-full"
                            style={{
                                background:
                                    "radial-gradient(closest-side, rgba(255,64,24,0.34), rgba(255,96,32,0.12) 46%, rgba(0,0,0,0) 72%)",
                            }}
                        />
                        {/* white/gold light burst the headline slams out of */}
                        <div
                            aria-hidden="true"
                            className="hero-flash pointer-events-none absolute left-1/2 top-1/2 h-[75vh] w-[75vh] -translate-x-1/2 -translate-y-1/2"
                            style={{
                                background:
                                    "radial-gradient(closest-side, rgba(255,255,255,0.85), rgba(255,243,207,0.28) 45%, rgba(255,255,255,0) 72%)",
                            }}
                        />
                        {/* light ripple pulsing out from behind the headline */}
                        <div
                            aria-hidden="true"
                            className="hero-ripple pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                            <span className="hero-ring" />
                            <span className="hero-ring" />
                            <span className="hero-ring" />
                        </div>
                        <h1 className="hero-headline relative [font-family:var(--font-bebas)] uppercase leading-[0.88] tracking-[0.02em] text-balance">
                            <span className="hero-line block text-[clamp(2.4rem,7.5vw,6.5rem)] bg-gradient-to-b from-white via-[#e2e8f0] to-[#8b95a3] bg-clip-text text-transparent [-webkit-text-stroke:1px_rgba(0,0,0,0.28)] [filter:drop-shadow(0_3px_2px_rgba(0,0,0,0.6))]">
                                The Most Exciting Event
                            </span>
                            <span className="hero-line mt-1 block text-[clamp(3.75rem,13.5vw,11rem)] bg-gradient-to-b from-[#fff3cf] via-[#f4c020] to-[#d98200] bg-clip-text text-transparent [filter:drop-shadow(0_0_28px_rgba(244,192,32,0.55))_drop-shadow(0_3px_2px_rgba(0,0,0,0.6))]">
                                at NRF 2027
                            </span>
                        </h1>
                    </div>
                </SequencePanel>

                <SequencePanel>
                    <h2 className={bigText}>January 11, 2027</h2>
                    <p className={timeText}>8:30 PM</p>
                </SequencePanel>

                <SequencePanel>
                    <h1 className={bigText}>The Cutting Room</h1>
                    <h2 className={`${midText} mt-4`}>44 E 32nd St, New York</h2>
                </SequencePanel>

                <SequencePanel>
                    <LogoMark />
                </SequencePanel>
            </ScrollSequence>

        </section>
    );
}
