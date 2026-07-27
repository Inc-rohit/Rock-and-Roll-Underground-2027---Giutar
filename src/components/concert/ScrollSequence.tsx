import { ReactNode } from "react";

/**
 * Layer 4 — the foreground content layer that holds the animated panels.
 * Sits above the stage, overlay and musicians. Purely structural; the
 * scroll timeline lives in ConcertHero and targets the `.sequence-panel`s.
 */
export default function ScrollSequence({ children }: { children: ReactNode }) {
    return <div className="scroll-sequence absolute inset-0 z-30">{children}</div>;
}
