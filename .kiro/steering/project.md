# NIRVAAN Drainage Intelligence — Project Steering

## What This Project Is

NIRVAAN is a civic operations platform for reporting, triaging, mapping, and resolving blocked drainage incidents. It is built as a full-stack prototype:

- **Frontend** — React 19 + TypeScript + Vite + Tailwind CSS, deployed to Vercel
- **Backend** — Node.js + Express 5 + PostgreSQL, deployed to Render
- **Auth** — JWT issued by the API; required for operator mutations

## Repository Layout

```
src/                  React frontend source
  App.tsx             Routes and screen components
  types.ts            Shared TypeScript types
  services/           API client (storage.ts) and analytics (analytics.ts)
  data/               Demo incident seed data (demoData.ts)
  lib/                Shared utilities (utils.ts)
backend/src/          Express API source
  server.js           All API routes and middleware
  auth.js             JWT and bcrypt helpers
  db.js               PostgreSQL connection pool
db/schema.sql         PostgreSQL DDL (run once to initialise)
public/               Static assets served by Vite
```

## Tech Stack Quick Reference

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Language | TypeScript ~6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 7 |
| Maps | React Leaflet / Leaflet 1.9 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| IndexedDB | idb 8 |
| Linter | Oxlint |
| Tests | Vitest 5 + Testing Library |
| API | Express 5 (ESM) |
| DB client | pg 8 |
| Auth | jsonwebtoken + bcryptjs |

## Coding Standards

- All frontend code is TypeScript; avoid `any` except where absolutely necessary.
- Components live in `src/`; keep files focused — one screen or feature cluster per file.
- Use Tailwind utility classes for all styling; do not add plain CSS unless modifying `src/index.css` or `src/App.css` for global resets.
- Backend files (`backend/src/`) are plain JavaScript ESM (`"type": "module"`).
- Use `async/await` throughout; avoid raw `.then()` chains.
- All Express route handlers must send an appropriate HTTP status code and a JSON body with at least a `message` or `error` field on failure.
- Never commit `.env` files. Reference secrets by env var name only.

## Environment Variables

### Frontend (`.env` at repo root)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:4000/api` |

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (default 4000) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `CORS_ORIGINS` | Comma-separated allowed origins |

## Development Commands

Run from the **repo root**:

```bash
npm run dev       # Start Vite dev server (http://localhost:5180)
npm run build     # TypeScript check + production build
npm run lint      # Oxlint
npm test          # Vitest (single run)
```

Run from **`backend/`**:

```bash
npm run dev       # Node --watch (http://localhost:4000)
npm start         # Production start
```

## API Surface

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | Public | DB connectivity check |
| POST | `/api/auth/register` | Public | Create operator account |
| POST | `/api/auth/login` | Public | Returns JWT |
| GET | `/api/incidents` | Public | List all incidents |
| GET | `/api/incidents/:complaintId` | Public | Lookup by complaint ID |
| POST | `/api/incidents` | Public | Submit / upsert incident |
| PATCH | `/api/incidents/:id` | JWT | Update status, notes, priority |
| DELETE | `/api/incidents` | JWT | Bulk clear |

## Key Conventions

- Incident IDs are generated on the frontend as complaint IDs (alphanumeric strings).
- Severity levels: `low`, `medium`, `high`, `critical`.
- Status values: `pending`, `in-progress`, `resolved`.
- Photo data is base64-encoded in the incident payload (prototype only — move to object storage for production).
- The `storage.ts` service abstracts all API calls; components should not call `fetch` directly.
- The `analytics.ts` service derives statistics from incident arrays; it is pure and testable.

## What to Watch Out For

- Render free-tier services sleep after inactivity — the first API request after sleep will be slow.
- `react-leaflet` v5 requires `react` 19; keep these versions in sync.
- Vite is configured to proxy `/api` to `http://localhost:4000` in development (check `vite.config.ts`).
- The `overrides` block in `package.json` pins `postcss-selector-parser` to resolve a peer dependency conflict — do not remove it.
