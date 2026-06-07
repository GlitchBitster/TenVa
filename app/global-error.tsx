"use client";
/**
 * app/global-error.tsx
 *
 * Root-level error boundary — catches rendering errors in the root layout.
 * Must define its own <html> and <body> tags when active.
 * Logs errors to the server via the /api/log-error endpoint.
 *
 * Docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
 */

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

async function reportErrorToServer(error: Error & { digest?: string }): Promise<void> {
  try {
    await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack,
        digest: error.digest,
        context: "global-error-boundary",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      }),
    });
  } catch {
    // Reporting must never throw
  }
}

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GlobalError Boundary]", error);
    reportErrorToServer(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong – TenVa</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #0D0A1A;
            color: #F5F0FF;
            font-family: 'Segoe UI', system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(180,120,255,0.2);
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 480px;
            width: 90%;
            text-align: center;
            backdrop-filter: blur(12px);
          }
          .icon { font-size: 48px; margin-bottom: 20px; }
          h1 { font-size: 24px; margin-bottom: 12px; color: #D4AF7A; }
          p  { color: #A0A0A8; line-height: 1.6; margin-bottom: 28px; }
          .digest { font-size: 11px; color: #6B21A8; margin-top: -16px; margin-bottom: 28px; }
          button {
            background: linear-gradient(135deg, #6B21A8, #9333EA);
            color: #fff;
            border: none;
            padding: 12px 32px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          button:hover { opacity: 0.85; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon">✦</div>
          <h1>Something went wrong</h1>
          <p>
            An unexpected error occurred. Our team has been notified.
            <br />Please try again or return later.
          </p>
          {error.digest && (
            <p className="digest">Reference: {error.digest}</p>
          )}
          <button onClick={unstable_retry}>Try again</button>
        </div>
      </body>
    </html>
  );
}
