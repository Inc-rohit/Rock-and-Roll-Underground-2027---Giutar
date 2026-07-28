"use client";

/**
 * Floating MUSIC NOTES for the "Sponsor Benefits" finale (guitar version) —
 * replaces the old carbonation bubbles (which suited the Monster can, not a
 * guitar). A light DOM/CSS layer (no WebGL): gold note glyphs drift upward with
 * a gentle sway + rotation, matching the RRU gold look. Kept as the default
 * `AudienceBubbles` export so the shared AudienceSection — which reveals the
 * `.aud-bubbles` container on the finale beat — needs no change.
 */

const GLYPHS = ["♪", "♫", "♬", "♩", "♩", "♫"];

// Deterministic per-note config (index-derived, no Math.random → no SSR/hydration
// mismatch). Spread across the width, varied size / timing / drift.
const NOTES = Array.from({ length: 18 }, (_, i) => ({
    glyph: GLYPHS[i % GLYPHS.length],
    left: (i * 41 + 6) % 100, // % across the width
    size: 1.3 + ((i * 13) % 21) / 10, // 1.3 – 3.4 rem
    delay: -(((i * 1.7) % 14) + (i % 3) * 0.4), // negative → already mid-flight, staggered
    duration: 11 + (i % 7), // 11 – 17 s
    drift: (((i * 7) % 9) - 4) * 14, // -56 … +56 px horizontal sway
    rot: (((i * 5) % 7) - 3) * 10, // -30 … +30 deg
    opacity: 0.55 + ((i * 3) % 5) / 10, // 0.55 – 0.95
}));

export default function AudienceBubbles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <style>{`
                @keyframes rru-note-rise {
                    0%   { transform: translateY(16vh) translateX(0) rotate(0deg); opacity: 0; }
                    14%  { opacity: var(--note-op); }
                    86%  { opacity: var(--note-op); }
                    100% { transform: translateY(-98vh) translateX(var(--note-drift)) rotate(var(--note-rot)); opacity: 0; }
                }
                .rru-note {
                    position: absolute;
                    bottom: -6vh;
                    color: #f4c020;
                    font-family: "Apple Symbols", "Segoe UI Symbol", "Noto Music", system-ui, sans-serif;
                    text-shadow: 0 0 14px rgba(244,192,32,0.55), 0 2px 6px rgba(0,0,0,0.65);
                    line-height: 1;
                    user-select: none;
                    will-change: transform, opacity;
                    animation: rru-note-rise linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .rru-note { animation: none; opacity: 0.5; bottom: auto; top: 40%; }
                }
            `}</style>
            {NOTES.map((n, i) => (
                <span
                    key={i}
                    className="rru-note"
                    style={
                        {
                            left: `${n.left}%`,
                            fontSize: `${n.size}rem`,
                            animationDelay: `${n.delay}s`,
                            animationDuration: `${n.duration}s`,
                            "--note-drift": `${n.drift}px`,
                            "--note-rot": `${n.rot}deg`,
                            "--note-op": n.opacity,
                        } as React.CSSProperties
                    }
                >
                    {n.glyph}
                </span>
            ))}
        </div>
    );
}
