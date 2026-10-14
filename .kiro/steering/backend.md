---
inclusion: fileMatch
fileMatchPattern: "backend/**"
---

# Backend Steering

These rules apply whenever you are working on files inside `backend/`.

## Runtime and Module System

- Node.js 18+ required.
- The package uses `"type": "module"` — all imports must use ESM syntax (`import`/`export`). CommonJS `require()` is not allowed.
- File extensions must be included in relative imports (e.g. `import { pool } from './db.js'`).

## Express Conventions

- Express 5 is used. Route handlers automatically propagate thrown errors to the error-handling middleware — no need to manually call `next(err)` in async handlers.
- Every route that can fail must return a JSON body with at least an `error` or `message` key, and an appropriate HTTP status code.
- Use `express.json()` middleware for all routes that accept a request body.

## Database

- All DB access goes through the pool exported from `db.js`. Do not create additional pools or direct `pg.Client` instances.
- Use parameterised queries (`$1`, `$2`, …) — never interpolate user input into SQL strings.
- Wrap multi-step operations in a transaction using `pool.connect()` → `BEGIN` / `COMMIT` / `ROLLBACK`.

## Authentication

- `auth.js` exports `hashPassword`, `comparePassword`, and `signToken` / `verifyToken` helpers.
- Protected routes must call `verifyToken` and reject with `401` if the token is missing or invalid.
- Never log or return the raw JWT secret or hashed passwords.

## Environment Variables

Load via `dotenv/config` at the top of `server.js`. All required vars (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGINS`) must be present at startup — crash loudly if any are missing in production.

## Error Handling

- Place a global error handler after all routes: `app.use((err, req, res, next) => { … })`.
- In development, include the stack trace in the response. In production, return only a generic message.
