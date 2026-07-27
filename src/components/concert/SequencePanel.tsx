import { ReactNode } from "react";
import clsx from "clsx";

/**
 * A single step in the scroll sequence. Absolutely centred over the stage.
 * Starts hidden (opacity-0) to avoid a flash before GSAP takes control;
 * ConcertHero animates every `.sequence-panel` in order.
 */
export default function SequencePanel({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={clsx(
                "sequence-panel absolute inset-0 grid place-items-center px-6 text-center opacity-0",
                className,
            )}
        >
            <div className="w-full max-w-5xl">{children}</div>
        </div>
    );
}
