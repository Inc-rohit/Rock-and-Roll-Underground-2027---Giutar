/**
 * Layer 1 — the stage as a SCROLL-SCRUBBED video.
 * The video never autoplays; ConcertHero ties its `currentTime` to scroll
 * progress, so the lights sweep and smoke billows as the user scrolls.
 * `Main stage.png` is the poster (shown before the video is ready / on
 * reduced-motion). Only transform is applied to the wrapper; the video's own
 * frames provide the motion, so the old CSS haze/glow layers are gone.
 *
 *   .stage-scroll — scroll-linked push (scale)
 *   .stage-video  — the scrubbed video element
 *   .film-grain   — static filmic grain
 */
export default function StageBackground() {
    return (
        <div className="stage-scene absolute inset-0 z-0 overflow-hidden [clip-path:inset(0)] bg-black" aria-hidden="true">
            <div className="stage-scroll absolute inset-0 origin-center will-change-transform">
                <video
                    className="stage-video absolute inset-0 h-full w-full scale-[1.08] object-cover object-center"
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
