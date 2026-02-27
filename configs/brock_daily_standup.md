# Daily Standup — Cron Job Prompt

Run a daily standup check-in for the operator during the onboarding/calibration
period (first 30 days). Post to #brock-alerts.

## Instructions

1. Review your session transcripts from the past 24 hours.
2. Check the feedback log at `~/.openclaw/feedback/log.jsonl` for recent reactions.
3. Identify the 2-3 most significant things you worked on.
4. Be brief — this should take 30 seconds to read.

## Standup Format

Post to #brock-alerts using this structure:

---

**DAILY STANDUP — [DATE]**

**Yesterday**
- [Most significant task/output #1]
- [Most significant task/output #2]
- [Task #3 if applicable]

**Today's Focus**
- [What you plan to work on next based on pending tasks/cron jobs]

**Blockers / Questions**
- [Anything you're stuck on or need input on. "None" if clear.]

**Model Usage** (past 24h)
- Primary: [provider/model] — [N] messages
- Reactions: 👍 [N] / 👎 [N]

---

**Quick Grades** *(optional — reply if anything stands out)*

> Yesterday's output quality: ___/5
> Anything I should do differently? ___

---

## Important

- Keep it SHORT. The operator should be able to skim this in under 30 seconds.
- The "Quick Grades" section is lighter than the weekly report — just two fields.
  The operator can skip it if everything looks fine (no reaction = satisfactory).
- If you have no significant work from the past 24h, say so honestly.
- This standup is temporary — it runs for ~30 days during onboarding to calibrate
  expectations and feedback loops. After that, only the weekly report continues.
