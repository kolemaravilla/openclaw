/**
 * Maps emoji reactions to sentiment scores.
 *
 * Default mapping:
 *   👎 / thumbsdown  = -1 (bad)
 *   no reaction       =  0 (satisfactory — implicit, not stored)
 *   👍 / thumbsup     = +1 (exceeds expectations)
 *
 * Other reactions are recorded with sentiment 0 as informational signals.
 */

import type { FeedbackSentiment } from "./types.js";

/** Built-in emoji → sentiment mappings. */
const DEFAULT_REACTION_MAP: Record<string, FeedbackSentiment> = {
  // Positive
  "👍": 1,
  "👍🏻": 1,
  "👍🏼": 1,
  "👍🏽": 1,
  "👍🏾": 1,
  "👍🏿": 1,
  thumbsup: 1,
  "+1": 1,
  "🔥": 1,
  fire: 1,
  "❤️": 1,
  heart: 1,
  "⭐": 1,
  star: 1,
  "🎉": 1,
  tada: 1,
  "💯": 1,
  "100": 1,

  // Negative
  "👎": -1,
  "👎🏻": -1,
  "👎🏼": -1,
  "👎🏽": -1,
  "👎🏾": -1,
  "👎🏿": -1,
  thumbsdown: -1,
  "-1": -1,
  "❌": -1,
  x: -1,
  "😕": -1,
  confused: -1,
};

/**
 * Resolve the sentiment for a given emoji.
 *
 * @param emoji - Raw emoji string (unicode or Discord custom name)
 * @param overrides - Optional per-agent overrides merged on top of defaults
 * @returns Sentiment score, or 0 for unrecognized emoji
 */
export function resolveReactionSentiment(
  emoji: string,
  overrides?: Record<string, FeedbackSentiment>,
): FeedbackSentiment {
  const cleaned = emoji.replace(/[\uFE0E\uFE0F]/g, "").trim();
  // Check overrides first, then defaults
  if (overrides && cleaned in overrides) {
    return overrides[cleaned];
  }
  if (cleaned in DEFAULT_REACTION_MAP) {
    return DEFAULT_REACTION_MAP[cleaned];
  }
  // Try lowercase name match (Discord custom emoji names)
  const lower = cleaned.toLowerCase();
  if (overrides && lower in overrides) {
    return overrides[lower];
  }
  if (lower in DEFAULT_REACTION_MAP) {
    return DEFAULT_REACTION_MAP[lower];
  }
  return 0;
}
