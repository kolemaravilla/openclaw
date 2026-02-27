/**
 * Feedback tracking types for OpenClaw.
 *
 * Captures user sentiment signals (reactions, grades, comments) alongside
 * model/provider metadata so operators can compare LLM quality over time.
 */

/** Sentiment score: -1 = negative, 0 = neutral, +1 = positive. */
export type FeedbackSentiment = -1 | 0 | 1;

/**
 * Where the feedback came from.
 * - "reaction"       — Discord/Slack emoji reaction on a bot message
 * - "grade"          — Structured grade from a standup or weekly report reply
 * - "comment"        — Free-text feedback from the operator
 */
export type FeedbackKind = "reaction" | "grade" | "comment";

/**
 * A single feedback entry, appended to the JSONL log.
 *
 * Designed to be self-contained: every field needed to bucket, filter,
 * and trend feedback is captured at write-time rather than requiring
 * joins against session/transcript data.
 */
export type FeedbackEntry = {
  /** Unix epoch ms when the feedback was recorded. */
  ts: number;

  /** Feedback classification. */
  kind: FeedbackKind;

  /** Normalized sentiment. */
  sentiment: FeedbackSentiment;

  // -- Source context --

  /** Raw emoji string (for reaction feedback). */
  emoji?: string;
  /** Provider message ID that was reacted to / graded. */
  messageId?: string;
  /** OpenClaw channel ("discord", "telegram", "slack", etc.). */
  channel?: string;
  /** Channel-specific surface (channel ID, group ID). */
  channelId?: string;
  /** Provider account ID (multi-account). */
  accountId?: string;
  /** Discord guild ID (if applicable). */
  guildId?: string;

  // -- Actor --

  /** Who gave the feedback (user ID). */
  userId?: string;
  /** Display tag (e.g. "peter#1234"). */
  userTag?: string;

  // -- Model context (snapshot at feedback time) --

  /** Session key where the graded response was generated. */
  sessionKey?: string;
  /** Model ID that generated the response (e.g. "deepseek-chat"). */
  model?: string;
  /** Provider that served the model (e.g. "deepseek"). */
  provider?: string;
  /** Provider/model label (e.g. "deepseek/deepseek-chat"). */
  modelLabel?: string;

  // -- Structured grading (weekly report / standup) --

  /** Category being graded ("work", "attitude", "personality", "communication"). */
  category?: string;
  /** Letter/number grade if provided ("A", "B+", "3/5", etc.). */
  grade?: string;
  /** Free-text note or commentary. */
  note?: string;

  // -- Provenance --

  /** How the feedback was captured. */
  source?: string;
};

/**
 * Feedback configuration (per-agent or global).
 */
export type FeedbackConfig = {
  /** Enable feedback tracking. Default: true. */
  enabled?: boolean;

  /** Custom storage path. Default: ~/.openclaw/feedback/log.jsonl */
  storePath?: string;

  /** Max log file size in bytes before rotation. Default: 5MB. */
  maxBytes?: number;

  /** Reaction sentiment mappings (emoji → sentiment). Merged with defaults. */
  reactionMap?: Record<string, FeedbackSentiment>;
};
