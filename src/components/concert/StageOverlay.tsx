/**
 * Layer 2 — dark readability overlay.
 * Transparent-black gradients only: darkens the edges/top/bottom for text
 * legibility while leaving the centre spotlight of the stage visible.
 * No colour, hue or filter changes are applied to the image beneath.
 */
export default function StageOverlay() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            style={{
                background:
                    "radial-gradient(120% 90% at 50% 42%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 46%, rgba(0,0,0,0.55) 100%)," +
                    "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.62) 100%)",
            }}
        />
    );
}
