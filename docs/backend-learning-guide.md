# OT Tracker Backend — How It Was Built and Why

---

## The Big Picture: Why NestJS?

NestJS is a framework built on top of Express (Node.js) that enforces **structure**. Raw Express lets you do anything anywhere, which gets messy fast. NestJS borrows ideas from Angular and Java Spring — everything is organized into **Modules**, and each module owns its own **Controller**, **Service**, and **Entity**.

The mental model: think of a Module as a self-contained "department" of your app. Each department knows its own data and exposes its own endpoints.

---

## The Request Lifecycle

Every HTTP request that hits the backend travels through this pipeline before your code even runs:

```
HTTP Request
    ↓
Global guards, in order — Is this person allowed in?
  AppThrottlerGuard      rate limit (login: 5/min per account)
  JwtAuthGuard           valid token? (skipped for @Public() routes)
  PasswordChangeGuard    still on a temporary password? only /auth/me and change-password allowed
  RolesGuard             does @Roles(...) allow this role? (admins always pass)
    ↓
Interceptors / Pipes (ValidationPipe) — Is the data valid?
    ↓
Controller — Which function handles this route?
    ↓
Service — Business logic
    ↓
TypeORM / Database — Read or write data
    ↓
HTTP Response
```

Understanding this pipeline is key to understanding why the code is structured the way it is.

---

## Module 1: Auth — The Front Door

**The problem it solves:** The backend needs to know *who* is making each request and *whether they're allowed* to do what they're asking.

### How Login Works (the flow)

1. User POSTs `{ email, password }` to `/auth/login`
2. `AuthService.login()` calls `validateUser(email, password)`
3. `validateUser` looks up the user by email (case-insensitively), then uses **bcrypt** to compare the submitted password against the hashed one stored in the DB — bcrypt never decrypts, it re-hashes and compares. Inactive users are rejected.
4. If valid, `AuthService.login()` creates a **JWT payload** containing only the user id: `{ sub: userId }`
5. `JwtModule.sign()` turns that payload into a signed token string (e.g. `eyJhbGciOiJIUzI1...`)
6. The token is returned to the frontend, which stores it and sends it with every future request in the `Authorization: Bearer <token>` header

**Why JWT?** The server doesn't store sessions — the token proves who you are. Any server instance can verify the signature with `JWT_SECRET` (which is required; the app refuses to start without it).

**Why only the id in the token?** Anything in a token is frozen until it expires (24h). If the role lived in the token, demoting or deactivating someone wouldn't take effect for a day. Instead, `JwtStrategy.validate()` loads the user from the database on every request and rejects inactive users — one indexed lookup, in exchange for changes applying immediately.

### How Protected Routes Work

Every route is protected by default: `JwtAuthGuard` is registered globally in `AppModule`, and routes opt *out* with `@Public()` (only login and `/health`). Secure-by-default means forgetting a decorator fails closed, not open.

1. The guard runs `JwtStrategy`, which verifies the token's signature and expiry
2. `validate()` loads the user and returns an `AuthUser` (`id, email, role, departmentId, mustChangePassword`)
3. That object is attached to `request.user`
4. Controllers read it with the `@CurrentUser()` decorator: `update(@CurrentUser() user: AuthUser)`

### Role-Based Access Control (RBAC)

Two levels of protection exist:
- **AuthGuard('jwt')** — "Are you logged in?"
- **RolesGuard** — "Are you the *right kind* of user?"

The `@Roles(UserRole.SUPERVISOR)` decorator is just a metadata tag. `RolesGuard` reads that tag via `Reflector`, then compares it to `req.user.role`. If the user is a `REGULAR` employee trying to hit a supervisor-only route, the guard returns `false` and NestJS automatically sends a `403 Forbidden`.

```typescript
@Roles(UserRole.SUPERVISOR)  // sets metadata; the global RolesGuard reads it
```

**Why separate guards?** Single Responsibility Principle — the JWT guard handles *authentication*, the roles guard handles *authorization*.

