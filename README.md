# Aurora Motors API (`car-system-server`)

Standalone Node.js backend for the existing Aurora Motors frontend.

Frontend repository: [https://github.com/maheshpcse/car-system](https://github.com/maheshpcse/car-system)

This API is the data, auth, configuration, and media layer. The React app keeps Three.js / R3F rendering, the virtual showroom, and the current UI.

```
car-system (React + Vite + R3F, GitHub Pages)
        │  VITE_API_BASE_URL
        ▼
car-system-server (Express + TypeScript + Prisma)
        ├── RDS / local MySQL
        └── AWS (S3, CloudFront, SES, CloudWatch, Secrets Manager)
```

## Architecture

Modular monolith under `src/modules/*`. Each domain has routes, validation, a thin controller, a service, and Prisma access. Controllers never call AWS or SQL directly.

Domains: auth, users, vehicles, brands/categories, showroom, configurator, favorites, comparisons, saved-builds, notifications, media, admin, audit.

## Requirements

- Node.js 22 LTS
- MySQL 8
- npm

Optional later: Redis, SQS, MongoDB, a Python AI service. None of those are required for v1.

## Local development

```bash
# API
cp .env.example .env
docker compose up mysql -d
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

```bash
# Frontend (separate repo)
cd ../car-system
# .env.development
# VITE_API_BASE_URL=http://localhost:5000/api/v1
npm install
npm run dev
```

| Service | URL |
| --- | --- |
| API | http://localhost:5000 |
| Health | http://localhost:5000/health |
| Readiness | http://localhost:5000/health/ready |
| Swagger | http://localhost:5000/api-docs |
| Frontend | http://localhost:5173 |

## Environment

See `.env.example`. Production secrets should come from AWS Secrets Manager or SSM, not the git repo.

Cross-origin GitHub Pages hosting is first-class: set `FRONTEND_URLS` and use `COOKIE_SAMESITE=none` plus `COOKIE_SECURE=true` so the HTTP-only refresh cookie can be sent to the API origin.

## Database

Prisma migrations live in `prisma/migrations`. Do not use `prisma db push` as the production strategy.

Seed data copies the fictional Aurora Motors catalogue already used by the frontend: Aureon, Velora, Nexen, Kairo, Orion, Rivana, Solace, Ventra.

Demo accounts (`DEMO_MODE=true`, password `demo1234`):

| Persona | Email | Frontend role |
| --- | --- | --- |
| customer | maya@demo.aurora | customer |
| visitor | visitor@demo.aurora | visitor |
| advisor | daniel@demo.aurora | advisor |
| admin | priya@demo.aurora | admin |

`POST /api/v1/auth/demo-login` with `{ "persona": "customer" }` issues the same session.

## API contract

Success:

```json
{ "success": true, "data": {}, "message": "..." }
```

Lists include `pagination: { page, limit, total, totalItems, totalPages }`.

Errors never include stack traces in production:

```json
{ "success": false, "error": { "code": "VEHICLE_NOT_FOUND", "message": "Vehicle was not found", "requestId": "..." } }
```

Vehicle payloads match `src/models/vehicle.ts` in the frontend (`power`, `price`, `isFeatured`, `colors[].id`, `renderMode`, `silhouette`, …). Auth users match `src/models/user.ts` (`name`, `role`, `avatarSeed`, `joinedAt`, `location`).

Configurator totals are calculated on the server. The client must not be trusted for price.

## Frontend integration

1. Set `VITE_API_BASE_URL` to this API’s `/api/v1` origin.
2. Keep UI components unchanged; call the API from `src/services/*`.
3. Keep local/mock fallbacks until each surface is wired.
4. Do not move 3D, camera, lighting, or avatar logic to this repository.

Suggested order: vehicles → auth/demo login → favorites/saved builds → configurator persistence → profile/preferences.

## AWS

| Concern | Service |
| --- | --- |
| Database | RDS MySQL |
| Images / GLB | S3 (metadata only in MySQL) |
| CDN | CloudFront |
| Email | SES via `EmailProvider` / `AwsSesEmailProvider` |
| Logs | Structured JSON → CloudWatch |
| Secrets | Secrets Manager / SSM |

Large GLB uploads use `POST /api/v1/media/presigned-upload` then `POST /api/v1/media/complete`. Files never stream through Express memory.

Local development uses `EMAIL_PROVIDER=console` and `STORAGE_PROVIDER=local`. Automated tests mock AWS.

Recommended production split:

- Frontend: GitHub Pages (`maheshpcse/car-system`)
- Backend: Railway (`car-system-server`)

Do not deploy Express to GitHub Pages. Do not introduce EKS.

## Railway (production API)

Railway config files in this repo:

| File | Purpose |
| --- | --- |
| `railway.json` | Builder, start command, `/health` check |
| `nixpacks.toml` | Node 22 install/build/start |
| `Procfile` | `web` process for Railway/Heroku-style hosts |
| `.env.railway.example` | Variables to paste into Railway |

1. Create a Railway project from this repository.
2. Add a **MySQL** plugin and attach it to the API service.
3. Copy variables from `.env.railway.example`. Set long JWT secrets. Leave `DATABASE_URL` empty so the API can build it from `MYSQLHOST` / `MYSQLUSER` / `MYSQLPASSWORD` / `MYSQLDATABASE`.
4. Set `FRONTEND_URLS=https://maheshpcse.github.io` (and any custom frontend origin).
5. Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` so GitHub Pages can use the refresh cookie.
6. Deploy. First boot runs `prisma migrate deploy`. Set `RUN_DB_SEED=true` once to load the Aurora catalogue, then remove it.
7. Health: `https://<your-service>.up.railway.app/health`
8. API base for the frontend: `https://<your-service>.up.railway.app/api/v1`

Railway also auto-deploys from `main`. Optional GitHub Action: `.github/workflows/deploy-railway.yml` (needs `RAILWAY_TOKEN`, optional `RAILWAY_SERVICE_ID`).

## Scripts

```bash
npm run dev
npm run build
npm start
npm run start:prod
npm run lint
npm run typecheck
npm test
npm run db:seed
```

## Docker

```bash
docker compose up --build
```

## License

Open source backend for the Aurora Motors studio project.
