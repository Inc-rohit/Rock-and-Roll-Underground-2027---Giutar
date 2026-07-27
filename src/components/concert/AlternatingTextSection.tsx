"use client";

import { useState } from "react";
import clsx from "clsx";
import { View } from "@react-three/drei";

import Scene from "@/slices/AlternatingText/Scene";

/**
 * Sponsor tiers — three tabs (Marquis / Title / Supporting) on a black backdrop.
 * The tab bar sticks to the top; each tab shows its three benefit blocks in the
 * original alternating layout: copy alternates left/right while a floating
 * Monster can (the shared AlternatingText `Scene`) slides to the opposite side
 * on scroll. Switching tabs swaps the copy; the can keeps sliding for the three
 * blocks.
 */
type Item = string | { text: string; sub: string[] };
type Block = { heading: string; items: Item[] };

const GOLD_GRADIENT =
    "bg-gradient-to-b from-[#fff3cf] via-[#f4c020] to-[#d98200] bg-clip-text text-transparent";
const HEADING_CLS = `[font-family:var(--font-bebas)] uppercase leading-[0.92] tracking-[0.02em] text-[clamp(2.5rem,6vw,4.5rem)] ${GOLD_GRADIENT} [filter:drop-shadow(0_3px_12px_rgba(0,0,0,0.7))]`;
const ITEM_CLS =
    "pl-2 text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.95)] text-[clamp(1.1rem,2.2vw,1.55rem)] leading-[1.35]";
const SUBITEM_CLS =
    "pl-1 text-white/85 [text-shadow:0_2px_10px_rgba(0,0,0,0.95)] text-[clamp(1rem,1.9vw,1.35rem)] leading-[1.3]";

const BENEFITS: Block[] = [
    {
        heading: "Full Turnkey Production",
        items: [
            "Venue and platform management",
            "Band recruitment + assembly",
            "Band management",
            "Pre-show promotional graphics",
            "Show graphics",
            "Event MC + Flow",
            "Landing page design / production.",
            "Management of attendee list",
            "Design & production of show t-shirts",
        ],
    },
    {
        heading: "Experience",
        items: [
            "Dedicated VIP section for Execs in the upper tier of venue",
            "Inclusion of company executives in giveaways and addresses from the stage.",
            "Official Drink of the Show with Distribution of Product and inclusion in marquis cocktail",
            "Up to Twenty-five (25) attendees",
            {
                text: "Management of:",
                sub: ["Social channels + show social media", "Giveaways"],
            },
        ],
    },
    {
        heading: "Marketing",
        items: [
            {
                text: "Full marketing package including:",
                sub: [
                    "Incisiv will target invites to key targets and prospects",
                    "Premier exclusive branding above the Logo and on event registration page and all on-site signage",
                    "Branding on event tickets provided for pre-event distribution",
                    "Promotional copy",
                    "Email/Social Media templates",
                    "Post event sizzle video",
                    "Logo on Event T-Shirts",
                ],
            },
        ],
    },
];

// Title tier ---------------------------------------------------------------
const TITLE_TURNKEY: Block = {
    heading: "Full Turnkey Production",
    items: [
        "Venue and platform management",
        "Band recruitment + assembly",
        "Band management",
        "Pre-show promotional graphics",
        "Show graphics",
        "Event MC + Flow",
        "Landing page design / production.",
        "Management of attendee list",
    ],
};

const TITLE_EXPERIENCE: Block = {
    heading: "Experience",
    items: [
        {
            text: "Management of:",
            sub: [
                "Social channels + show social media",
                "Design & production of show t-shirts",
                "Giveaways",
            ],
        },
        "Inclusion of company executives in giveaways and addresses from the stage.",
        "Up to Twenty-five (25) attendees",
    ],
};

