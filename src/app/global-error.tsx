"use client";

/**
 * Global error boundary. Also works around a Next 15 + Turbopack dev bug where
 * the builtin global-error module isn't found in the React Client Manifest —
 * providing an explicit one resolves it.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    background: "#000",
                    color: "#f4c020",
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "center",
                    padding: "2rem",
                }}
            >
                <h2 style={{ margin: 0, fontSize: "1.5rem", letterSpacing: "0.04em" }}>
                    Something went wrong.
                </h2>
                <button
                    type="button"
                    onClick={() => reset()}
                    style={{
                        padding: "0.6rem 1.4rem",
                        borderRadius: "999px",
                        border: "none",
                        background: "#f4c020",
                        color: "#000",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
