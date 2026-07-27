import Image from "next/image";

const LOGO = "/stage/logo-2027.png";

/**
 * The RRU logo with a warm golden aura (drop-shadow glow) and a metallic
 * "shine" gleam that sweeps across it. The shine is a bright diagonal streak
 * masked to the logo's exact shape (`.logo-shine-streak`, animated by ConcertHero).
 */
export default function LogoMark({ priority = false, intro = false }: { priority?: boolean; intro?: boolean }) {
    return (
        <div
            className={`logo-mark relative mx-auto w-[min(74vw,600px)] ${intro ? "logo-intro" : ""}`}
            style={{
                filter: "drop-shadow(0 0 36px rgba(247,198,0,0.5)) drop-shadow(0 8px 22px rgba(0,0,0,0.55))",
            }}
        >
            {/* burst of white light the logo emerges from on first load */}
            {intro && (
                <div
                    className="logo-flash pointer-events-none absolute inset-[-35%]"
                    style={{
                        background:
                            "radial-gradient(closest-side, rgba(255,251,240,0.95) 0%, rgba(255,214,140,0.4) 42%, rgba(255,214,140,0) 72%)",
                        mixBlendMode: "screen",
                    }}
                />
            )}

            {/* inner wrapper carries the entrance transform (scale/fade in) */}
            <div className="logo-mark-inner relative">
                <Image
                    src={LOGO}
                    alt="Rock & Roll Underground 2027"
                    width={751}
                    height={412}
                    priority={priority}
                    className="h-auto w-full"
                />

                {/* shine gleam, clipped to the logo's shape */}
                <div
                    className="logo-shine pointer-events-none absolute inset-0 overflow-hidden"
                    style={{
                        WebkitMaskImage: `url(${LOGO})`,
                        maskImage: `url(${LOGO})`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                        mixBlendMode: "screen",
                    }}
                >
                    <div
                        className="logo-shine-streak absolute -inset-y-10 w-2/5 will-change-transform"
                        style={{
                            background:
                                "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
