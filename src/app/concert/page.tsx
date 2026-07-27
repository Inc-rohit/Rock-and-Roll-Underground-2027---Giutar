import { redirect } from "next/navigation";

// The full experience — RRU concert (Act 1) flowing into the Monster drink
// showcase (Act 2) — now lives at "/". Anyone landing on the old concert-only
// URL is sent to the complete page so there's a single canonical experience.
export default function ConcertPage() {
    redirect("/");
}
