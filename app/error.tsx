"use client";
/**
 * app/error.tsx
 *
 * Segment-level error boundary — catches errors in all nested route segments
 * (but not the root layout, which is covered by global-error.tsx).
 *
 * Docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
 */

import { useEffect } from "react";

interface ErrorProps {
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
        context: "segment-error-boundary",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      }),
    });
  } catch {
    // Reporting must never throw
  }
}

export default function Error({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
    reportErrorToServer(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(180,120,255,0.2)",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
        <h2
          style={{
            color: "#D4AF7A",
            fontSize: "20px",
            marginBottom: "12px",
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            color: "#A0A0A8",
            lineHeight: "1.6",
            marginBottom: "24px",
            fontSize: "14px",
          }}
        >
          An error occurred while rendering this page.
          <br />
          Try refreshing or click the button below.
        </p>
        {error.digest && (
          <p
            style={{
              fontSize: "11px",
              color: "#6B21A8",
              marginBottom: "20px",
            }}
          >
            Ref: {error.digest}
          </p>
        )}
        <button
          id="error-retry-btn"
          onClick={unstable_retry}
          style={{
            background: "linear-gradient(135deg, #6B21A8, #9333EA)",
            color: "#fff",
            border: "none",
            padding: "10px 28px",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
