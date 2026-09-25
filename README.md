# Storeroom API v2

REST API for a multi-tenant storeroom (inventory) management system, built with **NestJS**, **TypeScript**, **PostgreSQL** and **Sequelize**.

v2 is a TypeScript rewrite of the original Express/MongoDB [StoreRoom-Backend](https://github.com/Steinium7/StoreRoom-Backend), moving to a modular NestJS structure, a relational schema and typed, validated request DTOs.

> **Status: work in progress.** Authentication (register / login with JWT) is implemented and tested. The company, user and people CRUD endpoints are scaffolded and are being built out next — see [Roadmap](#roadmap).

## Features

- **Registration** — validates input with `class-validator`, hashes passwords with bcrypt in a model `@BeforeCreate` hook, and provisions a new company with the registering user as its super admin
- **Login** — verifies credentials and returns a signed JWT (3h expiry) plus the user profile, without the password hash
- **Modular architecture** — one NestJS module per domain (`auth`, `user`, `company`, `people`) with its own controller, service and DTOs
- **Tested** — unit tests for services, controllers and model hooks, plus HTTP-level e2e tests for the auth flow that run without a database

## Architecture

```
src/
├── main.ts              # bootstrap, global ValidationPipe
├── app.module.ts        # root module, Sequelize (Postgres) connection
├── auth/                # register / login, JWT issuing
├── user/                # user service + DTOs (used by auth)
├── company/             # tenant (company) resources
├── people/              # people managed within a company
└── models/              # Sequelize models: User, Company, People
test/
└── auth.e2e-spec.ts     # auth HTTP flow against an in-memory user store
```

**Data model**

| Model     | Key fields                                                      | Relations            |
| --------- | --------------------------------------------------------------- | -------------------- |
| `Company` | `name`, `slug` (auto-generated), `admin`                        | has many `User`      |
| `User`    | `username`, `email` (unique), `password` (bcrypt), `superAdmin` | belongs to `Company` |
| `People`  | `firstname`, `lastname`                                         | —                    |

## API

| Method | Path             | Description                              | Status      |
| ------ | ---------------- | ---------------------------------------- | ----------- |
| POST   | `/auth/register` | Create a user and their company          | ✅ Done     |
| POST   | `/auth/login`    | Log in, returns `{ access_token, user }` | ✅ Done     |
| \*     | `/user`          | User CRUD                                | 🚧 Scaffold |
| \*     | `/company`       | Company CRUD                             | 🚧 Scaffold |
| \*     | `/people`        | People CRUD                              | 🚧 Scaffold |

**Register**

```http
POST /auth/register
Content-Type: application/json

{
  "username": "jdoe",
  "password": "correct-horse",
  "email": "jdoe@example.com",
  "firstname": "John",
  "lastname": "Doe"
}
```

Returns `201` with the created user, `400` if validation fails or the email is already registered.

**Login**

```http
POST /auth/login
Content-Type: application/json

{ "username": "jdoe", "password": "correct-horse" }
```

Returns `200` with `{ "access_token": "<jwt>", "user": { ... } }`, or `401` for invalid credentials.

## Getting started

**Requirements:** Node.js 20+, pnpm 8+, PostgreSQL

```bash
pnpm install
```

The app currently connects to `postgres://root:root@localhost:5432/storeroomdb` (see `src/app.module.ts`). A quick way to get a matching database:

```bash
docker run -d --name storeroom-db -p 5432:5432 \
  -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -e POSTGRES_DB=storeroomdb \
  postgres:16
```

Then start the API (tables are created automatically on startup):

```bash
pnpm start:dev
```

The server listens on `PORT` or `3000`.

## Testing

```bash
pnpm test        # unit tests
pnpm test:e2e    # auth HTTP flow (no database required)
pnpm test:cov    # unit tests with coverage
```

## Roadmap

- [ ] Move database credentials and JWT secret into environment variables (`@nestjs/config`), add `.env.example`
- [ ] Stop returning the password hash from `/auth/register`
- [ ] JWT auth guard protecting non-auth routes, scoped to the user's company
- [ ] Implement company, user and people CRUD with pagination
- [ ] Inventory domain: items, stock movements, storerooms
- [ ] Replace `synchronize: true` with migrations
- [ ] `docker-compose.yml` for API + Postgres
- [ ] GitHub Actions CI (lint, test, build)
- [ ] OpenAPI / Swagger docs

## License

[Apache 2.0](LICENSE)
