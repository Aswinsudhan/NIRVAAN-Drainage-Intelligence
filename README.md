# NIRVAAN Drainage Intelligence

NIRVAAN is a local-first civic operations prototype for reporting, tracking, and prioritizing blocked drainage issues. The application runs entirely in the browser, stores incident records in IndexedDB, and uses demo/local data to simulate city operations without requiring a cloud backend or external paid APIs.

## What the app includes

- Complaint reporting form with photo upload, location metadata, and issue details
- Local complaint tracking by complaint ID
- Incident management list with status and severity summaries
- Map-oriented overview for hotspot review and location clustering
- Detection laboratory with simulated drain-risk conditions
- Analytics summaries for backlog, severity trends, and repeated hotspots
- Browser-local data persistence and demo seeding for prototype environments

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Leaflet / React Leaflet
- Recharts
- IndexedDB via idb
- Vitest + Testing Library

## Local development

Prerequisites:

- Node.js 18 or newer
- npm

Install dependencies:

```bash
npm install
```

Run the app in development mode:

```bash
npm run dev
```

The development server is configured to run at `http://localhost:5180/`.

The frontend now expects the API at `http://localhost:4000/api`. Start PostgreSQL, apply
`db/schema.sql`, copy `backend/.env.example` to `backend/.env`, and start the API in a
second terminal:

```bash
cd backend
npm install
npm run dev
```

Copy `.env.example` to `.env` in the project root if the API uses a different URL.

Build the production bundle:

```bash
npm run build
```

Run the test suite:

```bash
npm test -- --run
```

## Notes

- This project is intentionally a local demo and uses sample civic data.
- Public complaint tracking avoids exposing private contact details.
- Incident records are stored in PostgreSQL through the Express API. Browser IndexedDB is no longer the source of truth.

## Vercel and Render deployment

1. Create a PostgreSQL database on Render and run `db/schema.sql` against it.
2. Deploy the `backend` directory as a Render Web Service using `npm install` and `npm start`.
3. Set `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, and `CORS_ORIGINS` on Render.
4. Deploy the repository as a Vercel Vite project.
5. Set `VITE_API_BASE_URL` in Vercel to the Render API URL ending in `/api`.
6. `vercel.json` rewrites client-side routes such as `/map` and `/incidents` to the SPA entry point.

The API exposes `/health`, JWT registration/login endpoints, public incident submission and
tracking, and authenticated incident updates/deletion. Use a long random `JWT_SECRET` and
restrict `CORS_ORIGINS` to the actual Vercel domain in production.
"# NIRVAAN-Drainage-Intelligence" 
