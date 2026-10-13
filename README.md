# NIRVAAN Drainage Intelligence

> A civic operations platform for reporting, prioritizing, mapping, and resolving blocked drainage incidents.

NIRVAAN helps residents submit drainage complaints with photo and location evidence while giving operations teams a shared view of incident status, severity, risk, and resolution progress.

## Overview

NIRVAAN combines a Vite-powered React frontend with an Express API and PostgreSQL persistence:

```text
Resident or operator
        │
        ▼
Vercel frontend ────── HTTPS ──────► Render API
                                      │
                                      ▼
                               PostgreSQL database
```

The application is designed for local development and straightforward deployment to Vercel and Render.

## Features

- **Complaint reporting** — Submit a blocked-drain report with photo evidence, location, severity, and description.
- **Complaint tracking** — Find a submitted report by its complaint ID.
- **Incident management** — Review active cases, statuses, priorities, and operational notes.
- **Interactive map** — Plot incident locations using React Leaflet and OpenStreetMap tiles.
- **Risk detection laboratory** — Explore simulated rainfall, blockage, slope, population, and asset-condition scenarios.
- **Analytics dashboard** — Review severity distribution, status summaries, recurring locations, and priority trends.
- **Shared persistence** — Store incidents in PostgreSQL through the backend API instead of browser-only storage.
- **JWT authentication** — Protect operator actions such as incident updates and data deletion.
- **Responsive interface** — Works across desktop and mobile layouts.

## Technology

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Leaflet and Leaflet
- Recharts
- Vitest and Testing Library

### Backend

- Node.js
- Express
- PostgreSQL
- `pg`
- JWT
- `bcryptjs`
- CORS

### Hosting

- Vercel for the frontend
- Render Web Service for the API
- Render PostgreSQL for shared data

## Project structure

```text
.
├── backend/
│   └── src/
│       ├── auth.js          # JWT and password helpers
│       ├── db.js            # PostgreSQL connection pool
│       └── server.js        # Express API
├── db/
│   └── schema.sql           # PostgreSQL schema
├── public/                  # Static public assets
├── src/
│   ├── data/                # Demo incident data
│   ├── lib/                 # Shared frontend utilities
│   ├── services/            # API client and analytics services
│   ├── App.tsx              # Routes and application screens
│   └── main.tsx             # Frontend entry point
├── render.yaml              # Render service configuration
├── vercel.json              # SPA route rewrites for Vercel
└── vite.config.ts           # Vite development configuration
```

## Local development

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Configure PostgreSQL

Create a local database, then apply the schema:

```bash
createdb nirvaan
psql postgresql://postgres:postgres@localhost:5432/nirvaan -f db/schema.sql
```

Copy the backend environment template:

```bash
copy backend\.env.example backend\.env
```

Update `backend/.env` with your database credentials and a secure JWT secret:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nirvaan
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5180
```

### 3. Start the API

```bash
cd backend
npm install
npm run dev
```

The API is available at `http://localhost:4000`.

Check its health:

```text
http://localhost:4000/health
```

### 4. Configure and start the frontend

From the project root, copy `.env.example` to `.env` if the API is not using its default URL:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

The Vite server runs at:

```text
http://localhost:5180
```

On Windows, you can also double-click [`run.bat`](./run.bat). It detects an existing server and selects an available port when necessary.

## Commands

Run these commands from the project root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production frontend |
| `npm run lint` | Run Oxlint |
| `npm test -- --run` | Run the frontend test suite |

Run these commands from `backend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Node watch mode |
| `npm start` | Start the API in production mode |

## API endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Check API and database health |
| `POST` | `/api/auth/register` | Public | Create an operator account |
| `POST` | `/api/auth/login` | Public | Obtain a JWT |
| `GET` | `/api/incidents` | Public | List incidents |
| `GET` | `/api/incidents/:complaintId` | Public | Track a complaint |
| `POST` | `/api/incidents` | Public | Submit or upsert an incident |
| `PATCH` | `/api/incidents/:id` | JWT | Update an incident |
| `DELETE` | `/api/incidents` | JWT | Clear incident records |

## Deploy to Vercel and Render

### Render

1. Create a Render PostgreSQL database.
2. Run [`db/schema.sql`](./db/schema.sql) against the database.
3. Create a Render Web Service from the repository.
4. Set the service root directory to `backend`.
5. Use `npm install` as the build command.
6. Use `npm start` as the start command.
7. Configure these environment variables:

   ```env
   DATABASE_URL=<Render PostgreSQL connection string>
   JWT_SECRET=<long random secret>
   NODE_ENV=production
   CORS_ORIGINS=https://<your-vercel-domain>
   ```

The included [`render.yaml`](./render.yaml) provides the service configuration.

### Vercel

1. Import the repository into Vercel.
2. Use the default Vite build settings.
3. Set the environment variable:

   ```env
   VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
   ```

4. Deploy the project.

The included [`vercel.json`](./vercel.json) rewrites client-side routes such as `/map`, `/track`, and `/incidents` to the SPA entry point.

## Data and security notes

- Never commit `.env` files or production secrets.
- Use a long, randomly generated `JWT_SECRET` in production.
- Restrict `CORS_ORIGINS` to the deployed frontend domain.
- Photo data is currently carried in the incident payload. Production deployments should move large image files to object storage and store only their URLs in PostgreSQL.
- Public complaint lookup should be extended with rate limiting and privacy controls before handling real citizen data.
- Render free services may sleep when inactive, which can make the first request slower.

## Current scope

NIRVAAN is a working civic operations prototype. The core frontend, API, PostgreSQL schema, authentication helpers, interactive map, and Vercel/Render deployment configuration are included. Additional production hardening—role-based permissions, object storage, rate limiting, audit logs, and automated deployment checks—can be added as the platform moves beyond demonstration use.

## License

This project is currently maintained as an application prototype. Add the project's chosen license before distributing it publicly.
