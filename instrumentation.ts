/**
 * instrumentation.ts
 *
 * Next.js 16 Instrumentation API
 * ─ `register`       : called ONCE when the server starts (Node.js runtime only).
 * ─ `onRequestError` : called for EVERY unhandled server-side error across all
 *                      route types (Server Components, Route Handlers, Server
 *                      Actions, and Proxy routes).
 *
 * Docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md
 */

import type { Instrumentation } from "next";

// ─── Startup hook ─────────────────────────────────────────────────────────────

export async function register(): Promise<void> {
  // Only run in the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Dynamically import logger to avoid edge-runtime issues
  const { default: logger } = await import("@/lib/logger");
  logger.info("TenVa server started", {
    nodeEnv: process.env.NODE_ENV,
    runtime: process.env.NEXT_RUNTIME,
  });
}

// ─── Global server-error hook ─────────────────────────────────────────────────

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  // Edge runtime does not have Node.js `fs` — skip file logging there
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    console.error("[onRequestError][edge]", err, request, context);
    return;
  }

  const { default: logger, serializeError } = await import("@/lib/logger");

  logger.error("[Server Request Error]", err, {
    digest: (err as Error & { digest?: string }).digest,
    request: {
      method: request.method,
      path: request.path,
    },
    context: {
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    },
    // Include raw error fields for completeness
    errorDetail: serializeError(err),
  });
};
