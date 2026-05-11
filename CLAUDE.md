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

pnpm migration:generate <Name>  # generate migration from entity diff
pnpm migration:run              # apply pending migrations
pnpm migration:revert           # revert last migration
pnpm migration:show             # list pending migrations
```

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
    migrations/
  modules/
    auth/                    # register, login, /me — full auth flow
    shared/                  # empty placeholder for shared providers
```

### Auth flow

- `LocalStrategy` + `LocalAuthGuard` — validates email/password via `AuthService.validateUser`, attaches `User` to request
- `JwtStrategy` + `JwtAuthGuard` — validates Bearer token, attaches `{ id, email, role }` to request
- Login blocked if `user.isVerified === false`
- `@CurrentUser()` decorator extracts `request.user` typed as `User`
- `@Roles(UserRole.ADMIN)` + `RolesGuard` — checks `request.user.role`; applied per-route, not global

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
- Throttler applied globally via `APP_GUARD` in `app.module.ts` (100 req / 60s)

## Key conventions

- New modules go in `src/modules/<name>/`
- New entities: add to `src/database/entities/`, import explicitly in `database.config.ts` entities array
- After entity changes: `pnpm migration:generate <DescriptiveName>`, review generated SQL, commit both
- Guards are not global — apply `@UseGuards(JwtAuthGuard)` per controller/route
- JWT payload shape: `{ sub: string, email: string, role: UserRole }` — defined in `JwtStrategy`
