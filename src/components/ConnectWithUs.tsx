/**
 * "Partner With Us" call-to-action, shown just above the footer.
 * Red stage-smoke backdrop (the concert's cloud video, tinted red) with the RRU
 * gold accent and a single "Get in Touch" action.
 */
export default function ConnectWithUs() {
    return (
        <section id="sec-partner" className="relative z-[1] overflow-hidden border-t border-white/10 bg-[#6d1710] text-white">
            {/* Red stage smoke — the concert's cloud video */}
            <video
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/stage/main-stage.png"
                aria-hidden="true"
                tabIndex={-1}
            >
                <source src="/stage/stage-smoke.mp4" type="video/mp4" />
            </video>
            {/* Deep-red tint + darkening for legibility */}
            <div aria-hidden="true" className="absolute inset-0 bg-[#8a1c12] mix-blend-multiply" />
            <div aria-hidden="true" className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-7 px-4 py-24 text-center">
                <h2 className="[font-family:var(--font-bebas)] uppercase leading-[0.95] tracking-[0.03em] text-[clamp(2.75rem,8vw,5.5rem)] bg-gradient-to-b from-[#fff3cf] via-[#f4c020] to-[#d98200] bg-clip-text text-transparent [filter:drop-shadow(0_3px_14px_rgba(0,0,0,0.6))]">
                    Partner With Us
                </h2>
                <p className="max-w-2xl text-[clamp(1.2rem,2.5vw,1.65rem)] leading-relaxed text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
                    Let&apos;s create an unforgettable rock experience together. Get in
                    touch to discuss sponsorship opportunities and custom brand
                    collaborations.
                </p>

                <a
                    href="mailto:dave@incisiv.com"
                    className="mt-3 rounded-full bg-[#f4c020] px-9 py-3.5 text-lg font-bold uppercase tracking-wide text-black shadow-[0_6px_24px_rgba(0,0,0,0.45)] transition-colors duration-200 hover:bg-[#ffd84d]"
                >
                    Get in Touch
                </a>
            </div>
        </section>
    );
}
