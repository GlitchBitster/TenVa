/**
 * lib/logger.ts
 *
 * Lightweight file-based logger for the TenVa Next.js app.
 * Writes structured log entries to `logs/app.log` in the project root.
 * Safe to import in any server-side file (API routes, Server Components, instrumentation).
 * Does nothing in Edge / browser runtimes where `fs` is unavailable.
 */

import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB – rotate after this

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true when running on Node.js (not Edge / browser). */
function isNodeRuntime(): boolean {
  return typeof process !== "undefined" && process.versions?.node !== undefined;
}

/** Ensures the logs directory exists (creates it if needed). */
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/** Rotate the log file when it exceeds MAX_FILE_BYTES. */
function rotateIfNeeded(): void {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const { size } = fs.statSync(LOG_FILE);
      if (size >= MAX_FILE_BYTES) {
        const rotated = path.join(
          LOG_DIR,
          `app-${new Date().toISOString().replace(/[:.]/g, "-")}.log`
        );
        fs.renameSync(LOG_FILE, rotated);
      }
    }
  } catch {
    // Rotation failure is non-fatal
  }
}

/** Serialise an unknown error/value to a plain object for JSON. */
export function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.cause !== undefined ? { cause: String(err.cause) } : {}),
    };
  }
  return { raw: String(err) };
}

// ─── Core write function ──────────────────────────────────────────────────────

function writeLog(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };

  // Always mirror to console (preserves dev-mode stdout)
  const consoleFn =
    level === "ERROR" ? console.error
    : level === "WARN"  ? console.warn
    : level === "DEBUG" ? console.debug
    : console.log;

  consoleFn(`[${entry.timestamp}] [${level}] ${message}`, meta ?? "");

  // Write to file only in Node.js runtime
  if (!isNodeRuntime()) return;

  try {
    ensureLogDir();
    rotateIfNeeded();
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // File write failures must never crash the app
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    writeLog("INFO", message, meta);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    writeLog("WARN", message, meta);
  },

  error(message: string, errOrMeta?: unknown, extraMeta?: Record<string, unknown>): void {
    let meta: Record<string, unknown> | undefined;

    if (errOrMeta instanceof Error || (typeof errOrMeta === "object" && errOrMeta !== null && !("message" in (errOrMeta as object) === false))) {
      meta = {
        ...(errOrMeta instanceof Error ? { error: serializeError(errOrMeta) } : (errOrMeta as Record<string, unknown>)),
        ...extraMeta,
      };
    } else if (errOrMeta !== undefined) {
      meta = { raw: String(errOrMeta), ...extraMeta };
    }

    writeLog("ERROR", message, meta);
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      writeLog("DEBUG", message, meta);
    }
  },
};

export default logger;
