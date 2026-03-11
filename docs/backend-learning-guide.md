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
Guards (AuthGuard, RolesGuard) — Is this person allowed in?
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
2. `LocalStrategy` intercepts this and calls `AuthService.validateUser(email, password)`
3. `validateUser` looks up the user by email, then uses **bcrypt** to compare the submitted password against the hashed one stored in the DB — bcrypt never decrypts, it re-hashes and compares
4. If valid, `AuthService.login()` creates a **JWT payload**: `{ sub: userId, email, role, departmentId }`
5. `JwtModule.sign()` turns that payload into a signed token string (e.g. `eyJhbGciOiJIUzI1...`)
6. The token is returned to the frontend, which stores it and sends it with every future request in the `Authorization: Bearer <token>` header

**Why JWT?** The server doesn't store sessions. The token itself *contains* the user's identity. This makes the backend **stateless** — any server instance can validate any token without checking a database.

### How Protected Routes Work

Every protected route has `@UseGuards(AuthGuard('jwt'))`. When a request hits that route:

1. NestJS sees the guard and runs `JwtStrategy.validate(payload)`
2. The strategy extracts the token from the header, verifies the signature with the secret key, and decodes the payload
3. The decoded payload (user info) gets attached to `request.user`
4. Your controller can then pull `@Request() req` and read `req.user.id`, `req.user.role`, etc.

### Role-Based Access Control (RBAC)

Two levels of protection exist:
- **AuthGuard('jwt')** — "Are you logged in?"
- **RolesGuard** — "Are you the *right kind* of user?"

The `@Roles(UserRole.SUPERVISOR)` decorator is just a metadata tag. `RolesGuard` reads that tag via `Reflector`, then compares it to `req.user.role`. If the user is a `REGULAR` employee trying to hit a supervisor-only route, the guard returns `false` and NestJS automatically sends a `403 Forbidden`.

```typescript
@Roles(UserRole.SUPERVISOR)  // sets metadata
@UseGuards(AuthGuard('jwt'), RolesGuard)  // guards read that metadata
```

**Why separate guards?** Single Responsibility Principle — auth guard handles *authentication*, roles guard handles *authorization*. They can be combined or used independently.

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

**Why `synchronize: false`?** TypeORM can auto-create tables from your entities. That's fine in development but **dangerous in production** — a typo in an entity could drop a column and destroy data. So the schema is managed explicitly via `database/init.sql` and migrations. You're in control.

**The `approvedBy` field on OtRecord** stores the `userId` of the supervisor who approved/rejected it. This creates an audit trail — you always know who made the decision.

---

## Module 3: OT Records — The Core Business Logic

This is the most complex module because it serves *two different types of users* with very different needs.

### The Dual-User Problem

An **employee** should only see and create their own records. A **supervisor** needs to see everyone's records and change their status. The same entity (`OtRecord`) serves both, but the access patterns are totally different.

This is handled by having **separate endpoints for each role**:

- `GET /ot-records/my-records` — uses `req.user.id` from the JWT, always filters to that user only. A user *cannot* pass someone else's ID here.
- `GET /ot-records` — supervisor-only, returns all records

**Why is `my-records` declared before `/:id`?** Route order matters. If `:id` came first, NestJS would try to match `my-records` as an ID (a string, not a number). By putting `my-records` first, NestJS correctly matches it as a literal path.

### Status Flow

OT records follow a simple state machine:

```
PENDING  →  APPROVED
         →  REJECTED
```

The `PATCH /ot-records/:id/status` endpoint is supervisor-only and accepts `{ status: 'approved' | 'rejected' }`. When called, the service also sets `approvedBy` to the supervisor's `userId` from the JWT — the frontend never sends who approved it, the server derives it from the token. This prevents spoofing.

### Validation with DTOs

The `CreateOtRecordDto` is a class with decorators from `class-validator`:

```typescript
@IsNumber({ maxDecimalPlaces: 2 })
@Min(0.25)
@Max(12)
duration: number;
```

The global `ValidationPipe` in `main.ts` automatically runs these validators on every incoming request body. If validation fails, NestJS returns a `400 Bad Request` with detailed error messages before your service code ever runs. You never have to write `if (!body.duration)` checks in your service.

`whitelist: true` means any fields *not* in the DTO are silently stripped — you can't inject extra fields that weren't expected.

---

## Module 4: Analytics — Query Builder vs Repository

The analytics module uses two approaches depending on whether the query needs to traverse entity relationships.

**QueryBuilder** for queries that JOIN across entities (e.g. OT records → users → departments):
```typescript
this.otRecordRepo.createQueryBuilder('otRecord')
  .select('SUM(otRecord.duration)', 'totalHours')
  .addSelect('COUNT(otRecord.id)', 'count')
  .leftJoin('otRecord.user', 'user')
  .leftJoin('user.department', 'department')
  .groupBy('department.id')
  .where('otRecord.status = :status', { status: 'approved' })
  .getRawMany()
```

The `leftJoin` chains are how you traverse relationships in a query — it's the TypeORM equivalent of SQL `JOIN`. The `:status` syntax is a **parameterized query** — TypeORM never interpolates user input directly into SQL strings, which prevents SQL injection.

**Raw SQL** (`repository.query()`) for date-range aggregations on a single table. TypeORM's QueryBuilder can be unreliable when comparing JavaScript `Date` objects against PostgreSQL `date` columns, so these use `$1`-style parameterized raw queries instead:

```typescript
this.otRecordRepo.query(
  `SELECT EXTRACT(MONTH FROM date)::int AS month,
          COUNT(id)::int AS count,
          COALESCE(SUM(duration), 0)::float AS "totalHours"
   FROM ot_records
   WHERE date >= $1 AND status = 'approved'
   GROUP BY EXTRACT(MONTH FROM date)
   ORDER BY month ASC`,
  [sixMonthsAgo],
)
```

Both approaches still use parameterized queries — no SQL injection risk.

**Each analytics endpoint answers a specific business question:**
- `getDashboardStats()` — "What's the overall health of OT right now?"
- `getOtByDepartment()` — "Which department uses the most OT?"
- `getMonthlyOtStats()` — "Is OT increasing month-over-month?" (rolling last 6 months)
- `getTopOtUsers(limit)` — "Who are the highest OT claimants?"
- `getOtTrends(days)` — "What does OT look like over the last N days?"

---

## Module 5: main.ts — Where It All Starts

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');          // all routes become /api/...
app.enableCors({ origin: [...] });    // allow frontend to call the backend
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
await app.listen(3001);
```

The global prefix `api` is why all routes in the frontend call `/api/auth/login` instead of `/auth/login`. This is a clean way to namespace your API — you could serve both a frontend and an API from the same server without route conflicts.

`enableCors` is critical for browsers — without it, the browser blocks cross-origin requests (frontend on port 3000 calling backend on port 3001 counts as cross-origin).

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

1. **Guards run before your code.** You never need to check `if (!req.user)` inside a controller that has `@UseGuards(AuthGuard('jwt'))`.

2. **The JWT is your identity.** The user's role and ID live in the token. You don't make a DB call to check who someone is on every request.

3. **DTOs are your contract.** They define exactly what data is acceptable at each endpoint. The validator rejects garbage before it reaches your service.

4. **Services own the business rules.** Controllers should be thin — they just map HTTP concepts (body, params, query) to service calls and return results.

5. **`synchronize: false` means you own the schema.** The entities describe the shape; the database actually enforces it via `init.sql` and migrations.
