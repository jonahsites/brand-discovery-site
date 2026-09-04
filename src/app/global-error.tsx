"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F6F4EF", color: "#121A24", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div style={{ maxWidth: 480, padding: 40, textAlign: "center", background: "#EDE8DE", borderRadius: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.5, marginBottom: 12 }}>Kindred</div>
          <h1 style={{ fontSize: 28, letterSpacing: "-.04em", margin: "0 0 12px" }}>The whole page fell over.</h1>
          <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5, margin: "0 0 20px" }}>{error.digest ? `Reference ${error.digest}. ` : ""}Reload to pick up where you were; your bag and follows are saved on this device.</p>
          <button onClick={reset} style={{ background: "#121A24", color: "#F6F4EF", border: 0, borderRadius: 999, padding: "12px 24px", fontWeight: 600, fontSize: 13 }}>Reload</button>
        </div>
      </body>
    </html>
  );
}
