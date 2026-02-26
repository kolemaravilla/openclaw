# Runbook: Nuvoka Database Access

## Overview

Step-by-step procedures for Brock to read from and write to the Nuvoka Supabase project. All access is governed by `configs/nuvoka_access.json` and `configs/tool_permissions.json`.

**Read path:** PostgREST via `NUVOKA_SUPABASE_URL` (anon key, GET only)
**Write path:** Edge function via `NUVOKA_FUNCTION_URL` (agent API key, POST only)
**Never:** Direct POST/PATCH/DELETE to PostgREST

---

## Prerequisites

Verify these env vars are set before any Nuvoka DB operation:

```
NUVOKA_SUPABASE_URL       — Nuvoka project URL (e.g. https://xxxx.supabase.co)
NUVOKA_SUPABASE_ANON_KEY  — read-only anon key
NUVOKA_AGENT_API_KEY      — auth key for the staging edge function
NUVOKA_FUNCTION_URL       — staging edge function endpoint
```

If any are missing, stop and ask the user. Do not guess or hardcode values.

---

## Reading Data

### Basic query

```
GET ${NUVOKA_SUPABASE_URL}/rest/v1/{table}?select={columns}&limit={n}
Headers:
  apikey: ${NUVOKA_SUPABASE_ANON_KEY}
  Accept: application/json
```

### Rules

1. **Always include `?select=`** — never pull `SELECT *`. Specify the columns you need.
2. **Always include `&limit=`** — default to 100, max 500.
3. **Use filters** — PostgREST supports `eq`, `gt`, `lt`, `like`, `in`, `is`, `order`, etc. Use them.
4. **Pagination** — use `&offset=` for pagination beyond the first page. Or use `Range` header.
5. **Count** — add `&select=count` with `Prefer: count=exact` header to get row counts without fetching data.

### Examples

Fetch recent content items:
```
GET /rest/v1/content_items?select=id,title,status,created_at&order=created_at.desc&limit=20
```

Get a specific record by ID:
```
GET /rest/v1/content_items?select=*&id=eq.{uuid}&limit=1
```

Count rows in a table:
```
GET /rest/v1/content_items?select=count
Prefer: count=exact
```

Filter by status:
```
GET /rest/v1/content_items?select=id,title&status=eq.draft&limit=50
```

### Error handling

- **401:** Anon key is wrong or expired. Ask the user to check `NUVOKA_SUPABASE_ANON_KEY`.
- **404:** Table doesn't exist or isn't exposed via PostgREST. Check the Supabase schema.
- **400:** Malformed query. Check PostgREST syntax — it's not SQL.
- **Timeout:** If a query takes > 10s, the table may be large. Add stricter filters or reduce the limit.

---

## Writing Data

### Endpoint

```
POST ${NUVOKA_FUNCTION_URL}
Headers:
  Authorization: Bearer ${NUVOKA_AGENT_API_KEY}
  Content-Type: application/json
```

### Request body

The edge function accepts a standard payload (exact schema depends on the function implementation). Typical pattern:

```json
{
  "action": "insert" | "update" | "upsert" | "delete",
  "table": "table_name",
  "data": { ... },
  "match": { "id": "uuid" }
}
```

### Rules

1. **All writes go through the edge function.** Never POST/PATCH/DELETE to PostgREST directly.
2. **Pre-authorized.** No per-request operator approval needed — the server-side blocklist governs which tables accept writes.
3. **If the function returns 403**, the table is on the server-side blocklist. Do not retry. Report the blocked table to the user.
4. **If the function returns 400**, the payload is malformed. Check the expected schema.
5. **If the function returns 500**, something is wrong server-side. Log the error and ask the user.

### Examples

Insert a content item:
```json
POST ${NUVOKA_FUNCTION_URL}
{
  "action": "insert",
  "table": "content_items",
  "data": {
    "title": "New article draft",
    "status": "draft",
    "body": "..."
  }
}
```

Update a record:
```json
POST ${NUVOKA_FUNCTION_URL}
{
  "action": "update",
  "table": "content_items",
  "match": { "id": "uuid-here" },
  "data": {
    "status": "published"
  }
}
```

---

## Schema Discovery

Before writing queries, understand the schema:

1. **List tables:** `GET /rest/v1/` returns available tables/views.
2. **Inspect columns:** Query with `?select=*&limit=0` plus `Prefer: count=exact` to see column names from the response headers without fetching data.
3. **Use the db_advisor skill** for deeper analysis — schema relationships, index coverage, RLS policies. This requires `model.strong` (see `configs/nuvoka_access.json`).

---

## Model Routing

Per `configs/nuvoka_access.json`:

| Task | Model tier | Fallback allowed? |
|------|-----------|-------------------|
| Schema analysis | `model.strong` | No — fail loudly |
| Migration proposals | `model.strong` | No |
| Index optimization | `model.strong` | No |
| RLS policy review | `model.strong` | No |
| Simple reads for briefings | `model.fast` | Yes (can escalate) |
| Content pipeline queries | `model.fast` | Yes |
| Row counts / status checks | `model.fast` | Yes |

---

## Git Access

Brock has clone/read/write access to `Iron-Lion-International/nuvoka`.

- **Feature branches only.** Never push to main/master.
- **PRs authorized.** Use `git.pull_request` tool for both nuvoka and openclaw repos.
- **Clone as needed** for schema analysis, migration review, etc.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| 401 on reads | Bad anon key | Check `NUVOKA_SUPABASE_ANON_KEY` |
| 401 on writes | Bad agent API key | Check `NUVOKA_AGENT_API_KEY` |
| 403 on writes | Table is blocklisted | Don't retry. Tell the user. |
| Empty results | RLS policy filtering | The anon role may not have access. Check Supabase RLS. |
| Timeout on reads | Large table, no filters | Add filters, reduce limit |
| 404 on table | Not exposed via PostgREST | Check if the table is in the `public` schema and API-exposed |
