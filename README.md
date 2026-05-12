# NestJS Starter

Production-ready NestJS boilerplate with Postgres, JWT auth, email verification, password reset, RBAC, and TypeORM migrations.

## Stack

- **NestJS** — framework
- **PostgreSQL** + **TypeORM** — database, schema managed via migrations (no `synchronize`)
- **Passport JWT** — authentication
- **RBAC** — role-based access control (`admin` / `user`)
- **Nodemailer** + **Handlebars** — transactional email with templates
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

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASSWORD=secret
SMTP_FROM="App <noreply@example.com>"

FRONTEND_URL=http://localhost:3000

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
pnpm migration:generate <MigrationName>  # generate from entity changes
pnpm migration:run                        # apply pending
pnpm migration:revert                     # revert last
pnpm migration:show                       # list pending
```

Migration files live in `src/database/migrations/`.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register; sends verification email |
| POST | `/api/auth/login` | Public | Login; returns JWT (requires verified email) |
| GET | `/api/auth/me` | JWT | Current user profile |
| GET | `/api/auth/verify-email?token=` | Public | Verify email (token expires 24h) |
| POST | `/api/auth/resend-verification` | Public | Resend verification email |
| POST | `/api/auth/forgot-password` | Public | Send password reset email |
| POST | `/api/auth/reset-password` | Public | Reset password (token expires 1h) |

Swagger docs available at `/api/docs` when `ENABLE_SWAGGER=true`.

## Testing

```bash
pnpm test        # unit tests
pnpm test:watch  # watch mode
pnpm test:cov    # coverage
pnpm test:e2e    # e2e
```

## Production

```bash
pnpm build
pnpm migration:run
pnpm start:prod
```
