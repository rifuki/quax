# quax

> **Quick-start Axum** — production-ready Rust backend template

Axum + SQLx + PostgreSQL with JWT auth, httpOnly refresh token cookie, argon2 password hashing, rate limiting, request tracing, and Docker-first deployment.

## Stack

| Layer | Crate |
|-------|-------|
| Web framework | `axum 0.8` |
| Database | `sqlx 0.8` + PostgreSQL |
| Auth | `jsonwebtoken 9` + `argon2 0.5` |
| Async | `tokio 1.49` |
| Logging | `tracing` + `tracing-subscriber` |
| Validation | `validator 0.20` |

## Features

- 🔐 JWT access token (Bearer) + refresh token (httpOnly cookie, rotated on each refresh)
- 🛡️ Rate limiting per IP via `DashMap`
- 🪪 Optional API key middleware (machine-to-machine)
- 📋 Request ID + structured HTTP tracing
- 🐳 Docker Compose with profiles — flexible for any deployment scenario
- ✅ Integration tests with `testcontainers` (no local Postgres needed)

## Quick Start

```bash
cp .env.example .env
# Edit .env — set JWT secrets and DATABASE_URL

cargo run
```

API available at `http://localhost:8080`

## Endpoints

```
GET   /healthz                # liveness probe
GET   /api/v1/health          # detailed health check

POST  /api/v1/auth/register   # register
POST  /api/v1/auth/login      # login → sets refresh_token cookie
POST  /api/v1/auth/refresh    # rotate refresh token → new access token

GET   /api/v1/user/me         # get profile (auth required)
PATCH /api/v1/user/me         # update profile (auth required)

GET   /api/v1/admin/users     # list users (admin only)
```

## Environment Variables

```env
RUST_ENV=development
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:3000

DATABASE_URL=postgres://quax:secret@localhost:5432/quax_db

JWT_ACCESS_SECRET=change-me-min-32-chars
JWT_REFRESH_SECRET=change-me-min-32-chars-different
JWT_ACCESS_EXPIRY_SECS=3600
JWT_REFRESH_EXPIRY_SECS=604800

API_KEY=   # optional, leave empty to disable
```

See `.env.example` for full reference.

## Docker

```bash
# API only (Supabase DB + external Caddy)
docker compose up -d

# With local Postgres
docker compose --profile db up -d

# Full stack (local Postgres + Caddy)
docker compose --profile db --profile caddy up -d

# External Caddy — connect to same network
docker network connect quax_net <your-caddy-container>
```

## Tests

Integration tests use `testcontainers` — spins up real Postgres via Docker, no local DB needed.

```bash
cargo test
```

Requires Docker running locally.

## Project Structure

```
src/
  feature/
    auth/        # register, login, refresh
    user/        # profile CRUD
    admin/       # admin-only routes
    health/      # health checks
  infrastructure/
    config.rs
    env.rs
    logging.rs
    persistence/ # database pool
    web/
      middleware/ # auth, rate_limit, api_key, request_id, http_trace
      response/   # ApiSuccess, ApiError, error codes
  routes.rs
  state.rs
migrations/
tests/
  auth_flow.rs   # 13 integration tests
```
