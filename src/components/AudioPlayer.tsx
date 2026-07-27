"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Event soundtrack with a top-right toggle + a live BASS visualizer.
 *
 * Browsers block audio-with-sound from autoplaying on load, but they DO allow
 * MUTED autoplay. So we start the track muted immediately, then unmute it on
 * the very first user interaction (click / scroll / key / touch) — the track is
 * already running, so sound switches on the instant the visitor engages. The
 * button toggles sound on/off (animated equalizer bars = sound on).
 *
 * A Web Audio AnalyserNode taps the track and, every frame, measures the
 * low-frequency (bass) energy and publishes it as `--bass` (0..1) on <html>.
 * The hero's "subwoofer" glow + ripple read that variable, so they physically
 * pump to the bass — like watching a speaker cone thump on a heavy bass line.
 */
export default function AudioPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [soundOn, setSoundOn] = useState(false);

    // Web Audio graph (created once, on the first user gesture).
    const ctxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const binsRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

    // Build the analyser graph: audio → analyser → speakers. Runs once, and
    // only from inside a user gesture so the AudioContext is allowed to start.
    const setupAnalyser = () => {
        const audio = audioRef.current;
        if (!audio || ctxRef.current) return;
        try {
            const AC: typeof AudioContext =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const ctx = new AC();
            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            ctx.resume().catch(() => {});
            ctxRef.current = ctx;
            analyserRef.current = analyser;
            binsRef.current = new Uint8Array(analyser.frequencyBinCount);
        } catch {
            /* Web Audio unavailable — the CSS idle pulse still runs. */
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = 0.55;

        // 1) Muted autoplay (always allowed) — the track starts on load.
        audio.muted = true;
        audio.play().catch(() => {});

        // 2) Unmute at the first interaction and wire up the analyser.
        const events = ["pointerdown", "click", "keydown", "touchstart", "wheel", "scroll"];
        const enableSound = () => {
            audio.muted = false;
            setupAnalyser();
            ctxRef.current?.resume().catch(() => {});
            audio
                .play()
                .then(() => setSoundOn(true))
                .catch(() => {});
            cleanup();
        };
        const cleanup = () => events.forEach((e) => window.removeEventListener(e, enableSound));
        events.forEach((e) => window.addEventListener(e, enableSound, { passive: true }));

        return cleanup;
    }, []);

    // Bass-meter loop → publishes `--bass` (0..1) on <html> every frame. Uses a
    // gentle idle "breath" when the analyser has no signal (before sound is on
    // or while paused) and the real low-frequency energy once it's playing.
    useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.documentElement.style.setProperty("--bass", "0.12");
            return;
        }
        const root = document.documentElement;
        let raf = 0;
        let smooth = 0;
        const loop = (t: number) => {
            let bass = 0;
            const analyser = analyserRef.current;
            const bins = binsRef.current;
            if (analyser && bins) {
                analyser.getByteFrequencyData(bins);
                let sum = 0;
                const N = 6; // lowest ~6 bins ≈ sub-bass / kick range
                for (let i = 0; i < N; i++) sum += bins[i];
                bass = Math.min(1, (sum / (N * 255)) * 1.5); // normalize + a little gain
            }
            // Gentle idle breathing so there's always life; real bass overrides it.
            const idle = 0.1 + 0.05 * Math.sin(t / 520);
            const target = Math.max(bass, idle);
            smooth += (target - smooth) * 0.35; // frame-lerp for smooth motion
            root.style.setProperty("--bass", smooth.toFixed(4));
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (soundOn) {
            audio.pause();
            setSoundOn(false);
        } else {
            audio.muted = false;
            setupAnalyser();
            ctxRef.current?.resume().catch(() => {});
            audio
                .play()
                .then(() => setSoundOn(true))
                .catch(() => {});
        }
    };

    return (
        <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={audioRef} loop preload="auto" crossOrigin="anonymous">
                <source src="/audio.m4a" type="audio/mp4" />
                <source src="/audio.wav" type="audio/wav" />
            </audio>
            <button
                type="button"
                onClick={toggle}
                aria-label={soundOn ? "Mute music" : "Play music"}
                aria-pressed={soundOn}
                title={soundOn ? "Mute music" : "Play music"}
                className={`fixed right-5 top-5 z-[200] flex h-12 w-12 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/25 backdrop-blur-md transition-colors hover:bg-black/70 ${
                    soundOn ? "text-[#f5c518]" : "text-white/85"
                }`}
            >
                {/* Universal speaker icon: sound waves when on, ✕ when muted. */}
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                    {soundOn ? (
                        <>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </>
                    ) : (
                        <>
                            <line x1="22" y1="9" x2="16" y2="15" />
                            <line x1="16" y1="9" x2="22" y2="15" />
                        </>
                    )}
                </svg>
            </button>
        </>
    );
}
