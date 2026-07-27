import type { Metadata } from "next";

import ConcertHero from "@/components/concert/ConcertHero";
import AudienceSection from "@/components/concert/AudienceSection";
import SkyDiveSection from "@/components/concert/SkyDiveSection";
import AlternatingTextSection from "@/components/concert/AlternatingTextSection";
import SmoothScroll from "@/components/concert/SmoothScroll";

const SITE_URL = "https://rock-and-roll-underground-2027.vercel.app";
const TITLE = "Rock & Roll Underground 2027 — The Cutting Room";
const DESCRIPTION =
  "The most exciting event at NRF 2027. The Cutting Room, New York · January 11, 2027 · 8:30 PM.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Rock & Roll Underground 2027",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Rock & Roll Underground 2027 — The Cutting Room · January 11, 2027 · 8:30 PM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

/**
 * Homepage — one continuous, smooth-scrolling experience (all our own now; the
 * Fizzi/Monster Prismic slice showcase has been removed):
 *   1. the cinematic RRU concert hero (pinned scroll sequence)
 *   2. the concert-audience interstitial → Sponsor Benefits finale (2 cans)
 *   3. the "Feel the Rush" sky-dive beat (falling can + gold 3D words)
 *   4. the alternating "Triple the Charge" closer (copy blocks + floating can)
 */
export default function Home() {
  return (
    <SmoothScroll>
      {/* Act 1 — RRU concert hero */}
      <ConcertHero />
      {/* Black band bridging the concert into the audience interstitial. */}
      <div
        aria-hidden="true"
        className="relative z-50 -mt-[2vh] h-[16vh] w-full bg-black"
      />
      {/* Audience interstitial → Sponsor Benefits finale (ends on black). */}
      <AudienceSection />
      {/* "Feel the Rush" falling can (flows out of the black finale). */}
      <SkyDiveSection />
      {/* Closer — alternating copy blocks with a floating can. */}
      <AlternatingTextSection />
    </SmoothScroll>
  );
}
