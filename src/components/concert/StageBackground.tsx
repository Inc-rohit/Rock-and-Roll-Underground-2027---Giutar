/**
 * Layer 1 — the stage as a CONTINUOUSLY PLAYING (autoplay + loop) video, so the
 * lights sweep and smoke billows on their own — the background never freezes,
 * even when the intro auto-scroll pauses on a page. (It used to be scrubbed by
 * scroll, which froze on one frame whenever scrolling stopped = "stuck" look.)
 * `main-stage.png` is the poster (shown before the video is ready / on
 * reduced-motion, where ConcertHero pauses the video).
 *
 *   .stage-scroll — subtle scroll-linked push (scale)
 *   .stage-video  — the looping stage video
 *   .film-grain   — static filmic grain
 */
export default function StageBackground() {
    return (
        <div className="stage-scene absolute inset-0 z-0 overflow-hidden [clip-path:inset(0)] bg-black" aria-hidden="true">
            <div className="stage-scroll absolute inset-0 origin-center will-change-transform">
                <video
                    className="stage-video absolute inset-0 h-full w-full scale-[1.08] object-cover object-center"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster="/stage/main-stage.png"
                    aria-hidden="true"
                    tabIndex={-1}
                >
                    <source src="/stage/stage-smoke.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Static film grain for a filmic finish */}
            <div
                className="film-grain pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: "url(/stage/grain.png)",
                    backgroundSize: "160px 160px",
                    opacity: 0.04,
                    mixBlendMode: "overlay",
                }}
            />
        </div>
    );
}
