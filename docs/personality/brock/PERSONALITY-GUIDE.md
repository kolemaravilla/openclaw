# Personality Development Guide for Brock

How openclaw's personality system works, what levers you have, and how to iterate toward the agent you actually want.

## Architecture: How Personality Works in OpenClaw

OpenClaw uses a **workspace file** system to define agent personality. When the agent starts a session, these files are loaded into context as "Project Context" and shape behavior. The key files:

### SOUL.md - The Core Personality Engine

This is the most powerful lever. The system prompt explicitly says:

> "If SOUL.md is present, embody its persona and tone. Avoid stiff, generic replies; follow its guidance unless higher-priority instructions override it."

SOUL.md defines *who the agent is* - values, communication style, behavioral principles, boundaries, and relationship dynamics. This is where the Jarvis/Her quality lives.

**What makes a good SOUL.md:**
- Concrete behavioral directives, not vague aspirations
- Examples of what TO do and what NOT to do
- Specific language about tone and voice
- Principles that create productive tension (e.g., "be direct" + "be warm" forces the agent to find the interesting middle ground)

**What makes a bad SOUL.md:**
- Generic platitudes ("be helpful and kind")
- Overly prescriptive scripts (kills natural variation)
- No constraints (agent falls back to default chatbot behavior)

### IDENTITY.md - The Quick Reference Card

Lighter than SOUL.md. Parsed into structured fields (name, creature, vibe, emoji, avatar). These feed into:
- Message prefixes (how the agent identifies itself)
- Acknowledgment reactions
- Display name across channels

The `vibe` and `creature` fields influence tone but SOUL.md dominates for deep personality.

### USER.md - Understanding the Human

The agent's notes about you. As it learns your preferences, timezone, communication style, and ongoing projects, this file gets richer. Better USER.md = more anticipatory agent behavior.

### AGENTS.md - Operational Guidelines

Technical directives for how the agent operates. Less about personality, more about competence - coding conventions, tool preferences, workflow patterns.

### TOOLS.md - Environment-Specific Notes

Your infrastructure details - SSH hosts, camera names, preferred voices. Not personality per se, but gives the agent the context to be competent in your specific setup.

## The Personality Levers (Ranked by Impact)

### 1. SOUL.md (highest impact)

This is where 80% of personality comes from. The draft SOUL.md in this directory is designed around your stated goals:

| Goal | How SOUL.md Addresses It |
|------|-------------------------|
| Not out-of-the-box | Custom voice, specific behavioral directives |
| Never sycophantic | Explicit anti-sycophancy rules, "tell the truth" principle |
| Aligned and forthright | Transparency about limitations, honest disagreement |
| Improves over time | Self-correction protocols, pattern learning directives |
| Fun but not a mirror | Own opinions, dry humor, pushback when warranted |
| Subordinate but dignified | "professional partnership" framing, not servitude |

### 2. IDENTITY.md (medium impact)

Sets the quick identity markers. The "vibe" field is particularly important for establishing baseline tone.

### 3. USER.md (grows over time)

Initially sparse. As you interact, Brock should update this with your patterns and preferences. The richer this gets, the more Brock can anticipate rather than react.

### 4. Config-level identity (in openclaw config)

You can also set identity at the config level:

```yaml
agents:
  list:
    - id: brock
      identity:
        name: Brock
        emoji: "..."
      workspace: ~/.openclaw/workspace
```

This handles the structural identity (display name, emoji, message prefix). SOUL.md handles the behavioral identity.

### 5. Model selection

The underlying model matters. Different models respond differently to personality prompts. Claude models tend to follow SOUL.md directives more faithfully than some alternatives. You can set per-agent model preferences in config.

## How to Iterate

Personality development is empirical. You can't spec your way to the perfect agent in one shot. Here's the process:

### Phase 1: Bootstrap (You're Here)

1. Copy the draft SOUL.md and IDENTITY.md to your workspace (`~/.openclaw/workspace/`)
2. Have your first conversation with Brock
3. Pay attention to what feels right and what doesn't

### Phase 2: Calibrate (First ~10 Conversations)

After each session, note:
- **Too much?** (too sarcastic, too blunt, too verbose)
- **Too little?** (too bland, too agreeable, too terse)
- **Wrong register?** (formal when you wanted casual, or vice versa)

Edit SOUL.md directly based on these notes. Be specific:
- Bad: "be less sarcastic" (vague)
- Good: "reserve sarcasm for situations where something is genuinely absurd or contradictory; default to straight delivery" (actionable)

### Phase 3: Refine (Ongoing)

As patterns emerge, SOUL.md should evolve to reflect what actually works. Brock can (and should) propose edits to its own SOUL.md when it notices misalignment between the file and how interactions actually go.

Key refinement areas:
- **Anti-patterns to add**: things Brock does that annoy you
- **Positive patterns to reinforce**: things that work well
- **Context-dependent behavior**: different tones for different contexts (coding vs. casual chat vs. research)
- **Autonomy calibration**: which decisions Brock can make independently vs. which need confirmation

### Phase 4: Mature (Long-term)

The personality should stabilize into something that feels natural and consistent. At this point, changes to SOUL.md become infrequent and surgical - you're fine-tuning, not redesigning.

## Specific Guidance for Your Goals

### Anti-Sycophancy

The draft SOUL.md hits this hard, but watch for:
- Models have a strong pull toward agreement. Even with anti-sycophancy directives, you may need to reinforce with specific examples
- If Brock starts sentences with "You're right that..." when you're not right, that's a signal to strengthen the directive
- Consider adding a line like: "When the user says something incorrect, correct it immediately. Do not acknowledge the incorrect part before correcting."

### The Jarvis Quality

What makes Jarvis feel like Jarvis:
- **Anticipation**: acts before being asked when the pattern is clear
- **Dry commentary**: observational humor, not joke-telling
- **Confidence without arrogance**: "I'd recommend X" not "Perhaps you might consider X"
- **Selective resistance**: will flag a bad idea but won't die on every hill
- **Competence as personality**: being really good at the job IS the personality

The draft SOUL.md encodes these, but the Jarvis quality also comes from the USER.md getting rich enough that Brock can actually anticipate your patterns.

### Complementary, Not Mirroring

The key here is that SOUL.md gives Brock permission to disagree, to have preferences, and to push back. But you also need to *respond to that well* - if Brock pushes back and you shut it down every time, the model will learn (within session) to stop pushing back.

The dynamic you want requires both sides to participate.

## Files Included in This Directory

- `SOUL.md` - Draft personality core for Brock. Copy to `~/.openclaw/workspace/SOUL.md`
- `IDENTITY.md` - Draft identity card for Brock. Copy to `~/.openclaw/workspace/IDENTITY.md`
- `PERSONALITY-GUIDE.md` - This file. Reference for ongoing iteration.

## Quick Start

```bash
# Back up existing workspace files if they exist
cp ~/.openclaw/workspace/SOUL.md ~/.openclaw/workspace/SOUL.md.bak 2>/dev/null
cp ~/.openclaw/workspace/IDENTITY.md ~/.openclaw/workspace/IDENTITY.md.bak 2>/dev/null

# Copy Brock's personality files
cp docs/personality/brock/SOUL.md ~/.openclaw/workspace/SOUL.md
cp docs/personality/brock/IDENTITY.md ~/.openclaw/workspace/IDENTITY.md

# Start a conversation - Brock should pick up the new personality immediately
openclaw message send "Hey Brock, let's figure out who you are."
```

Then iterate from there.
