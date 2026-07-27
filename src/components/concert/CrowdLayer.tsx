import Image from "next/image";

/**
 * Foreground audience — the SAME crowd image used as two stacked rows:
 *   .crowd-back  — sits lower (extends below the fold) and stays put, so it
 *                  always covers the bottom edge. When the front row bounces up,
 *                  this one shows through behind it — no background gap.
 *   .crowd-front — the lively row that bounces vertically (jumping crowd).
 *
 * Each row tiles the image across the width (alternate copies mirrored so the
 * repeat is seamless). ConcertHero animates only vertical bounce — no drift.
 */
const TILES = [0, 1, 2, 3];

function CrowdTiles() {
    return (
        <>
            {TILES.map((i) => (
                <Image
                    key={i}
                    src="/stage/crowd.png"
                    alt=""
                    width={2015}
                    height={416}
                    draggable={false}
                    className={`h-full w-auto max-w-none select-none object-contain object-bottom ${
                        i % 2 === 1 ? "-scale-x-100" : ""
                    }`}
                />
            ))}
        </>
    );
}

export default function CrowdLayer() {
    return (
        <div
            aria-hidden="true"
            className="crowd-layer pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[22vh] overflow-hidden md:h-[24vh]"
        >
            {/* back — always-present filler, near-black #111111 for a whisper of depth */}
            <div className="crowd-back absolute bottom-[-4vh] left-0 flex h-[24vh] w-max items-end will-change-transform [filter:invert(0.067)]">
                <CrowdTiles />
            </div>
            {/* front — the bouncing crowd (pure black) */}
            <div className="crowd-front absolute bottom-0 left-0 flex h-[22vh] w-max items-end will-change-transform">
                <CrowdTiles />
            </div>
        </div>
    );
}
