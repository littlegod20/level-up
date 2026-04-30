# Level Up – Backend

Express + TypeORM + PostgreSQL API: auth (JWT), habits, and completions.

## Setup

1. Copy [`.env.example`](./.env.example) to `.env` and set `DB_*`, `JWT_SECRET` (and optional `PUBLIC_API_URL` for Swagger).
2. Create the database, then run migrations: `npm run migration:run`
3. Dev: `npm run dev` — server uses [`src/server.ts`](./src/server.ts) (DB + HTTP).
4. Build: `npm run build` — output in `dist/`. Start: `npm start`

## API (summary)

- `GET /api/health` — public
- `POST /auth/register`, `POST /auth/login` — public
- `GET/POST /api/habits`, `GET/PATCH/DELETE /api/habits/:habitId` — Bearer JWT
- `GET/POST /api/habits/:habitId/completions`, `DELETE /api/habits/:habitId/completions/:date` — Bearer JWT

Interactive docs: `GET /api-docs` (after the server is running).