**Roles aren't enough on their own.** "Is this a supervisor?" is a role check; "is this *their department's* record?" or "is this *their own* record?" depends on the data, so it lives in the service (see Module 3). Most real access bugs are in that second kind of check.

---

## Module 2: Database Design — Why These Relationships?

The three main entities and their relationships:

```
Department  1 ──────< User  1 ──────< OtRecord
```

- A **Department** has many **Users** (OneToMany)
- A **User** belongs to one **Department** (ManyToOne)
- A **User** has many **OtRecords** (OneToMany)
- An **OtRecord** belongs to one **User** (ManyToOne)

This is called a **relational model**. Rather than duplicating the department name on every user row, you store it once in `departments` and reference it with a foreign key (`departmentId`). Same for OT records — the `userId` on `ot_records` is a pointer back to the `users` table.

**Why `synchronize: false`?** TypeORM can auto-create tables from your entities. That's fine in development but **dangerous in production** — a typo in an entity could drop a column and destroy data. So the schema is changed only through **migrations** in `src/database/migrations/`: numbered files with an `up()` and a `down()`. TypeORM records which ones have run in a `migrations` table and applies new ones when the app starts, so every environment ends up with the same schema. Sample data is separate (`npm run seed`, dev only).

**The database enforces the rules too.** `NOT NULL`, `CHECK (duration BETWEEN 0.25 AND 12)`, foreign keys and a case-insensitive unique email index mean bad data can't get in even if application code has a bug. `DatabaseExceptionFilter` turns those constraint errors into 400/409 responses.

**Password hashes are `select: false`** on the entity, so they're never loaded — not even through a relation like `record.user` — unless a query explicitly asks for them (only the login lookup does).

**The `approvedBy` field on OtRecord** stores the `userId` of the supervisor who approved/rejected it. This creates an audit trail — you always know who made the decision.

---

## Module 3: OT Records — The Core Business Logic

This is the most complex module because it serves *two different types of users* with very different needs.

### The Dual-User Problem

An **employee** should only see and create their own records. A **supervisor** needs to see everyone's records and change their status. The same entity (`OtRecord`) serves both, but the access patterns are totally different.

This is handled by having **separate endpoints for each role**:

- `GET /ot-records/my-records` — uses `req.user.id` from the JWT, always filters to that user only. A user *cannot* pass someone else's ID here.
- `GET /ot-records` — supervisor-only, returns records **from the supervisor's own department** (admins see all). Supports `status`, `search` and pagination (`limit` is capped at 100).

**Ownership checks.** Owners can edit or delete their own record only while it's **pending**; once decided it's frozen (409). Anyone else gets a 403. These checks live in `OtRecordsService.assertCanModify()` — the controller can't know who owns a record without loading it.

**Route order matters.** Literal paths like `my-records` and `my-summary` are declared before parameterised ones, and `:id` uses `ParseIntPipe` so a non-numeric id is a 400, not a database error.

### Status Flow

OT records follow a simple state machine:

```
PENDING  →  APPROVED
         →  REJECTED
```

The `PATCH /ot-records/:id/status` endpoint is supervisor-only and accepts `{ status: 'approved' | 'rejected' }` (validated by `UpdateOtStatusDto`). The service enforces the state machine and the business rules:
- only **pending** records can be decided (409 otherwise)
- supervisors can only decide on records from **their own department** (403)
- nobody can approve **their own** overtime (403)

It sets `approvedBy` from the authenticated user — the frontend never sends who approved it, so it can't be spoofed.

### Validation with DTOs

The `CreateOtRecordDto` is a class with decorators from `class-validator`:

```typescript
@Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm format' })
startTime!: string;
```

The global `ValidationPipe` (set up in `app.setup.ts`) runs these validators on every request body **and query string**. If validation fails, NestJS returns a `400 Bad Request` with detailed messages before your service code runs.

`whitelist` + `forbidNonWhitelisted` mean any field *not* in the DTO is rejected — including `duration`, which the client is **not** allowed to send.

**Derived data belongs on the server.** Duration is computed from start and end times by `calculateOtHours()` (an end before the start crosses midnight). If the client sent it, an employee could claim 12 hours for a 1-hour shift.

