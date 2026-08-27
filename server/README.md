# FinTrack API

Backend REST API for FinTrack, a personal expense tracker. Node.js + Express +
PostgreSQL (`pg`), JWT authentication.

## Requirements

- Node.js 20+
- PostgreSQL 16 (schema in `db/init.sql`)

## Setup

```bash
npm install
cp .env.example .env   # edit values as needed
```

Load the schema into your database (only needed once, e.g. locally without
Docker):

```bash
psql -h localhost -U postgres -d fintrack -f db/init.sql
```

Run the API:

```bash
npm start        # node server.js
npm run dev       # node --watch server.js (auto-restart on changes)
```

The server listens on `process.env.PORT` (default `3001`).

## Environment variables

| Variable      | Description                              | Default     |
|----------------|-------------------------------------------|-------------|
| `PORT`         | HTTP port the API listens on              | `3001`      |
| `PGHOST`       | PostgreSQL host                           | `localhost` |
| `PGPORT`       | PostgreSQL port                           | `5432`      |
| `PGUSER`       | PostgreSQL user                           | `postgres`  |
| `PGPASSWORD`   | PostgreSQL password                       | `postgres`  |
| `PGDATABASE`   | PostgreSQL database name                  | `fintrack`  |
| `JWT_SECRET`   | Secret used to sign/verify JWTs           | *(none — required for auth to work; server refuses to start in production without one of at least 32 characters)* |
| `CORS_ORIGIN`  | Comma-separated list of browser origins allowed to call the API | `http://localhost:5173` |
| `NODE_ENV`     | `production` enables the startup JWT_SECRET check              | *(unset)* |

## Authentication

All endpoints except `POST /api/auth/register` and `POST /api/auth/login`
require a valid JWT:

```
Authorization: Bearer <token>
```

Tokens are issued on register/login, signed with `JWT_SECRET`, and expire
after 24 hours. Passwords are hashed with bcrypt (cost factor 12).
`POST /api/auth/register` and `POST /api/auth/login` are rate-limited (10
requests per 15 minutes per IP) to blunt brute-force / credential-stuffing
attempts.

Every data query is additionally scoped to the authenticated user
(`WHERE user_id = ...`) — a user can never read, modify, or delete another
user's categories or transactions.

## Endpoints

### Auth

| Method | Path                | Auth | Body                                | Notes |
|--------|---------------------|------|--------------------------------------|-------|
| POST   | `/api/auth/register` | no   | `{ name, email, password }`         | `password` 8-72 chars, must contain a letter and a number. Returns `{ token, user }`. |
| POST   | `/api/auth/login`    | no   | `{ email, password }`               | Returns `{ token, user }`. |
| GET    | `/api/auth/me`       | yes  | —                                    | Returns `{ user }` for the authenticated user. |

### Categories

| Method | Path                   | Auth | Body                                 | Notes |
|--------|------------------------|------|----------------------------------------|-------|
| GET    | `/api/categories`      | yes  | —                                       | Lists the caller's categories. |
| POST   | `/api/categories`      | yes  | `{ name, type, color? }`                | `type` is `"income"` or `"expense"`. `color` is a hex string like `#RRGGBB` (default `#6366f1`). |
| PUT    | `/api/categories/:id`  | yes  | any subset of `{ name, type, color }`   | 404 if the category doesn't belong to the caller. |
| DELETE | `/api/categories/:id`  | yes  | —                                       | 404 if not owned; 409 if the category still has transactions. |

### Transactions

| Method | Path                     | Auth | Body / Query                                              | Notes |
|--------|--------------------------|------|-------------------------------------------------------------|-------|
| GET    | `/api/transactions`      | yes  | query: `category_id?`, `from?`, `to?` (`YYYY-MM-DD`)         | Lists the caller's transactions, newest first, joined with category info. |
| POST   | `/api/transactions`      | yes  | `{ category_id, amount, description?, occurred_at? }`       | `amount` must be positive (up to 2 decimals). `category_id` must belong to the caller. `occurred_at` defaults to today. |
| PUT    | `/api/transactions/:id`  | yes  | any subset of `{ category_id, amount, description, occurred_at }` | 404 if not owned. |
| DELETE | `/api/transactions/:id`  | yes  | —                                                            | 404 if not owned. |

### Dashboard

| Method | Path                          | Auth | Notes |
|--------|-------------------------------|------|-------|
| GET    | `/api/dashboard/summary`      | yes  | `{ total_income, total_expense, balance }` across all of the caller's transactions. |
| GET    | `/api/dashboard/by-category`  | yes  | `{ categories: [{ category_id, category_name, category_type, category_color, total }] }`, categories with no transactions omitted. |

### Misc

- `GET /health` — unauthenticated liveness check, returns `{ status: "ok" }`.

## Error format

All errors are returned as JSON:

```json
{ "error": "Human readable message", "details": { "field": "what's wrong" } }
```

`details` is only present for multi-field validation errors. The centralized
error handler (`middleware/errorHandler.js`) never returns stack traces or raw
internal/driver error messages — unrecognized errors become a generic
`500 { "error": "Internal server error" }`, and the full error is logged
server-side only.

## Project structure

```
server/
├── app.js                # Express app: middleware, route mounting, error handling
├── server.js             # Entry point: starts the HTTP listener
├── config/
│   └── db.js              # pg Pool, configured from PG* env vars
├── middleware/
│   ├── auth.js             # authMiddleware: verifies JWT, sets req.userId
│   └── errorHandler.js     # notFoundHandler + centralized errorHandler
├── controllers/
│   ├── authController.js
│   ├── categoriesController.js
│   ├── transactionsController.js
│   └── dashboardController.js
├── routes/
│   ├── auth.js
│   ├── categories.js
│   ├── transactions.js
│   └── dashboard.js
├── utils/
│   ├── AppError.js          # Operational error with an HTTP status code
│   ├── asyncHandler.js      # Wraps async route handlers for error propagation
│   └── validation.js        # Shared input-validation helpers
└── db/
    └── init.sql             # PostgreSQL schema (provided)
```
