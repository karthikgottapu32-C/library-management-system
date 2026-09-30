# Library Management System

React/Vite frontend and Express API are served by one Render web service. The API uses the `pg` driver to connect to Supabase PostgreSQL. Production browser requests use the same-origin `/api` path; Vite proxies `/api` to `http://localhost:8000` only during local development.

## Local Development

1. Create `backend/.env` from `backend/.env.example` and set a Supabase PostgreSQL `DATABASE_URL`. URL-encode reserved characters in the password. Never commit `.env` files.
2. Install dependencies and build the frontend:

   ```powershell
   npm ci --prefix backend
   npm ci --prefix frontend
   npm run build --prefix frontend
   ```

3. Start the combined application (API on port 8000):

   ```powershell
   npm start --prefix backend
   ```

4. For Vite hot reload, use another terminal and run `npm run dev --prefix frontend`, then open `http://localhost:5173`. The backend must be available for local API calls.

## Supabase Import

The Oracle-format source scripts remain under `database/schema` and `database/data` for audit/history. The PostgreSQL schema is `database/schema/postgres_schema.sql`; the 15 CSV exports and expected row totals are under `database/export`.

The initial importer is deliberately fail-fast and refuses to overwrite any of the 15 target tables. Use a new/empty Supabase project, set `DATABASE_URL` in `backend/.env`, verify the project ref and password locally, then run:

```powershell
npm run migrate --prefix backend
```

The importer applies the PostgreSQL schema, imports all CSV rows in one transaction, preserves source statuses while loading, synchronizes serial sequences, checks all row totals, and commits only after every check passes. Do not run it against an existing populated project.

## Render Deployment

`render.yaml` defines an always-on Starter web service in Singapore. Render uses the repository root, installs dependencies reproducibly, builds Vite, starts Express, and monitors `/api/health`. Set `DATABASE_URL` as a secret environment variable in Render. Do not set a production `VITE_API_BASE_URL`; the production bundle uses same-origin `/api`.

Render service creation and Supabase account access require a human login and billing decision. Render will display the actual public URL after deployment; this repository does not yet have an assigned public service URL.

## Read-Only Deployment Smoke Test

Set `LIBRARY_API_URL` to the deployed base URL, then run:

```powershell
python test_api.py
```

This checks health/status, dashboard endpoints, and all 15 table collection endpoints. It requires a populated Supabase database and performs GET requests only.
