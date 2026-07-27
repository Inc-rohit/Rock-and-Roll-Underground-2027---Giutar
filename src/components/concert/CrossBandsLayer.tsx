/**
 * Layer 3b — independent layer reserved for the red cross-strip graphics.
 * Intentionally empty for now; drop transparent PNGs / SVGs in here later
 * (they'll sit above the overlay and below the animated text panels).
 */
export default function CrossBandsLayer() {
    return (
        <div
            aria-hidden="true"
            className="cross-bands-layer pointer-events-none absolute inset-0 z-20"
        />
    );
}
