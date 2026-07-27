"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { TextSplitter } from "@/components/TextSplitter";
import AudienceCanStage, { audCan } from "./AudienceCanStage";
import AudienceBubbles from "./AudienceBubbles";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Interstitial between the RRU concert and the Monster act.
 *
 * The `concert-audience` video (under a red overlay) is pinned as a fixed
 * background while content beats punch through on scroll. z-40 keeps the opaque
 * video above the shared 3D canvas (z-30) so NO Monster cans show here — they
 * appear once this section scrolls into the "Sponsor Benefits" hero below.
 *
 * Beat 0 is the event's NAME — centered, with a grand cinematic reveal/exit.
 * Beats 1–3 are left-aligned "stage-screen" slides with punchy staggered entrances.
 */
const GOLD_GRADIENT =
    "bg-gradient-to-b from-[#fff3cf] via-[#f4c020] to-[#d98200] bg-clip-text text-transparent";

const PANELS = [
    {
        eyebrow: "16th Annual",
        title: "Rock & Roll Underground",
        body:
            "Incisiv’s Rock & Roll Underground is the most dynamic & unique experience of NRF Week! Bands comprised of retail industry execs prove year in and out that retail rocks!",
    },
    {
        eyebrow: "Pre-Event",
        title: "Create excitement and buzz with attendees",
        bullets: [
            "Incisiv will create 3 bands from its top-tier industry musician network to perform on Monday, January 11, 2027.",
            "Create excitement in the industry by promoting the fact that peers from the retail industry will be performing in a live event experience that truly stands out.",
            "Know real-time who is registered (average 500+).",
        ],
    },
    {
        eyebrow: "During the Event",
        title: "Interact with enthusiastic attendees and differentiate your brand",
        bullets: [
            "Create memorable experiences and lasting relationships.",
            "Access key prospects and leverage the event to provide a unique entertainment experience.",
            "Help attendees cap off an exciting day of content with a unique event that builds a sense of community and purpose.",
            "Give your executives an interaction point with customers and partners on site.",
        ],
    },
    {
        eyebrow: "Post-Event",
        title: "Leverage the impact for follow up discussions and continued buzz",
        bullets: [
            "Know in real time all who pre-registered and attended — easy follow up with opportunities to continue the discussion.",
            "Use event giveaways as another touch point to engage.",
            "Event footage and social posts provide a wealth of material to extend the life of your NRF marketing.",
            "Extensive press coverage providing tens of thousands of dollars in PR.",
        ],
    },
];

// 8 photo placeholders arranged in a RING (ellipse) around the "16th Annual"
// title — top, the four diagonals, both sides and bottom, evenly spaced. They
// sit behind the text (z-0 under z-10) so the title stays fully legible. Swap
// the inner icon box for a real <img>/<video> later.
const SHOTS = [
    { pos: "left-[40vw] top-[2vh]", rot: -3, size: "h-48 w-72" }, // top
    { pos: "left-[65vw] top-[12vh]", rot: 6, size: "h-48 w-72" }, // top-right
    { pos: "left-[76vw] top-[36vh]", rot: 5, size: "h-48 w-72" }, // right
    { pos: "left-[65vw] top-[60vh]", rot: 7, size: "h-48 w-72" }, // bottom-right
    { pos: "left-[40vw] top-[75vh]", rot: 3, size: "h-48 w-72" }, // bottom
    { pos: "left-[15vw] top-[60vh]", rot: -7, size: "h-48 w-72" }, // bottom-left
    { pos: "left-[4vw] top-[36vh]", rot: -5, size: "h-48 w-72" }, // left
    { pos: "left-[15vw] top-[12vh]", rot: -6, size: "h-48 w-72" }, // top-left
];

