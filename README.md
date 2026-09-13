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

Domains: auth, users, vehicles, brands/categories, showroom, configurator, favorites, comparisons, saved-builds, navigation, notifications, media, admin, audit.

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

`20240913180000_username_notifications_push` adds unique `users.username`, notification `href`/`kind`, `push_subscriptions`, and demo inbox rows.

Demo accounts (`DEMO_MODE=true`, password `demo1234`):

| Persona | Username | Email | Frontend role |
| --- | --- | --- | --- |
| customer | maya | maya@demo.aurora | customer |
| visitor | visitor | visitor@demo.aurora | visitor |
| advisor | daniel | daniel@demo.aurora | advisor |
| admin | priya | priya@demo.aurora | admin |

`POST /api/v1/auth/login` with `{ "username": "maya", "password": "demo1234" }` issues a session. `POST /api/v1/auth/demo-login` with `{ "persona": "maya" }` or `{ "persona": "customer" }` does the same.

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

Vehicle payloads match `src/models/vehicle.ts` in the frontend (`power`, `price`, `isFeatured`, `colors[].id`, `renderMode`, `silhouette`, …). Auth users match `src/models/user.ts` (`name`, `username`, `role`, `avatarSeed`, `joinedAt`, `location`). Notifications match `AppNotification` (`title`, `detail`, `read`, `href`, `kind`).

Frontend-called routes at `/api/v1`:

| Area | Methods |
| --- | --- |
| Auth | `POST /auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/logout`, `/auth/refresh` |
| Navigation | `GET /navigation` → `{ groups }` |
| Notifications | `GET /`, `GET /unread-count`, `POST /:id/read`, `POST /read-all`, `DELETE /:id`, `DELETE /`, `POST /push-subscribe` |
| Profile | `GET/PATCH /users/me` |
| Vehicles | `GET /vehicles`, `GET /vehicles/:id` |
| Favorites | `GET /favorites`, `POST/DELETE /favorites/:vehicleId` |
| Configurator | `POST /configurations`, `POST /saved-builds` |

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

Recommended deploy: App Runner or ECS Fargate. Do not deploy Express to GitHub Pages. Do not introduce EKS.

## Scripts

```bash
npm run dev
npm run build
npm start
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
