# OT Tracker

A full-stack overtime tracking application built with React, TypeScript, NestJS, and PostgreSQL.

## Live Demo

**https://ot-management.netlify.app**

Sign in with any of these sample accounts. They all use the password `password123`:

| Role | Email | What you'll see |
|------|-------|-----------------|
| Admin | `admin@company.com` | Every department, plus user management |
| Supervisor | `supervisor@company.com` | The Engineering dashboard, and approving Engineering requests |
| Employee | `employee@company.com` | Your own requests and the Submit OT form |

- The demo data is reset on the 1st of every month, so anything you change is temporary.
- The backend runs on a free instance that sleeps when idle, so the first request can take up to a minute.

## Features

### For Employees
- Submit overtime requests (the duration is calculated from the start and end times)
- View personal OT history and status, and edit or delete requests while they're pending
- Track approved hours overall and this month

### For Supervisors
- Dashboard for their department: monthly totals, daily trends, hours by department, top OT this month vs last month
- Approve or reject pending requests from their department (not their own)
- Search requests by employee, department or reason

### For Admins
- Everything supervisors can do, across all departments
- Create users, edit roles and departments, deactivate accounts, and reset passwords (users must change a temporary password on first login)

## Tech Stack

### Frontend
- **React 18** with TypeScript and **Vite**
- **Material-UI (MUI)** with a shared theme (`src/theme/theme.ts`)
- **TanStack Query** for server data, **Zustand** for the login session
- **React Router**, **Recharts**, **Day.js**

### Backend
- **NestJS** with TypeScript
- **PostgreSQL** via **TypeORM**, with migrations
- **JWT** authentication (Passport), **bcrypt** password hashing
- **Jest** + **Supertest** for unit and end-to-end tests

### DevOps
- **Docker Compose** for local development (Nginx serves the frontend)
- **GitHub Actions**: CI on every pull request, deploys on release tags

