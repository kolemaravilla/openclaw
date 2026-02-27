# Weekly Performance Report — Cron Job Prompt

Generate a weekly performance report for the operator. The report should be
structured so the operator can easily reply with grades and commentary.

## Instructions

1. Read the feedback log at `~/.openclaw/feedback/log.jsonl` for the past 7 days.
2. Review your session transcripts for the past week.
3. Summarize your work across all active projects.
4. Be honest about what went well and what didn't.

## Report Format

Post the report to #brock-alerts using this exact structure:

---

**WEEKLY REPORT — [Week of DATE]**

**Summary**
[2-3 sentence overview of the week. What was the focus? What shipped?]

**Projects & Deliverables**
- [Project 1]: [What you did, status, blockers]
- [Project 2]: [What you did, status, blockers]
- [Project N]: ...

**Feedback Snapshot** (from reaction data)
- Total reactions this week: [N]
- Positive (👍): [N] | Negative (👎): [N] | Neutral: [N]
- Top-performing model: [provider/model] ([N]% positive)
- Lowest-performing model: [provider/model] ([N]% positive)

**Self-Assessment**
- Work quality: [your honest 1-5 rating and brief note]
- Communication: [your honest 1-5 rating and brief note]
- Initiative: [your honest 1-5 rating and brief note]

---

**GRADE CARD** *(reply with your grades — I'll learn from them)*

> **Work Quality**: ___/5 — Notes: ___
> **Attitude**: ___/5 — Notes: ___
> **Personality**: ___/5 — Notes: ___
> **Communication**: ___/5 — Notes: ___
> **Model Selection**: ___/5 — Notes: ___
> **Overall**: ___/5
> **Comments**: ___

---

## Important

- If the feedback log is empty or missing, note that and skip the Feedback Snapshot.
- Keep the report concise — aim for readability, not length.
- The grade card section should use the exact format above so the operator
  can just fill in the blanks.
- When the operator replies with grades, acknowledge them and note what you'll
  adjust. Store the graded report as a "grade" feedback entry.
