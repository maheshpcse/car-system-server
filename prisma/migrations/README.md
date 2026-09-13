# Database migrations

Prisma SQL migrations are the source of truth. Do **not** use `prisma db push` in production.

Apply with:

```bash
npx prisma migrate deploy
```

That is also what `npm run start:prod` and Railway run on boot.

## Migration files

| Folder | Type | What it does |
| --- | --- | --- |
| `20240912120000_init` | Schema | Creates every MySQL table, enum, index, and foreign key |
| `20240912130000_seed_aurora_catalog` | Data | Inserts brands, categories, 12 vehicles, options, and demo users |
| `20240913180000_username_notifications_push` | Schema + data | Adds `users.username`, notification `href`/`kind`, `push_subscriptions`, demo inbox rows |

Regenerate the data SQL from the TypeScript catalogue (only if the frontend vehicle set changes):

```bash
npm run db:generate-data-migration
```

Then review the diff under `20240912130000_seed_aurora_catalog/migration.sql` before committing. Do not edit an already-applied production migration in place — add a new dated folder instead.

## Tables created by `init`

### Identity and security

- `users`
- `user_preferences`
- `refresh_tokens`
- `password_reset_tokens`
- `email_verify_tokens`

### Catalogue

- `brands`
- `vehicle_categories`
- `vehicles`
- `vehicle_category_links`
- `vehicle_specifications`
- `vehicle_features`
- `vehicle_variants`
- `vehicle_colors`
- `vehicle_wheels`
- `vehicle_interiors`
- `vehicle_trims`
- `vehicle_accessories`
- `vehicle_media`

### Customer studio

- `favorites`
- `vehicle_configurations`
- `saved_builds`
- `comparisons`
- `comparison_items`
- `showroom_sessions`
- `showroom_events`
- `notifications`
- `push_subscriptions`

### Admin and media

- `audit_logs`
- `media_assets`

## Data loaded by `seed_aurora_catalog`

Brands: Aureon, Kairo, Nexen, Orion, Rivana, Solace, Velora, Ventra

Vehicles: `aureon-x1`, `aureon-v9`, `velora-gt`, `velora-estate`, `nexen-e7`, `nexen-city`, `kairo-s`, `kairo-cross`, `orion-touring`, `rivana-xr`, `solace-ev`, `ventra-rs`

Demo users (password `demo1234`):

| Persona | Username | Email |
| --- | --- | --- |
| customer | maya | maya@demo.aurora |
| visitor | visitor | visitor@demo.aurora |
| advisor | daniel | daniel@demo.aurora |
| admin | priya | priya@demo.aurora |
