# NestJS Starter

Production-ready NestJS boilerplate with Postgres, JWT auth, RBAC, and TypeORM migrations.

## Stack

- **NestJS** — framework
- **PostgreSQL** + **TypeORM** — database, schema managed via migrations (no `synchronize`)
- **Passport JWT** — authentication
- **RBAC** — role-based access control (`admin` / `user`)
- **Helmet** + **CORS** + **Throttler** — security defaults
- **Swagger** — optional API docs
- **class-validator** — request validation

## Setup

```bash
pnpm install
```

Copy env file and fill in values:

```bash
cp .env.example .env
```

Required env vars:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=nestjs_starter

JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

# Optional
CORS_ORIGIN=*
ENABLE_SWAGGER=true
PORT=3000
```

## Development

```bash
pnpm dev
```

## Database Migrations

Schema is managed exclusively via migrations. `synchronize` is always `false`.

```bash
# Generate migration from entity changes
pnpm migration:generate <MigrationName>

# Apply pending migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert

# List pending migrations
pnpm migration:show
```

Migration files live in `src/database/migrations/`.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current user profile |

Swagger docs available at `/api/docs` when `ENABLE_SWAGGER=true`.

## Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E
pnpm test:e2e
```

## Production

```bash
pnpm build
pnpm start:prod
```

Run migrations before starting in production:

```bash
pnpm migration:run
node dist/main
```
