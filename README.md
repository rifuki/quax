# Quax

Full-stack web application with Rust backend (Axum) and React frontend (Vite + TanStack Router).

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React (Vite)  │────▶│   Axum (Rust)   │────▶│   PostgreSQL    │
│   Port: 5173    │     │   Port: 8080    │     │   Port: 5432    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                          ┌──────┴──────┐
                          │    Redis    │
                          │  Port: 6379 │ (optional)
                          └─────────────┘
```

## Project Structure

```
.
├── api/                    # Backend (Rust + Axum)
│   ├── src/
│   │   ├── feature/       # Feature modules (auth, user, admin)
│   │   ├── infrastructure/# Web, persistence, middleware
│   │   └── types/         # Shared domain types
│   ├── migrations/        # SQLx database migrations
│   ├── tests/             # Integration tests
│   ├── Dockerfile         # Production image
│   └── docker-compose.yml # Local services
├── ui/                     # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── features/      # Feature-based modules
│   │   ├── components/    # UI components (shadcn/ui)
│   │   ├── routes/        # TanStack Router file-based routes
│   │   └── lib/           # Utilities, API clients, stores
│   ├── Dockerfile         # Production image (nginx)
│   └── nginx.conf         # Nginx configuration
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Root-level compose (all services)
└── README.md              # This file
```

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/) or Node.js 20+
- [Docker](https://docker.com/) (for PostgreSQL and optional Redis)

### 1. Setup Environment

```bash
# Clone repository
git clone <repo-url>
cd quax

# Copy environment templates
cp api/.env.example api/.env
cp ui/.env.example ui/.env

# Edit environment files
# api/.env - Set JWT secrets and database URL
# ui/.env - Set API URL
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL and Redis (optional)
docker compose up -d postgres redis
```

### 3. Run Database Migrations

```bash
cd api
cargo sqlx migrate run
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend API
cd api && cargo run

# Terminal 2 - Frontend
cd ui && bun run dev
```

- API: http://localhost:8080
- UI: http://localhost:5173

## Backend (API)

### Stack

| Component | Technology |
|-----------|------------|
| Web Framework | Axum 0.8 |
| Database | PostgreSQL 16 + SQLx 0.8 |
| Cache | Redis 7 (optional) |
| Auth | JWT + Argon2 |
| Async Runtime | Tokio |
| Logging | Tracing + Structured JSON |

### Key Features

- **JWT Authentication**: Access token (Bearer) + refresh token (httpOnly cookie)
- **Session Management**: Multi-device tracking with device info, IP, and location
- **Token Rotation**: Refresh tokens rotated on each use with preserved session identity
- **Session Revocation**: Revoke specific device or logout all devices
- **Session Blacklisting**: Redis-based token revocation (optional)
- **API Key Support**: Machine-to-machine authentication
- **File Uploads**: Local filesystem with static file serving
- **Rate Limiting**: Per-IP rate limiting
- **Admin Dashboard**: User management, API key management, system logs

### Project Structure

```
api/src/
├── feature/
│   ├── auth/          # Authentication (login, register, refresh, sessions)
│   │   └── session/   # Device session management
│   ├── user/          # User profile management
│   ├── admin/         # Admin operations
│   │   ├── user/      # User management
│   │   ├── api_key/   # API key management
│   │   ├── stats/     # System statistics
│   │   └── log/       # Log management
│   └── health/        # Health checks
├── infrastructure/
│   ├── web/
│   │   ├── middleware/ # Auth, rate limiting, request ID
│   │   └── response/   # API response types
│   ├── persistence/    # Database, Redis, cache traits
│   └── storage/        # File upload providers
├── types/             # Shared domain types
├── bootstrap.rs       # Initial admin setup
└── state.rs           # Application state
```

### Environment Variables

```env
# Server
RUST_ENV=development
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Database
DATABASE_URL=postgres://quax:secret@localhost:5432/quax_db

# JWT
JWT_ACCESS_SECRET=change-me-access-secret-min-32-chars
JWT_REFRESH_SECRET=change-me-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY_SECS=3600      # 1 hour
JWT_REFRESH_EXPIRY_SECS=604800   # 7 days

# Redis (optional - graceful degradation if not set)
REDIS_URL=redis://localhost:6379

# Upload
UPLOAD_DIR=./uploads
UPLOAD_BASE_URL=http://localhost:8080/media

# Bootstrap Admin
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=changeme
```

### API Endpoints

```
# Health
GET   /healthz
GET   /api/v1/health

# Authentication
POST  /api/v1/auth/register
POST  /api/v1/auth/login
POST  /api/v1/auth/refresh
POST  /api/v1/auth/logout
GET   /api/v1/auth/me
GET   /api/v1/auth/sessions          # List active devices
DELETE /api/v1/auth/sessions/:id     # Revoke specific device
DELETE /api/v1/auth/sessions         # Logout all other devices

# User
GET   /api/v1/user/me
PATCH /api/v1/user/me
PATCH /api/v1/user/me/avatar
DELETE /api/v1/user/me/avatar

