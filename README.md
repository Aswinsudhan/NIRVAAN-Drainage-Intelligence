# NIRVAAN Drainage Intelligence

NIRVAAN is a Vite/React frontend with an Express API. Production storage uses Cloudflare D1; the API is hosted on Render and the frontend is hosted on Vercel.

## Architecture

```text
Vercel React frontend
        |
        | HTTPS / CORS
        v
Render Express API
        |
        | Cloudflare REST API
        v
Cloudflare D1 SQLite database
```

## Prerequisites

- Node.js 18 or newer
- npm
- A Cloudflare account
- A Render account
- A Vercel account

## 1. Create the Cloudflare D1 database

From the Cloudflare dashboard:

1. Open **Workers & Pages**.
2. Open **D1**.
3. Create a database, for example `nirvaan-prod`.
4. Open the database and select **Console**.
5. Run the complete contents of [`db/schema.sql`](./db/schema.sql).

Record these values:

- Cloudflare Account ID: visible in the account dashboard URL or account overview
- D1 Database ID: visible on the D1 database details page

## 2. Create a Cloudflare API token

In **Cloudflare Dashboard -> Profile -> API Tokens**, create a custom token with:

- `Account` -> `D1` -> `Edit`
- `Account Resources`: include the account containing the D1 database

Create the token and store it securely. It should only be used as `CLOUDFLARE_API_TOKEN` on Render and never in Vite/frontend variables.

## 3. Configure the backend locally

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set [`backend/.env.example`](./backend/.env.example) values in `backend/.env`:

```env
PORT=4000
NODE_ENV=development
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_D1_DATABASE_ID=your-d1-database-id
CLOUDFLARE_API_TOKEN=your-d1-api-token
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5180
```

Generate a JWT secret with PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Health check:

```text
http://localhost:4000/health
```

## 4. Deploy the backend to Render

Push the repository to GitHub, then create a Render **Web Service**:

| Setting | Value |
|---|---|
| Repository | Your NIRVAAN repository |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Alternatively, use the included [`render.yaml`](./render.yaml) with Render Blueprint deployment.

Configure these environment variables on Render:

```env
CLOUDFLARE_ACCOUNT_ID=<Cloudflare Account ID>
CLOUDFLARE_D1_DATABASE_ID=<D1 Database ID>
CLOUDFLARE_API_TOKEN=<Cloudflare API token>
JWT_SECRET=<long random secret>
NODE_ENV=production
CORS_ORIGINS=https://<your-vercel-project>.vercel.app
```

After deployment, verify:

```text
https://<your-render-service>.onrender.com/health
```

Do not set `CORS_ORIGINS=*`. Add custom domains and preview domains explicitly as comma-separated origins if required.

## 5. Deploy the frontend to Vercel

Import the GitHub repository into Vercel.

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | Repository root |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Set this Vercel environment variable for Production and Preview:

```env
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
```

Redeploy after changing the variable. Vite exposes variables beginning with `VITE_` to browser code, so only public API URLs belong in this variable.

The included [`vercel.json`](./vercel.json) keeps client-side routes such as `/map`, `/track`, and `/incidents` working.

## 6. Final DNS/CORS configuration

Use the deployed Vercel domain in Render's `CORS_ORIGINS`, for example:

```env
CORS_ORIGINS=https://nirvaan.vercel.app,https://nirvaan.example.com
```

Redeploy/restart the Render service after changing CORS or Cloudflare values.

## Local frontend development

From the repository root:

```bash
copy .env.example .env
npm install
npm run dev
```

The default frontend URL is `http://localhost:5180`.

## Commands

Frontend:

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite |
| `npm run build` | Type-check and build |
| `npm run lint` | Run Oxlint |
| `npm test -- --run` | Run Vitest |

Backend:

| Command | Purpose |
|---|---|
| `npm run dev` | Start Express with watch mode |
| `npm start` | Start Express |

## API endpoints

| Method | Endpoint | Authentication |
|---|---|---|
| `GET` | `/health` | Public |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/incidents` | Public |
| `GET` | `/api/incidents/:complaintId` | Public |
| `POST` | `/api/incidents` | Public |
| `PATCH` | `/api/incidents/:id` | JWT |
| `DELETE` | `/api/incidents` | JWT |

## Database maintenance

Initialize or update the D1 schema in the Cloudflare D1 Console:

```sql
-- Run db/schema.sql
```

For the Wrangler CLI, the equivalent steps are:

```bash
npx wrangler d1 create nirvaan-prod
npx wrangler d1 execute nirvaan-prod --file=./db/schema.sql
npx wrangler d1 execute nirvaan-prod --command="SELECT * FROM incidents"
```

Use the database ID produced by `wrangler d1 create` for `CLOUDFLARE_D1_DATABASE_ID`.

## Security notes

- Never commit `backend/.env`, API tokens, or JWT secrets.
- Keep Cloudflare credentials server-side on Render only.
- Restrict CORS to deployed frontend origins.
- Use a strong random JWT secret and rotate it if exposed.
- The API token should have D1 edit access only for the intended account/database.
- Render free instances may sleep and cause a delayed first request.
- Incident photos are included in the payload and should be moved to Cloudflare R2 before production use.