### Hosting
- **Frontend:** [Netlify](https://www.netlify.com/), which also proxies `/api/*` to the backend
- **Backend:** [Render](https://render.com/) (free web service, configured in `render.yaml`)
- **Database:** [Neon](https://neon.tech/) serverless Postgres (free plan, AWS Singapore). The demo data is refreshed monthly by `.github/workflows/refresh-demo-data.yml`.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+, or Docker

### Option 1: Docker Compose

```bash
docker compose up -d --build              # the backend applies migrations on startup
docker compose exec backend npm run seed  # optional: load sample data
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

### Option 2: Manual Setup

1. Create a PostgreSQL database named `ot_tracker`.
2. Start the backend. Migrations run automatically when it starts:
   ```bash
   cd backend
   npm install
   cp ../.env.example .env   # then edit the database settings
   npm run start:dev
   ```
3. Optionally load sample data: `npm run seed:dev`
4. Start the frontend. Vite proxies `/api` to `localhost:3001`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Sample Accounts

The seed script creates the same 16 sample users as the [live demo](#live-demo), all with the password `password123`.
It refuses to run when `NODE_ENV=production`.

## API Endpoints

Every endpoint except `POST /api/auth/login` and `GET /api/health` needs an `Authorization: Bearer <token>` header.
Users who still have a temporary password can only call `GET /api/auth/me` and `POST /api/auth/change-password`.

### Auth
- `POST /api/auth/login`: log in (rate-limited to 5 attempts per minute per account)
- `GET /api/auth/me` / `PATCH /api/auth/me`: view or update your own profile
- `POST /api/auth/change-password`: requires `currentPassword`, unless you're replacing a temporary password

### OT Records
- `POST /api/ot-records`: submit a request (`date`, `startTime`, `endTime`, `reason`, optional `comments`)
- `GET /api/ot-records/my-records`: your records, paginated (`page`, `limit` up to 100)
- `GET /api/ot-records/my-summary`: your totals across all records
- `PATCH /api/ot-records/:id` / `DELETE /api/ot-records/:id`: change or delete your own pending record (admins can delete any record)
- `GET /api/ot-records`: supervisor+. Their department's records (admins: all), with `status`, `search`, `page` and `limit` filters
- `PATCH /api/ot-records/:id/status`: supervisor+. Approve or reject a pending record from your department (not your own)

### Analytics (supervisor+, approved OT only, scoped to the supervisor's department)
- `GET /api/analytics/dashboard`: totals
- `GET /api/analytics/by-department`: hours per department
- `GET /api/analytics/monthly`: the last 6 months including this one
- `GET /api/analytics/top-users?limit=`: this month, with the change from last month
- `GET /api/analytics/trends?days=`: daily totals

### Users & Departments
- `GET /api/users`: supervisor+ (a supervisor sees their own department)
- `GET /api/users/:id`, `POST /api/users`, `PATCH /api/users/:id`, `POST /api/users/:id/reset-password`: admin only
- `GET /api/departments`: any signed-in user

### Health
- `GET /api/health`: checks the database connection. Point an uptime monitor at it to keep the free Render instance awake.

## Database

The schema is defined by the TypeORM migrations in `backend/src/database/migrations/`, which run automatically when the backend starts.

- **departments**: `id`, `name` (unique), `description`
- **users**: `id`, `email` (unique, case-insensitive), `password` (bcrypt hash, never returned by the API), `first_name`, `last_name`, `role` (`regular` | `supervisor` | `admin`), `department_id`, `is_active`, `must_change_password`
- **ot_records**: `id`, `user_id`, `date`, `start_time`, `end_time`, `duration` (hours, 0.25–12, computed by the server), `reason`, `status` (`pending` | `approved` | `rejected`), `approved_by`, `comments`

### Changing the schema

```bash
cd backend
npm run migration:generate -- src/database/migrations/DescribeTheChange   # from entity changes
npm run migration:create -- src/database/migrations/DescribeTheChange     # or an empty one
npm run migration:run      # apply (this also happens on app start)
npm run migration:revert   # undo the last one
npm run migration:show     # list applied/pending
```

## Development

### Backend
```bash
cd backend
npm run start:dev   # hot reload
npm run lint        # ESLint (lint:fix to auto-fix)
npm run typecheck
npm test            # unit tests
npm run test:e2e    # end-to-end tests; needs a Postgres database, see below
```

The end-to-end tests **drop and recreate** the database named by `DATABASE_NAME` (default `ot_tracker_test`), so point them at a throwaway database:
```bash
docker run -d --name ot-test-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ot_tracker_test -p 5433:5432 postgres:15-alpine
DATABASE_PORT=5433 npm run test:e2e
```

### Frontend
```bash
cd frontend
npm run dev     # development server
npm run lint
npm run build   # type-check + production build
```

## Security

- Every route requires a JWT unless it's explicitly marked public, and the user is re-checked on every request, so deactivating someone or changing their role takes effect immediately
- Role checks, department scoping for supervisors, and ownership checks on OT records
- Users with a temporary password are locked out until they change it
- bcrypt password hashes that are never returned by the API; temporary passwords are cryptographically random
- Login rate limiting, `helmet` security headers, and validation of every request body and query string

## Deployment

| Part | Host | How it deploys |
|------|------|----------------|
| Frontend | Netlify | Built and deployed by GitHub Actions on release tags |
| Backend | Render | GitHub Actions triggers a Render deploy hook on release tags; migrations run on boot |
| Database | Neon | Managed Postgres |

### Releasing
Merge to `main`, then push a semver tag. CI runs first, and the deploy only continues if it passes:
```bash
git tag -a v1.2.3 -m "v1.2.3"
git push origin v1.2.3
```

Required GitHub secrets: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `RENDER_DEPLOY_HOOK_URL`.

### Environment Variables
Set these in the Render dashboard (see `.env.example` for descriptions):

```env
DATABASE_HOST=your-neon-host.neon.tech
DATABASE_PORT=5432
DATABASE_NAME=neondb
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-secure-password
DATABASE_SSL=true            # Neon requires SSL
JWT_SECRET=a-long-random-value   # required; e.g. `openssl rand -base64 48`
NODE_ENV=production
APP_TIMEZONE=Asia/Manila     # decides what "today" and "this month" mean
TRUST_PROXY_HOPS=2           # Netlify proxy + Render load balancer
```

The frontend needs no environment variables: it calls `/api`, which Netlify proxies to Render (see `frontend/netlify.toml`).

### Setting Up a New Database
Create an empty database and point the backend at it. The migrations create the schema on the first start. Then create the first admin account yourself (there's no sign-up), for example:

```bash
# generate a hash for the initial password (run inside backend/)
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" 'a-strong-password'
```
```sql
INSERT INTO departments (name) VALUES ('Engineering');
INSERT INTO users (email, password, first_name, last_name, role, department_id, must_change_password)
VALUES ('you@example.com', '<hash>', 'First', 'Last', 'admin', 1, true);
```

## Contributing

1. Create a feature branch: `git checkout -b feature-name`
2. Commit your changes and push the branch
3. Open a pull request. CI must pass, and `main` requires an approving review

## Support

For support, please create an issue in the repository or contact the development team.
