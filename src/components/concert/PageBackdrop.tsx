/**
 * Full-page background pinned behind everything (`-z-10`).
 *
 * Act 1 (concert) and the audience interstitial are opaque (z-40) and cover it;
 * the "Feel the Rush" closer is transparent, so this solid black shows through
 * behind the falling can and clouds. (It used to ramp black→red for the Monster
 * showcase, but that experience has been removed — a flat black is all we need.)
 */
export default function PageBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="page-backdrop fixed inset-0 -z-10"
            style={{ backgroundColor: "#000000" }}
        />
    );
}
