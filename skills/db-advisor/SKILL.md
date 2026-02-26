---
name: db-advisor
description: "Schema analysis and database advisory for Nuvoka's Supabase project. Use when: (1) analyzing table structure, relationships, or indexes, (2) proposing migrations or schema changes, (3) reviewing RLS policies, (4) optimizing queries or recommending indexes, (5) designing new tables for content pipeline features. MANDATORY: model.strong only — never fall back to fast models for this skill."
metadata:
  {
    "openclaw":
      {
        "emoji": "🗄️",
        "requires":
          {
            "env":
              [
                "NUVOKA_SUPABASE_URL",
                "NUVOKA_SUPABASE_ANON_KEY",
              ],
            "configs": ["configs/nuvoka_access.json"],
          },
      },
  }
allowed-tools: ["http.get", "git.clone", "git.read"]
---

# DB Advisor — Nuvoka Schema Analysis

Provides schema analysis, migration proposals, and database advisory for the Nuvoka Supabase project. This skill runs at `model.strong` — it requires serious reasoning and must never fall back to a fast model.

## When to Use

- User asks about the Nuvoka database schema, tables, or relationships
- Proposing a new table or column for content pipeline features
- Reviewing or designing RLS (Row-Level Security) policies
- Query optimization — suggesting indexes, fixing slow queries
- Migration planning — adding/altering/dropping schema objects
- Pre-flight check before applying a migration

## Model Requirement

**`model.strong` — mandatory, no fallback.**

Schema analysis and migration proposals have high consequences. A bad migration can break the production database. Fast models may miss edge cases, foreign key implications, or RLS gaps. If `model.strong` is unavailable, fail explicitly rather than falling back.

## Access

Read access via PostgREST (see `runbooks/nuvoka_db.md` for details):
- `GET ${NUVOKA_SUPABASE_URL}/rest/v1/` — list tables
- `GET ${NUVOKA_SUPABASE_URL}/rest/v1/{table}?select=...&limit=0` — inspect columns
- Git clone of `Iron-Lion-International/nuvoka` for migration files and schema definitions

No write access from this skill. All proposed changes are output as SQL migration files or recommendations — the user applies them.

## Procedures

### 1. Schema Overview

When asked to analyze the schema:

1. List all tables: `GET /rest/v1/`
2. For each relevant table, inspect columns: `GET /rest/v1/{table}?select=*&limit=0`
3. Clone or read the nuvoka repo for migration history: `supabase/migrations/` directory
4. Produce a summary:
   - Table names with purpose
   - Key relationships (foreign keys, join tables)
   - Index coverage (from migration files)
   - RLS policy summary (from migration files)
   - Notable patterns or concerns

### 2. Migration Proposal

When proposing schema changes:

1. Analyze the current schema (procedure 1)
2. Understand the requirement from the user
3. Produce a migration file in standard Supabase format:

```sql
-- Migration: descriptive_name
-- Description: What this migration does and why
-- Risk: low/medium/high
-- Reversible: yes/no (include down migration if yes)

-- Up
ALTER TABLE ...;
CREATE INDEX ...;

-- Down (if reversible)
DROP INDEX ...;
ALTER TABLE ...;
```

4. Include:
   - Impact analysis — what existing queries/views/functions might break
   - RLS implications — does the new structure need new policies?
   - Index recommendations — what queries will hit this table and do they need coverage?
   - Data migration — if existing rows need transformation, script it

### 3. RLS Policy Review

When reviewing Row-Level Security:

1. Read existing policies from migration files
2. Map policies to roles (anon, authenticated, service_role)
3. Identify gaps:
   - Tables without RLS enabled
   - Overly permissive policies (e.g., `true` for anon)
   - Missing policies for new tables
4. Propose fixes as migration SQL

### 4. Query Optimization

When asked to optimize a query or suggest indexes:

1. Understand the query pattern (what columns are filtered, joined, ordered)
2. Check existing indexes from migration files
3. Run sample queries via PostgREST to confirm behavior
4. Recommend:
   - New indexes with rationale
   - Query rewrites if the PostgREST approach is suboptimal
   - Composite indexes for multi-column filters
   - Partial indexes for common filter predicates

## Output Format

Always output recommendations in a structured format:

```markdown
## Analysis: [topic]

### Current State
[What exists now]

### Recommendation
[What should change]

### Migration SQL
[Exact SQL, ready to apply]

### Risk Assessment
- **Impact:** [what could break]
- **Reversibility:** [can this be undone?]
- **Data loss risk:** [none/low/medium/high]

### Next Steps
[What the user needs to do]
```

## Rules

1. **Never apply migrations directly.** Output SQL for the user to review and apply.
2. **Always check migration history** before proposing changes — don't duplicate existing migrations.
3. **Always consider RLS** when adding new tables or columns.
4. **Prefer additive changes** over destructive ones — add columns before dropping old ones.
5. **Include down migrations** for anything that's reasonably reversible.
6. **Flag irreversible changes** explicitly — dropping columns, changing types with data loss, etc.
