# Database Migrations

Schema changes are tracked here as numbered SQL files. Applied manually via the Supabase SQL Editor.

## How to apply a new migration

1. Write the SQL in a new file: `migrations/NNN_description.sql`
2. Add the date as a comment at the top
3. Run it in **Supabase Dashboard → SQL Editor**
4. Commit the file to git

## Current state

| # | File | Status |
|---|------|--------|
| 001 | `001_initial_schema.sql` | Applied (initial setup) |
| 002 | `002_prompt_metrics.sql` | Applied 2026-03-23 |
| 003 | `003_device_tokens.sql` | Applied 2026-03-23 |

## Rules

- **Never DROP TABLE or DELETE FROM without WHERE in production**
- **Always test SQL in the Supabase SQL editor first**
- **Schema changes go in migrations/ first, then applied manually**
- Number files sequentially (004, 005, etc.)