# Admin
GET   /api/v1/admin/stats
GET   /api/v1/admin/users
GET   /api/v1/admin/users/:id
PATCH /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
POST  /api/v1/admin/users/:id/block

# Admin - API Keys
GET   /api/v1/admin/api-keys
POST  /api/v1/admin/api-keys
GET   /api/v1/admin/api-keys/:id
PATCH /api/v1/admin/api-keys/:id
DELETE /api/v1/admin/api-keys/:id
POST  /api/v1/admin/api-keys/:id/revoke
POST  /api/v1/admin/api-keys/:id/refresh

# Admin - Logs
GET   /api/v1/admin/logs
GET   /api/v1/admin/log-level
PATCH /api/v1/admin/log-level

# Media (static files)
GET   /media/*
```

### Commands

```bash
cd api

cargo run                    # Start development server
cargo build --release        # Production build
cargo test                   # Run tests
cargo test --lib             # Unit tests only
cargo sqlx migrate run       # Run migrations
cargo sqlx migrate revert    # Revert last migration
cargo sqlx prepare           # Update query metadata
cargo clippy                 # Lint check
cargo fmt                    # Format code

# Scripts
./scripts/migrate-reset.sh       # Reset database (with confirmation)
./scripts/migrate-reset-hard.sh  # Hard reset (no confirmation)
./scripts/reset-admin.sh         # Reset admin password
```

## Frontend (UI)

### Stack

| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Router | TanStack Router |
| State Management | Zustand (client), TanStack Query (server) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Notifications | Sonner |

### Key Features

- **Authentication**: Login, register, JWT token management
- **Protected Routes**: Route guards with role-based access
- **Admin Dashboard**: User management, API keys, system stats
- **Settings**: Profile, security, sessions management
- **File Upload**: Avatar upload with preview
- **Session Management**: View and manage active devices
- **Responsive Design**: Mobile-first, dark mode support
- **Type Safety**: Full TypeScript coverage

### Project Structure

```
ui/src/
├── features/
│   ├── auth/          # Login, register, auth hooks
│   ├── admin/         # Admin dashboard, user management, API keys
│   ├── settings/      # Profile, security, sessions
│   └── home/          # Landing page sections
├── components/
│   ├── ui/            # shadcn/ui components
│   └── layout/        # Layout components (sidebar, breadcrumb)
├── routes/            # TanStack Router file-based routes
├── lib/
│   ├── api/           # API clients and services
│   └── utils.ts       # Utility functions
├── stores/            # Zustand stores
├── providers/         # React providers
└── hooks/             # Custom React hooks
```

### Environment Variables

```env
VITE_API_URL=http://localhost:8080
```

### Commands

```bash
cd ui

bun install                  # Install dependencies
bun run dev                  # Start development server
bun run build                # Production build
bun run lint                 # ESLint check
bun run tsc -b               # TypeScript type check
bun run preview              # Preview production build
```

## Docker

### Local Development

```bash
# Start all services (DB, Cache, API)
docker compose up -d

# Start only database and cache
docker compose up -d postgres redis

# View logs
docker compose logs -f api

# Stop all
docker compose down
```

### Production Deployment

```bash
# Build production images
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or use the deploy script
./scripts/deploy.sh local   # Local development
./scripts/deploy.sh vps     # Deploy to VPS (requires .env.deploy)
```

## CI/CD

GitHub Actions workflow includes:

| Job | Description | Trigger |
|-----|-------------|---------|
| `backend-fmt` | Rust code formatting | PR, Push |
| `backend-clippy` | Rust linting | PR, Push |
| `backend-test` | Unit tests | PR, Push |
| `frontend-lint` | ESLint check | PR, Push |
| `frontend-typecheck` | TypeScript check | PR, Push |
| `frontend-build` | Build and upload artifacts | PR, Push |
| `docker-build` | Build and push to GHCR | Tag `v*` |

### Setup Deployment Secrets

For VPS deployment, add these secrets to GitHub:
- `VPS_HOST` - Server IP or domain
- `VPS_USER` - SSH username  
- `VPS_SSH_KEY` - Private SSH key

For Vercel deployment:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Testing

### Backend

```bash
cd api

# Unit tests (no Docker required)
cargo test --lib

# Integration tests (requires Docker)
cargo test

# Specific test
cargo test test_full_auth_flow
```

### Frontend

```bash
cd ui

# Type checking
bun run tsc -b

# Linting
bun run lint

# Build check
bun run build
```

## Security Considerations

- **Password Hashing**: Argon2id with secure parameters
- **JWT Secrets**: Minimum 32 characters, different for access/refresh
- **Cookies**: httpOnly, secure in production, SameSite strict
- **CORS**: Configurable allowed origins
- **Rate Limiting**: Per-IP rate limiting on sensitive endpoints
- **File Uploads**: Size limits, MIME type validation, path traversal protection
- **API Keys**: Hashed storage, automatic expiration support

## License

[MIT](LICENSE)
