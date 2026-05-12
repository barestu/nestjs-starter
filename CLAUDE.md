# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                        # start with watch
pnpm build                      # compile to dist/
pnpm lint                       # ESLint --fix
pnpm format                     # Prettier --write

pnpm test                       # unit tests
pnpm test:watch                 # watch mode
pnpm test:cov                   # coverage
pnpm test:e2e                   # e2e

# Run a single test file
pnpm test -- --testPathPattern=auth.service

pnpm migration:generate <Name>  # generate migration from entity diff
pnpm migration:run              # apply pending migrations
pnpm migration:revert           # revert last migration
pnpm migration:show             # list pending migrations
```

## Local database

Docker Compose spins up Postgres only:

```bash
docker compose up -d
```

Reads `DB_*` vars from `.env`. Copy `.env.example` to `.env` and fill in values before running.

## Architecture

### Module structure

```
src/
  app.module.ts              # root — registers global config, TypeORM, throttler
  main.ts                    # bootstrap: helmet, CORS, ValidationPipe, Swagger
  common/
    decorators/              # @CurrentUser(), @Roles()
    guards/                  # JwtAuthGuard, LocalAuthGuard, RolesGuard
    enums/role.enum.ts       # UserRole: admin | user
  config/
    database.config.ts       # TypeOrmModuleOptions factory (used by app.module)
  database/
    data-source.ts           # standalone DataSource for TypeORM CLI only
    entities/user.entity.ts
    migrations/              # 3 applied: AddUserTable, AddVerificationToken, AddPasswordResetToken
  modules/
    auth/                    # register, login, /me, verify-email, resend-verification, forgot-password, reset-password
    mail/                    # @Global MailService wrapping @nestjs-modules/mailer; Handlebars templates
    shared/                  # empty placeholder for shared providers
```

### Auth flow

- `LocalStrategy` + `LocalAuthGuard` — validates email/password via `AuthService.validateUser`, attaches `User` to request
- `JwtStrategy` + `JwtAuthGuard` — validates Bearer token, attaches `{ id, email, role }` to request
- Login blocked if `user.isVerified === false` (throws `ForbiddenException`)
- `@CurrentUser()` decorator extracts `request.user` typed as `User`
- `@Roles(UserRole.ADMIN)` + `RolesGuard` — checks `request.user.role`; applied per-route, not global
- JWT payload shape: `{ sub: string, email: string, role: UserRole }` — defined in `JwtStrategy`

### Auth routes (`/api/auth`)

| Method | Path | Guard | Throttle |
|--------|------|-------|---------|
| POST | `/register` | — | 10/60s |
| POST | `/login` | LocalAuthGuard | 10/60s |
| GET | `/me` | JwtAuthGuard | global |
| GET | `/verify-email?token=` | — | 10/60s |
| POST | `/resend-verification` | — | 5/60s |
| POST | `/forgot-password` | — | 3/60s |
| POST | `/reset-password` | — | 5/60s |

`forgotPassword` never reveals whether email exists (anti-enumeration).

### User entity fields

`id` (uuid), `email`, `password` (bcrypt), `isVerified`, `verificationToken`, `verificationTokenExpiry` (24h), `resetPasswordToken`, `resetPasswordTokenExpiry` (1h), `role` (enum), `createdAt`, `updatedAt`

### Mail module

- `MailModule` is `@Global()` — inject `MailService` anywhere without re-importing
- Templates: `src/modules/mail/templates/verification.hbs`, `reset-password.hbs`
- `sendVerificationEmail(email, token)` — link: `${FRONTEND_URL}/verify?token=`
- `sendPasswordResetEmail(email, token)` — link: `${FRONTEND_URL}/reset-password?token=`
- Env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `FRONTEND_URL`

### Database

- `synchronize` is always `false` — schema changes require migrations
- Two separate TypeORM configs: `database.config.ts` (NestJS DI, explicit entity array) and `data-source.ts` (CLI only, glob entity loading)
- `data-source.ts` uses `__dirname`-relative paths for entities, relative path for migrations (required for TypeORM CLI to resolve generate output dir correctly)

### Global setup (main.ts)

- `helmet()` applied as Express middleware
- CORS origin from `CORS_ORIGIN` env (default `*`)
- Global prefix: `api`
- `ValidationPipe({ whitelist: true })` strips unknown properties
- Swagger at `/api/docs` when `ENABLE_SWAGGER=true`
- Throttler applied globally via `APP_GUARD` in `app.module.ts` (100 req / 60s); auth routes override with stricter limits

## Key conventions

- New modules go in `src/modules/<name>/`
- New entities: add to `src/database/entities/`, import explicitly in `database.config.ts` entities array
- After entity changes: `pnpm migration:generate <DescriptiveName>`, review generated SQL, commit both entity + migration together
- Guards are not global — apply `@UseGuards(JwtAuthGuard)` per controller/route
- `me` strips `password` before returning — do same in any future user-returning endpoints