const TITLE_MARKETING: Block = {
    heading: "Marketing",
    items: [
        {
            text: "Full marketing package including:",
            sub: [
                "Incisiv will target invites to Companies, Titles and specific executives in the Relex/Partner ICP",
                "Dedicated section for Execs in the upper tier of venue",
                "Supporting sponsor branding on event registration page and all on-site signage",
                "Branding on event tickets provided to Relex/Partner for pre-event distribution",
                "Promotional copy",
                "Email/Social Media templates",
                "Post event sizzle video",
                "Logo on Event T-Shirts",
            ],
        },
    ],
};

// Supporting tier ----------------------------------------------------------
const SUPPORTING_EXPERIENCE: Block = {
    heading: "Experience",
    items: [
        {
            text: "Management of:",
            sub: ["Social channels + show social media", "Giveaways"],
        },
        "Inclusion of company executives in giveaways and addresses from the stage.",
        "Up to six (6) sponsor representatives can attend",
    ],
};

const SUPPORTING_MARKETING: Block = {
    heading: "Marketing",
    items: [
        {
            text: "Full marketing package including:",
            sub: [
                "Supporting sponsor branding on event registration page",
                "Supporting sponsor branding on all on-site signage",
                "Promotional copy",
                "Email templates",
                "Social media templates",
                "Registration management",
            ],
        },
    ],
};

const TIERS: { label: string; blocks: Block[] }[] = [
    { label: "Marquis Sponsor", blocks: [BENEFITS[0], BENEFITS[1], BENEFITS[2]] },
    { label: "Title Sponsor", blocks: [TITLE_TURNKEY, TITLE_EXPERIENCE, TITLE_MARKETING] },
    { label: "Supporting Sponsor", blocks: [TITLE_TURNKEY, SUPPORTING_EXPERIENCE, SUPPORTING_MARKETING] },
];

function Bullets({ block }: { block: Block }) {
    return (
        <ul className="mt-6 list-disc space-y-3 pl-7 marker:text-[#f4c020]">
            {block.items.map((item, i) =>
                typeof item === "string" ? (
                    <li key={i} className={ITEM_CLS}>
                        {item}
                    </li>
                ) : (
                    <li key={i} className={ITEM_CLS}>
                        {item.text}
                        <ul className="mt-2.5 list-[circle] space-y-2 pl-6 marker:text-[#f4c020]/70">
                            {item.sub.map((s, j) => (
                                <li key={j} className={SUBITEM_CLS}>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </li>
                ),
            )}
        </ul>
    );
}

export default function AlternatingTextSection() {
    const [active, setActive] = useState(0);

    return (
        <section className="sponsor-tiers relative bg-[#0a0505] text-white">
            {/* Sticky tab bar — above the pinned can and the scrolling copy */}
            <div className="sticky top-0 z-[110] border-b border-white/10 bg-[#0a0505]/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl px-4 md:px-6">
                    {TIERS.map((tier, i) => {
                        const on = i === active;
                        return (
                            <button
                                key={tier.label}
                                type="button"
                                onClick={() => setActive(i)}
                                aria-pressed={on}
                                className={clsx(
                                    "flex-1 border-b-2 px-3 py-4 text-center uppercase transition-colors [font-family:var(--font-bebas)] tracking-[0.08em] text-[clamp(0.95rem,1.9vw,1.45rem)]",
                                    on
                                        ? "border-[#f4c020] text-[#f4c020]"
                                        : "border-transparent text-white/45 hover:text-white/80",
                                )}
                            >
                                {tier.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active tier — three blocks alternating L/R with the sliding can */}
            <div className="alternating-text-container relative px-4 md:px-6">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="relative z-[100] grid">
                        <View className="alternating-text-view absolute left-0 top-0 h-screen w-full">
                            <Scene />
                        </View>

                        {TIERS[active].blocks.map((block, index) => (
                            <div
                                key={index}
                                className="alternating-section grid h-screen place-items-center gap-x-12 md:grid-cols-2"
                            >
                                <div
                                    className={clsx(
                                        index % 2 === 0 ? "col-start-1" : "md:col-start-2",
                                        "max-w-2xl px-2",
                                    )}
                                >
                                    <h2 className={HEADING_CLS}>{block.heading}</h2>
                                    <Bullets block={block} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