export default function AudienceSection() {
    const root = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const el = root.current;
            if (!el) return;
            const panels = gsap.utils.toArray<HTMLElement>(".audience-panel", el);
            if (!panels.length) return;

            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduce) {
                el.classList.add("reduce-stack");
                gsap.set(panels, { autoAlpha: 1 });
                // decorative — hide for reduced motion (panels stack and stay readable).
                gsap.set([".aud-bubbles", ".aud-blackout"], { autoAlpha: 0 });
                audCan.a.scale = 0;
                audCan.b.scale = 0;
                return;
            }

            gsap.set(panels, { autoAlpha: 0 });
            // Cans (3D) start off-screen below / hidden (scale 0). audCan.a rises
            // in for Pre-Event; audCan.b flies in for the finale. groupRotY is the
            // Hero-style group revolution, reset to 0.
            gsap.set(audCan, { groupRotY: 0 });
            gsap.set(audCan.a, { x: 0, y: -4.8, z: 0, rotZ: 0, scale: 0 });
            gsap.set(audCan.b, { x: -1.6, y: 0, z: 0, rotZ: 0, scale: 0 });
            // Black backdrop + carbonation bubbles are revealed only for the finale.
            gsap.set([".aud-blackout", ".aud-bubbles"], { autoAlpha: 0 });

            const tl = gsap.timeline({
                defaults: { ease: "power2.out" },
                scrollTrigger: {
                    trigger: el,
                    start: "top top",
                    end: "+=520%",
                    pin: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                },
            });

            panels.forEach((panel, i) => {
                const eyebrow = panel.querySelector(".aud-eyebrow");
                const sub = panel.querySelector(".aud-sub");
                const items = gsap.utils.toArray<HTMLElement>(".aud-item", panel);

                tl.set(panel, { autoAlpha: 1 });

                if (i === 0) {
                    const glow = panel.querySelector(".aud-glow");
                    const shots = gsap.utils.toArray<HTMLElement>(".aud-shot", panel);
                    // Each ring photo's offset toward screen centre, so they can
                    // BURST out of the headline into the ring (and implode back on
                    // exit).
                    const vw2 = window.innerWidth / 2;
                    const vh2 = window.innerHeight / 2;
                    const shotCenters = shots.map((el) => {
                        const r = el.getBoundingClientRect();
                        return {
                            dx: (vw2 - (r.left + r.width / 2)) * 0.92,
                            dy: (vh2 - (r.top + r.height / 2)) * 0.92,
                        };
                    });
                    // Main event name — big cinematic bloom-in (long, so it reads clearly).
                    tl.fromTo(
                        glow,
                        { autoAlpha: 0, scale: 0.4 },
                        { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" },
                    );
                    tl.fromTo(
                        eyebrow,
                        { autoAlpha: 0, yPercent: -60 },
                        { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power3.out" },
                        "<0.05",
                    );
                    // Title reveals letter-by-letter, in sequence — each character
                    // SLAMS into place from oversized (impact / "bullet hitting the
                    // wall"), one after another from the start of the word.
                    const chars = gsap.utils.toArray<HTMLElement>(
                        ".aud-sub .split-char",
                        panel,
                    );
                    tl.fromTo(
                        chars,
                        { scale: 2.6, autoAlpha: 0, transformOrigin: "center center" },
                        {
                            scale: 1,
                            autoAlpha: 1,
                            duration: 0.32,
                            ease: "back.out(1.8)",
                            stagger: 0.05,
                        },
                        "<",
                    );
                    tl.fromTo(
                        items,
                        { autoAlpha: 0, yPercent: 40 },
                        { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power2.out" },
                        ">-0.2",
                    );
                    // Photos BURST out of the headline into the ring — each flies
                    // from screen centre to its spot with a spin, one after another
                    // around the circle.
                    tl.fromTo(
                        shots,
                        {
                            autoAlpha: 0,
                            scale: 0.12,
                            x: (i: number) => shotCenters[i].dx,
                            y: (i: number) => shotCenters[i].dy,
                            rotation: (i: number) => SHOTS[i].rot + (i % 2 ? 55 : -55),
                        },
                        {
                            autoAlpha: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                            rotation: (i: number) => SHOTS[i].rot,
                            duration: 0.75,
                            ease: "back.out(1.5)",
                            stagger: { each: 0.07, from: "start" },
                        },
                        "<0.05",
                    );
                    tl.to(panel, { duration: 0.9 }); // hold
                    // clear zoom-through exit
                    tl.addLabel("introExit");
                    tl.to(sub, { scale: 1.4, autoAlpha: 0, duration: 0.9, ease: "power2.in" }, "introExit");
                    tl.to(eyebrow, { autoAlpha: 0, yPercent: -45, duration: 0.6 }, "introExit");
                    tl.to(items, { autoAlpha: 0, yPercent: -25, duration: 0.6 }, "introExit");
                    tl.to(
                        shots,
                        {
                            autoAlpha: 0,
                            scale: 0.12,
                            x: (i: number) => shotCenters[i].dx,
                            y: (i: number) => shotCenters[i].dy,
                            rotation: (i: number) => SHOTS[i].rot + (i % 2 ? -45 : 45),
                            duration: 0.7,
                            ease: "power2.in",
                            stagger: { each: 0.05, from: "end" },
                        },
                        "introExit",
                    );
                    tl.to(glow, { autoAlpha: 0, scale: 1.7, duration: 0.9 }, "introExit");
                    tl.set(panel, { autoAlpha: 0 });
                    return;
                }

                // FINALE — "Sponsor Benefits": mirrors the Monster Hero look
                // (black backdrop + carbonation bubbles + big centred title
                // flanked by cans). The SAME Post-Event can stays live: it
                // travels down to centre-screen, "converts into two" (a twin
                // emerges), and the pair splits apart to bracket the title —
                // one continuous motion in one canvas, no hand-off.
                if (panel.classList.contains("sponsor-panel")) {
                    const glow = panel.querySelector(".aud-glow");

                    // Video/red overlay dissolve to black + bubbles rise.
                    tl.to(".aud-blackout", { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" });
                    tl.to(".aud-bubbles", { autoAlpha: 1, duration: 0.8 }, "<");

                    // 1) The Post-Event can settles at the right flank, tilting out.
                    tl.to(
                        audCan.a,
                        { x: 1.6, y: 0, z: 0, rotZ: 0.4, duration: 0.8, ease: "power2.out" },
                        "<",
                    );
                    // 2) CONVERT INTO TWO — the twin flies in on the left (from below
                    //    and out of depth), mirroring the Hero's can fly-in.
                    tl.fromTo(
                        audCan.b,
                        { x: -1.6, y: -5, z: 3, rotZ: -0.6, scale: 0 },
                        {
                            x: -1.6,
                            y: 0,
                            z: 0,
                            rotZ: -0.4,
                            scale: 1,
                            duration: 1.0,
                            ease: "back.out(1.4)",
                        },
                        "<0.15",
                    );
                    // 3) THE HERO MOTION — the whole can group REVOLVES a full 360°
                    //    as you scroll (group.rotation.y → 2π), so the pair orbits
                    //    through depth and returns to flank the title. This is the
                    //    exact mechanic from the Monster Hero's Scene.tsx.
                    tl.to(
                        audCan,
                        { groupRotY: Math.PI * 2, duration: 3.4, ease: "power1.inOut" },
                        "<0.2",
                    );

                    // 4) The big centred title settles in as the revolution finishes.
                    tl.fromTo(
                        glow,
                        { autoAlpha: 0, scale: 0.5 },
                        { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out" },
                        ">-0.9",
                    );
                    tl.fromTo(
                        eyebrow,
                        { autoAlpha: 0, yPercent: -45 },
                        { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: "power3.out" },
                        "<",
                    );
                    tl.fromTo(
                        sub,
                        { autoAlpha: 0, scale: 0.75 },
                        { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" },
                        "<0.05",
                    );
                    tl.to(panel, { duration: 1.2 }); // hold — finale
                    return;
                }

                // Beat 1 (Pre-Event): staged, scroll-driven 3D entrance — the can
                // rises up from below to the MIDDLE (scaling in from a touch of
                // depth), THEN travels across to the right, and only THEN the text
                // appears. All in real 3D so it arcs with perspective.
                if (i === 1) {
                    tl.fromTo(
                        audCan.a,
                        { x: 0, y: -4.8, z: -1, scale: 0.6 },
                        { x: 0, y: 0, z: 0, scale: 1, duration: 0.7, ease: "back.out(1.3)" },
                    );
                    tl.to(audCan.a, { x: 1.6, rotZ: 0.12, duration: 0.8, ease: "power2.inOut" });
                }
                // Left-aligned slides — punchy staggered entrance.
                tl.fromTo(
                    eyebrow,
                    { scale: 1.55, rotate: -4, autoAlpha: 0, transformOrigin: "left center" },
                    { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.9)" },
                );
                tl.fromTo(
                    sub,
                    { yPercent: 80, autoAlpha: 0 },
                    { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
                    "<0.12",
                );
                tl.fromTo(
                    items,
                    { x: -60, autoAlpha: 0 },
                    { x: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.4)", stagger: 0.1 },
                    "<0.1",
                );
                tl.to(panel, { duration: 0.9 }); // hold
                if (i < panels.length - 1) {
                    tl.to(panel, { autoAlpha: 0, yPercent: -7, duration: 0.4, ease: "power2.in" });
                }
            });
        },
        { scope: root },
    );

    // Left-aligned slide styles (beats 1–3)
    const eyebrowCls =
        `aud-eyebrow [font-family:var(--font-bebas)] uppercase leading-[0.9] tracking-[0.02em] text-[clamp(2.75rem,8vw,6rem)] ${GOLD_GRADIENT} [filter:drop-shadow(0_3px_12px_rgba(0,0,0,0.7))]`;
    const subCls =
        "aud-sub mt-3 font-bold text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.95)] text-[clamp(1.5rem,3.4vw,2.6rem)] leading-[1.1]";

    return (
        <section
            ref={root}
            className="audience-section relative z-40 h-screen w-full overflow-hidden bg-black"
            style={{
                // Soft-fade the bottom edge so, as this section scrolls off over
                // the (overlapping) SkyDive, the falling-can scene is revealed
                // gradually instead of behind a hard black cut-line.
                WebkitMaskImage:
                    "linear-gradient(to bottom, #000 82%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
            }}
        >
            {/* video background */}
            <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
                tabIndex={-1}
            >
                <source src="/stage/concert-audience.mp4" type="video/mp4" />
            </video>

            {/* red overlay + darkening for text legibility */}
            <div className="absolute inset-0 bg-[#8a1c12] mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/50" />
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 80%)",
                }}
            />

            {/* FINALE backdrop — dissolves the video/red overlay to solid black
                (revealed only for the Sponsor Benefits beat). */}
            <div className="aud-blackout pointer-events-none absolute inset-0 z-[5] bg-black" />
            {/* FINALE carbonation bubbles — drift up behind the title + cans. */}
            <div className="aud-bubbles pointer-events-none absolute inset-0 z-[6]">
                <AudienceBubbles />
            </div>

            {/* Live 3D can stage (full-screen, transparent). One scene holds both
                cans so the whole motion — Pre-Event rise, the travel to centre,
                the "convert into two", and the split to flank the title — happens
                in real 3D space, not as flat sliding layers. */}
            <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
                <AudienceCanStage />
            </div>

            <div className="relative z-10 h-full">
                {PANELS.map((p, i) => {
                    const isIntro = i === 0;
                    return (
                        <div
                            key={i}
                            className={`audience-panel absolute inset-0 flex flex-col justify-center ${
                                isIntro
                                    ? "items-center px-6 text-center"
                                    : "items-start px-[7vw] text-left md:px-[10vw]"
                            }`}
                        >
                            {isIntro && (
                                <div
                                    className="pointer-events-none absolute inset-0 z-0 hidden md:block"
                                    aria-hidden="true"
                                >
                                    {SHOTS.map((s, i) => (
                                        <div
                                            key={i}
                                            className={`aud-shot absolute ${s.pos}`}
                                            style={{ transform: `rotate(${s.rot}deg)` }}
                                        >
                                            <div className="overflow-hidden rounded-md border border-white/20 bg-white/[0.06] p-1.5 shadow-[0_14px_44px_rgba(0,0,0,0.6)] backdrop-blur-[2px]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`/stage/${i + 1}.jpg`}
                                                    alt=""
                                                    loading="lazy"
                                                    className={`${s.size} rounded-sm object-cover`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div
                                className={
                                    isIntro ? "relative z-10 mx-auto w-full max-w-4xl" : "w-full max-w-3xl"
                                }
                            >
                                {isIntro ? (
                                    <div className="relative isolate">
                                        {/* gold glow blooming behind the title */}
                                        <div
                                            className="aud-glow pointer-events-none absolute left-1/2 top-1/2 h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                background:
                                                    "radial-gradient(closest-side, rgba(244,192,32,0.30), rgba(244,192,32,0) 70%)",
                                            }}
                                        />
                                        <div className="relative z-10">
                                            {/* eyebrow framed by gold rules — poster/title-card look */}
                                            <div className="aud-eyebrow flex items-center justify-center gap-4">
                                                <span className="h-px w-10 bg-[#f4c020]/70 md:w-24" />
                                                <span className="[font-family:var(--font-bebas)] uppercase tracking-[0.32em] text-[#f4c020] [text-shadow:0_2px_10px_rgba(0,0,0,0.8)] text-[clamp(1.1rem,3vw,2rem)]">
                                                    {p.eyebrow}
                                                </span>
                                                <span className="h-px w-10 bg-[#f4c020]/70 md:w-24" />
                                            </div>
                                            <p
                                                className="aud-sub mt-5 [font-family:var(--font-bebas)] uppercase leading-[0.85] tracking-[0.01em] text-balance text-[#f6c62a] [filter:drop-shadow(0_0_30px_rgba(244,192,32,0.45))_drop-shadow(0_4px_16px_rgba(0,0,0,0.75))] text-[clamp(3rem,10vw,7.5rem)]"
                                            >
                                                <TextSplitter text={p.title!} />
                                            </p>
                                            <p className="aud-item mx-auto mt-7 max-w-2xl text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.95)] text-[clamp(1.15rem,2.6vw,1.75rem)] leading-[1.5]">
                                                {p.body}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={eyebrowCls}>{p.eyebrow}</h2>
                                        <p className={subCls}>{p.title}</p>
                                        <ul className="mt-7 max-w-2xl list-disc space-y-4 pl-7 marker:text-[#f4c020]">
                                            {p.bullets?.map((b) => (
                                                <li
                                                    key={b}
                                                    className="aud-item pl-2 text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.95)] text-[clamp(1.1rem,2.3vw,1.55rem)] leading-[1.35]"
                                                >
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* FINALE — Sponsor Benefits: the RRU act's payoff. Centered title
                    framed by the two live cans (the Post-Event can, now flanking
                    right, + the second can that rose in on the left). */}
                <div className="audience-panel sponsor-panel absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div className="relative isolate mx-auto w-full max-w-3xl">
                        <div
                            className="aud-glow pointer-events-none absolute left-1/2 top-1/2 h-[54vh] w-[54vh] -translate-x-1/2 -translate-y-1/2"
                            style={{
                                background:
                                    "radial-gradient(closest-side, rgba(244,192,32,0.32), rgba(244,192,32,0) 70%)",
                            }}
                        />
                        <div className="relative z-10">
                            <div className="aud-eyebrow flex items-center justify-center gap-4">
                                <span className="h-px w-8 bg-[#f4c020]/70 md:w-20" />
                                <span className="[font-family:var(--font-bebas)] uppercase tracking-[0.3em] text-[#f4c020] [text-shadow:0_2px_10px_rgba(0,0,0,0.8)] text-[clamp(0.9rem,2.4vw,1.5rem)]">
                                    Fueled by Monster
                                </span>
                                <span className="h-px w-8 bg-[#f4c020]/70 md:w-20" />
                            </div>
                            <p className="aud-sub mt-4 [font-family:var(--font-bebas)] uppercase leading-[0.8] tracking-[0.01em] text-balance text-[#f6c62a] [filter:drop-shadow(0_0_34px_rgba(244,192,32,0.5))_drop-shadow(0_4px_16px_rgba(0,0,0,0.8))] text-[clamp(2.75rem,9vw,7rem)]">
                                Sponsor
                                <br />
                                Benefits
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
