/**
 * Append-only JSONL feedback store.
 *
 * Writes one JSON object per line to ~/.openclaw/feedback/log.jsonl
 * (configurable). Supports basic querying for analytics and reports.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createSubsystemLogger } from "../logging/subsystem.js";
import type { FeedbackEntry, FeedbackSentiment } from "./types.js";

const log = createSubsystemLogger("feedback");

const DEFAULT_STORE_DIR = ".openclaw/feedback";
const DEFAULT_STORE_FILE = "log.jsonl";
const DEFAULT_MAX_BYTES = 5_000_000; // 5 MB

let resolvedStorePath: string | null = null;

/**
 * Resolve the feedback log file path.
 * Uses customPath if provided, otherwise defaults to ~/.openclaw/feedback/log.jsonl
 */
export function resolveFeedbackStorePath(customPath?: string): string {
  if (customPath) {
    return path.resolve(customPath);
  }
  if (resolvedStorePath) {
    return resolvedStorePath;
  }
  const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
  resolvedStorePath = path.resolve(home, DEFAULT_STORE_DIR, DEFAULT_STORE_FILE);
  return resolvedStorePath;
}

// Serialize writes to avoid interleaving from concurrent reactions
let writeQueue = Promise.resolve();

/**
 * Append a feedback entry to the JSONL log.
 * Fire-and-forget safe — errors are logged but never thrown.
 */
export async function appendFeedback(
  entry: FeedbackEntry,
  opts?: { storePath?: string },
): Promise<void> {
  const prev = writeQueue;
  writeQueue = prev.then(() => doAppend(entry, opts?.storePath)).catch(() => {});
  await writeQueue;
}

async function doAppend(entry: FeedbackEntry, customPath?: string): Promise<void> {
  try {
    const filePath = resolveFeedbackStorePath(customPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const line = JSON.stringify(entry) + "\n";
    await fs.appendFile(filePath, line, "utf-8");
  } catch (err) {
    log.error(`failed to write feedback: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ---------------------------------------------------------------------------
// Query helpers — used by report generation and analytics
// ---------------------------------------------------------------------------

export type FeedbackQueryOptions = {
  /** Only entries after this timestamp (ms). */
  since?: number;
  /** Only entries before this timestamp (ms). */
  until?: number;
  /** Filter by feedback kind. */
  kind?: FeedbackEntry["kind"];
  /** Filter by sentiment. */
  sentiment?: FeedbackSentiment;
  /** Filter by model label (e.g. "deepseek/deepseek-chat"). */
  modelLabel?: string;
  /** Filter by provider. */
  provider?: string;
  /** Filter by channel ("discord", "telegram", etc.). */
  channel?: string;
  /** Filter by source ("discord-reaction", "standup", "weekly-report"). */
  source?: string;
  /** Max entries to return (newest first). Default: 500. */
  limit?: number;
  /** Custom store path. */
  storePath?: string;
};

/**
 * Read feedback entries matching the given filters.
 * Returns newest-first by default. Does a full scan of the JSONL file.
 */
export async function queryFeedback(opts: FeedbackQueryOptions = {}): Promise<FeedbackEntry[]> {
  const filePath = resolveFeedbackStorePath(opts.storePath);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }

  const limit = opts.limit ?? 500;
  const results: FeedbackEntry[] = [];

  const lines = raw.split("\n");
  // Iterate newest-first (bottom of file)
  for (let i = lines.length - 1; i >= 0 && results.length < limit; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const entry = JSON.parse(line) as FeedbackEntry;
      if (matchesFilter(entry, opts)) {
        results.push(entry);
      }
    } catch {
      // skip malformed lines
    }
  }

  return results;
}

function matchesFilter(entry: FeedbackEntry, opts: FeedbackQueryOptions): boolean {
  if (opts.since && entry.ts < opts.since) return false;
  if (opts.until && entry.ts > opts.until) return false;
  if (opts.kind && entry.kind !== opts.kind) return false;
  if (opts.sentiment !== undefined && entry.sentiment !== opts.sentiment) return false;
  if (opts.modelLabel && entry.modelLabel !== opts.modelLabel) return false;
  if (opts.provider && entry.provider !== opts.provider) return false;
  if (opts.channel && entry.channel !== opts.channel) return false;
  if (opts.source && entry.source !== opts.source) return false;
  return true;
}

/**
 * Aggregate feedback by model label for a given time range.
 * Returns a map of modelLabel → { positive, neutral, negative, total }.
 */
export async function aggregateFeedbackByModel(
  opts: Pick<FeedbackQueryOptions, "since" | "until" | "storePath"> = {},
): Promise<
  Map<string, { positive: number; neutral: number; negative: number; total: number }>
> {
  const entries = await queryFeedback({ ...opts, limit: 10_000 });
  const buckets = new Map<
    string,
    { positive: number; neutral: number; negative: number; total: number }
  >();

  for (const entry of entries) {
    const key = entry.modelLabel ?? entry.model ?? "unknown";
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { positive: 0, neutral: 0, negative: 0, total: 0 };
      buckets.set(key, bucket);
    }
    bucket.total++;
    if (entry.sentiment === 1) bucket.positive++;
    else if (entry.sentiment === -1) bucket.negative++;
    else bucket.neutral++;
  }

  return buckets;
}
