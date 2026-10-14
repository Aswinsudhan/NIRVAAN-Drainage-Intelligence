---
inclusion: fileMatch
fileMatchPattern: "db/**"
---

# Database Steering

These rules apply whenever you are working on files inside `db/`.

## Schema Conventions

- All DDL lives in `db/schema.sql`. This file is run once to initialise a fresh database (`psql … -f db/schema.sql`).
- Use `CREATE TABLE IF NOT EXISTS` so the script is safely re-runnable in development.
- Primary keys use `SERIAL` or `BIGSERIAL` for auto-increment integer IDs.
- Every table must have `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Use `TEXT` for variable-length strings; use `VARCHAR(n)` only when there is a hard business constraint on length.
- Store severity as a `TEXT` column with a `CHECK` constraint: `CHECK (severity IN ('low', 'medium', 'high', 'critical'))`.
- Store status as a `TEXT` column with a `CHECK` constraint: `CHECK (status IN ('pending', 'in-progress', 'resolved'))`.
- The complaint ID (generated on the frontend) is stored as `TEXT` and should have a `UNIQUE` constraint.

## Migrations

- There is no migration tool yet. For schema changes during development, add `ALTER TABLE` statements at the bottom of `schema.sql` with a comment indicating the change and date.
- In production, apply changes manually via `psql` against the Render PostgreSQL instance.

## Indexes

- Add a `CREATE INDEX IF NOT EXISTS` for any column used in a `WHERE` clause on a large table (e.g. `complaint_id`, `status`, `severity`, `created_at`).

## Secrets

- The `DATABASE_URL` connection string must never appear in any committed file. Reference it only via the `DATABASE_URL` environment variable.
