# OT Tracker Frontend — How It Was Built and Why

---

## The Big Picture: Why This Stack?

| Tool | Role | Why |
|---|---|---|
| **React** | UI rendering | Component-based — UI is a function of state |
| **TypeScript** | Type safety | Catches bugs at compile time, not runtime |
| **Vite** | Dev server + bundler | Extremely fast hot reload vs. Webpack/CRA |
| **Material-UI (MUI)** | Component library | Pre-built, accessible, themeable UI components |
| **TanStack Query** | Server data | Fetching, caching, loading/error states and refetching |
| **Zustand** | Session state | Tiny global store for "who is logged in" |
| **Axios** | HTTP client | Interceptors for auth tokens and error handling |
| **React Router v6** | Client-side routing | Navigate between pages without full page reloads |
| **Recharts** | Data visualization | Chart library built for React |
| **dayjs** | Date/time manipulation | Lightweight alternative to moment.js |

---

## How React Works (The Mental Model)

React's core idea: **UI is a function of state**.

```
UI = f(state)
```

When state changes, React re-renders the affected components automatically. You don't manually touch the DOM — you just update state and React figures out what changed.

A **component** is just a function that returns JSX (HTML-like syntax):

```tsx
function MyButton({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

React apps are trees of nested components. Data flows **down** via props; events flow **up** via callback functions.

---

## Entry Point: How the App Starts

### `index.html` → `main.tsx` → `App.tsx`

```
Browser loads index.html
    ↓ <div id="root"> is the mount point
    ↓ loads /src/main.tsx
    ↓ ReactDOM.createRoot(#root).render(<App />)
    ↓ App.tsx takes over
```

`main.tsx` is minimal on purpose — it just mounts the app. All real setup lives in `App.tsx`.

### `App.tsx` — The Router and Theme

`App.tsx` does four things:

1. **Provides the query client** — `QueryClientProvider` (TanStack Query's cache, see below)
2. **Applies the MUI theme** from `theme/theme.ts` — colors, fonts and component overrides
3. **Sets up the date picker locale** — `LocalizationProvider` so MUI date/time pickers work
4. **Defines all routes** — which URL maps to which page component

```tsx
<QueryClientProvider client={queryClient}>
<ThemeProvider theme={theme}>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        ...
      </Routes>
    </BrowserRouter>
  </LocalizationProvider>
</ThemeProvider>
</QueryClientProvider>
```

**Why nest providers like this?** Each provider adds something to the React context — a global "environment" that child components can access. MUI components need the theme, date pickers need the locale, protected routes need auth state. The order matters: outer providers are available to inner ones.

---

## TypeScript Types: The Contract Between Frontend and Backend

All shared data shapes live in `types/index.ts`. These mirror the backend's entities and DTOs exactly.

**Why have types at all?** When the backend returns a `User` object, TypeScript ensures you don't accidentally access `user.name` when the field is actually `user.firstName`. The compiler catches this before you ship.

```typescript
interface OtRecord {
  id: number;
  userId: number;
  date: string;
  status: OtStatus;       // can only be 'pending' | 'approved' | 'rejected'
  user?: User;            // optional — not always included in API response
  // ...
}
```

**The `?` (optional) fields** reflect reality: sometimes the backend returns the full nested `user` object inside an `OtRecord`, sometimes it doesn't (depends on which endpoint you called). The type captures both possibilities.

---

## Two Kinds of State

The most important architectural decision in the frontend is separating two kinds of state:

| Kind | Example | Where it lives |
|---|---|---|
| **Server state** — a copy of data owned by the backend | OT records, users, dashboard numbers | **TanStack Query** (`src/api/`) |
| **Client state** — owned by the browser | who is logged in, which dialog is open, form inputs | **Zustand** (`authStore`) or `useState` |

Server state is hard: it can be stale, several screens show the same data, requests fail, and after a change every affected screen must refresh. A library built for exactly this beats hand-written stores that each track `isLoading`/`error` (the old stores shared one `isLoading` flag across five parallel requests, so they overwrote each other).

### `authStore.ts` — The Session (Zustand)

```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login(credentials): Promise<User>,
  logout(): void,              // also clears the query cache
  changePassword(newPassword, currentPassword?): Promise<void>,
}
```

It persists to **localStorage**, so a refresh keeps you logged in. It holds nothing else — no records, no users list.

### `src/api/` — Server Data (TanStack Query)

Each resource has a file of hooks: `otRecords.ts`, `analytics.ts`, `users.ts`. A component asks for data declaratively:

```tsx
const { data, isPending, isError, error, refetch } = useMyOtRecords(page, 10);
```

TanStack Query handles fetching, caching (keyed by `['ot-records', 'mine', { page, limit }]`), de-duplicating identical requests, keeping the previous page visible while the next loads (`keepPreviousData`), and retrying failed requests (only network/5xx errors — retrying a 403 is pointless).

**Mutations and invalidation.** Writes use `useMutation`. On success they *invalidate* the affected queries, which refetch automatically:

```typescript
export function useUpdateOtStatus() {
  const invalidate = useInvalidateOt(); // ['ot-records'] and ['analytics']
  return useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/ot-records/${id}/status`, { status }),
    onSettled: invalidate,
  });
}
```

Approving a record therefore refreshes the list, the "My OT" summary and every dashboard chart — without any component knowing about the others. Compare that with manually patching arrays in a store and hoping every copy stays in sync.

**Totals come from the server.** "My OT" shows totals across *all* of your records via `/ot-records/my-summary`. Computing them from the page you're looking at (10 rows) would be wrong as soon as you have more than one page.

---

## API Client: The HTTP Layer

`api/client.ts` creates the single Axios instance every hook uses:

```typescript
export const apiClient = axios.create({ baseURL: '/api' });

// Before every request: attach the JWT
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After every failed response
apiClient.interceptors.response.use(undefined, (error) => {
  if (status === 401 && !isLoginRequest) useAuthStore.getState().logout();
  else if (status === 403 && message === TEMP_PASSWORD_MESSAGE) useAuthStore.getState().requirePasswordChange();
  return Promise.reject(error);
});
```

**Why interceptors?** Write auth-token and session-expiry logic once; it runs on every request. (A 401 from the login form itself is just "wrong password", so it's excluded.)

**`getErrorMessage(error)`** turns any failure into text for the user: the API's own message (e.g. "You can only review overtime from your own department"), joined validation messages, or a "can't reach the server" message. Never swallow errors silently — every mutation in the app shows its failure.

**Why `/api` as the base URL?** The frontend never knows where the backend lives. In development Vite proxies `/api` to `localhost:3001`; in Docker, Nginx does; in production, Netlify proxies `/api/*` to Render (`netlify.toml`). The code is identical everywhere, and the browser never makes a cross-origin request.

---

## Routing: How Navigation Works

React Router gives the app **client-side navigation** — changing the URL swaps components without reloading the page.

### Route Protection

`ProtectedRoute` redirects to `/login` when there's no session. Role-specific routes redirect inline in `App.tsx`:

```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    {isSupervisorOrAdmin ? <SupervisorDashboard /> : <Navigate to="/my-ot" replace />}
  </ProtectedRoute>
} />
```

**The UI is not the security boundary.** Hiding a button or redirecting a route is a convenience; the backend enforces every rule (roles, department scoping, ownership, the temporary-password lock) on every request. Assume anyone can call the API directly — the e2e tests do exactly that.

---

## Project Structure

```
src/
  api/          client, query client, and TanStack Query hooks per resource
  stores/       authStore (session only)
  theme/        design tokens and MUI component overrides
  types/        API data shapes
  utils/        pure helpers (formatDuration, hoursBetween, monthLabel, ...)
  components/
    common/     StatusChip, RoleChip, UserAvatar, StatCard, PageHeader, PaginationBar, EmptyState, Loading/ErrorState
    layout/     Sidebar, TopBar, BottomNav
    dashboard/  one component per chart/card
    ot/         employee OT screens (summary cards, table, list, create form)
    ot-management/  supervisor review screens (filters, table, list, details dialog, review hook)
    users/      admin user management
    profile/    settings page sections
  pages/        thin compositions that wire components to hooks
```

**Pages are thin.** A page decides layout and wires hooks to components; the components do the rendering. The old pages were 450–545 lines mixing fetching, forms, tables and dialogs, which made every change risky.

**Desktop and mobile views** of a list are separate components (`OtRecordsTable` / `OtRecordsList`) fed the same props, rather than one component full of breakpoint conditionals.

### Design Tokens Instead of Hex Codes

All colors come from `theme/theme.ts`. Components reference them by name:

```tsx
<Typography color="text.secondary" />
<Box sx={{ bgcolor: 'tint.success', color: 'success.dark' }} />
```

`tint.*` (pale backgrounds) and `series` (categorical colors for avatars/charts) are custom palette entries declared with TypeScript module augmentation so they're type-checked. Change a color once and it changes everywhere — the app previously had ~290 hard-coded hex values.

### Shared Building Blocks

- **`StatusChip` / `RoleChip`** — one definition of what "Pending" or "Admin" looks like.
- **`UserAvatar`** — color picked from the user's id, so a person keeps the same color on every screen (not their row position).
- **`LoadingState` / `ErrorState` / `EmptyState`** — every data view handles all three; an empty chart says "No data yet" instead of showing blank axes.

---

## Pages: The Main Views

### `Login.tsx`

Local `useState` for the form (email, password, error, submitting) — nobody else needs it. It calls `authStore.login()` and shows the server's message on failure, with a friendlier message for rate limiting (HTTP 429). If the user still has a temporary password it shows `ResetPasswordForm` instead of navigating — and because that flag is in the persisted store, the reset screen survives a page reload.

### `CreateOtRecord.tsx` — Forms and Derived State

**Derived state:** the duration preview is computed from the start and end times with `hoursBetween()`, never stored. It uses the same rule as the server (an end time at or before the start crosses midnight), so what you see is what gets saved.

**The client never sends derived data.** The request contains `date`, `startTime`, `endTime`, `reason` — not `duration`. The server calculates it; otherwise anyone could claim 12 hours for a 1-hour shift.

**Validation on submit, not on change**, and server errors are shown too — client-side validation is for convenience, the server is the authority.

### `MyOtRecords.tsx` — The Employee View

Two queries: `useMyOtSummary()` for the cards and `useMyOtRecords(page, 10)` for the table. No `useEffect` — the query hooks fetch when their key (the page number) changes. Pending records can be deleted after a confirmation dialog.

### `OtRecordManagement.tsx` — The Supervisor View

- **Search runs on the server** (debounced 300 ms) across all pages — filtering only the rows on screen would silently miss matches on other pages.
- Changing the tab or search resets to page 1.
- `useReviewOtRecord` tracks which rows have an approval in flight and shows failures (e.g. 409 "already approved") in a snackbar. Approve/Reject is hidden on your own records because the API forbids it.

### `SupervisorDashboard.tsx` — Charts and Analytics

Each card is its own component with its own query, so one slow or failing chart doesn't block the others. Charts use Recharts with colors read from the theme (`useTheme().palette`).

**No invented numbers.** Every figure comes from the API — the old dashboard showed hard-coded "+12%" style trends. "vs last month" in Top Users is computed by the server, and shows "New" when there's nothing to compare.

**Data transformation before rendering:** the API returns `{ year, month }`; `monthLabel()` turns that into "Sep" (or "Sep '26" when the range spans two years) before it reaches the chart.

---

## The Vite Proxy: Solving the CORS Problem in Development

In development, the frontend runs on port 3000 and the backend on port 3001. Browsers block cross-origin requests by default (CORS policy). There are two solutions:

1. Configure the backend to allow requests from port 3000 (the backend does this too, as a safety net)
2. Proxy requests through the dev server so the browser thinks everything is on port 3000

Vite's proxy is option 2:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

When the browser requests `/api/auth/login`, Vite intercepts it and forwards it to `http://localhost:3001/api/auth/login`. From the browser's perspective, it's talking to the same origin. No CORS issue.

In Docker, Nginx does the same job; in production, Netlify proxies `/api/*` to the Render backend.

---

## The Data Flow: A Complete Example

Trace what happens when an employee submits an OT request:

```
1. User fills in the form; the duration preview is derived from the times
2. On submit the component validates (date not in future, 15 min to 12 h, reason)
3. useCreateOtRecord().mutate({ date, startTime, endTime, reason })
4. apiClient.post('/ot-records', ...) — the interceptor attaches the Bearer token
5. Backend: JwtAuthGuard loads the user, ValidationPipe checks the DTO
6. OtRecordsService computes the duration and saves the record as PENDING
7. The mutation succeeds and invalidates ['ot-records'] and ['analytics']
8. Every mounted query with those keys refetches (list, summary, dashboard)
9. The form navigates to /my-ot, which shows a "submitted" snackbar
```

Each layer does one thing: the component owns the form, the hook owns the request and cache, the client owns auth headers, and the server owns the rules.

---

## Key Things to Internalize

1. **State drives the UI.** You never manually update the DOM. You update state, and React figures out what changed.

2. **Server state and client state are different problems.** Server data goes through TanStack Query; the session goes in Zustand; UI-only state stays in `useState`.

3. **Invalidate, don't hand-patch.** After a write, invalidate the affected queries and let them refetch.

4. **Derived values are computed, not stored — and not sent.** The duration is derived for display and computed again by the server.

5. **Always handle loading, error and empty.** A blank chart or a silently failed button is a bug.

6. **Use the theme, not hex codes.** Colors are tokens with names.

7. **The UI is not the security boundary.** Hiding buttons improves the experience; the backend enforces the rules.
