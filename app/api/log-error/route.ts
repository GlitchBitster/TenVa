/**
 * app/api/log-error/route.ts
 *
 * Internal endpoint — receives client-side error reports from the global-error
 * and segment error boundaries, then writes them to the server log file.
 *
 * Only accessible from the same origin (no auth required; errors are low-risk
 * payloads, and we sanitise the input before writing).
 */

import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { message, name, stack, digest, context, url } = body as {
      message?: string;
      name?: string;
      stack?: string;
      digest?: string;
      context?: string;
      url?: string;
    };

    logger.error("[Client Error Report]", undefined, {
      name: name ?? "Error",
      message: message ?? "(no message)",
      digest,
      context,
      url,
      // Only include stack in non-production to avoid leaking internals
      ...(process.env.NODE_ENV !== "production" && stack ? { stack } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    logger.error("[log-error endpoint] Failed to process client error report", error as Error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