---

## Module 4: Analytics — Query Builder vs Repository

Reporting queries are aggregations, so the analytics module writes them as parameterized SQL (`dataSource.query(sql, params)`) rather than through the ORM. `$1`-style parameters mean user input is never interpolated into SQL.

Three rules every analytics query follows:
1. **Approved OT only.** Pending or rejected requests aren't overtime that happened.
2. **Scoped.** A supervisor only sees their own department; the shared `scope()` helper appends that filter.
3. **Timezone-aware.** "Today" and "this month" are computed in Postgres as `now() AT TIME ZONE $tz` using `APP_TIMEZONE`, not the server's UTC clock — otherwise late-evening OT would land on the wrong day.

Time series use `generate_series` to produce every month/day in the range and `LEFT JOIN` the data onto it, so empty periods come back as zeros and the chart's x-axis is always complete and in order — including across a year boundary:

```sql
WITH months AS (
  SELECT generate_series(
    date_trunc('month', (now() AT TIME ZONE $2)::date) - make_interval(months => 5),
    date_trunc('month', (now() AT TIME ZONE $2)::date),
    interval '1 month')::date AS month_start
)
SELECT ... FROM months m LEFT JOIN (...approved records...) r ON date_trunc('month', r.date) = m.month_start
```

**Each analytics endpoint answers a specific business question:**
- `getDashboardStats()` — "What's the overall health of OT right now?"
- `getOtByDepartment()` — "Which department uses the most OT?"
- `getMonthlyOtStats()` — "Is OT increasing month-over-month?" (rolling last 6 months)
- `getTopOtUsers(limit)` — "Who has the most approved OT this month, and how does that compare with last month?"
- `getOtTrends(days)` — "What does OT look like over the last N days?"

---

## Module 5: main.ts — Where It All Starts

```typescript
const app = await NestFactory.create(AppModule);
configureApp(app);   // prefix, helmet, CORS, trust proxy, validation, error filter
await app.listen(process.env.PORT ?? 3001);
```

`configureApp()` lives in `app.setup.ts` so the end-to-end tests boot the app exactly the way production does.

- The global prefix `api` is why the frontend calls `/api/auth/login`.
- **CORS:** in production the browser never makes a cross-origin call — Netlify proxies `/api/*` to Render, so it's same-origin. Only origins listed in `CORS_ORIGINS` are allowed.
- **`trust proxy`:** requests arrive via Netlify's proxy and Render's load balancer (`TRUST_PROXY_HOPS=2`), so Express must be told how many hops to trust to see the real client IP for rate limiting.
- **`helmet()`** adds standard security headers.
- **`GET /api/health`** checks the database; Render uses it as its health check.

---

## The Architecture Pattern: Why It Works

The **Controller → Service → Repository** separation serves a purpose:

| Layer | Responsibility | Knows About |
|---|---|---|
| Controller | Route handling, HTTP in/out | HTTP requests, DTOs |
| Service | Business logic | Entities, other services |
| Repository (TypeORM) | Database access | SQL, tables |

If you wanted to switch from PostgreSQL to MySQL, you'd only change the repository layer. If you wanted to expose the same business logic via a WebSocket instead of REST, you'd add a new controller — the service stays the same. Each layer is independently replaceable.

---

## Key Things to Internalize

1. **Secure by default.** Guards are global; a new route is protected unless you deliberately mark it `@Public()`.

2. **The JWT proves identity; the database decides access.** The token carries only the user id; the current role, department and active flag are read on every request.

3. **Authorization is about data, not just roles.** Department scoping, ownership and "not your own approval" are checked in services — and covered by end-to-end tests in `test/app.e2e-spec.ts`.

4. **DTOs are your contract.** They define exactly what data is acceptable at each endpoint. The validator rejects garbage before it reaches your service.

5. **Services own the business rules.** Controllers should be thin — they just map HTTP concepts (body, params, query) to service calls and return results.

6. **Migrations own the schema.** Entities describe the shape; migrations create it; constraints in the database enforce it.
