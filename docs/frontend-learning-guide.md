# OT Tracker Frontend — How It Was Built and Why

---

## The Big Picture: Why This Stack?

| Tool | Role | Why |
|---|---|---|
| **React** | UI rendering | Component-based — UI is a function of state |
| **TypeScript** | Type safety | Catches bugs at compile time, not runtime |
| **Vite** | Dev server + bundler | Extremely fast hot reload vs. Webpack/CRA |
| **Material-UI (MUI)** | Component library | Pre-built, accessible, themeable UI components |
| **Zustand** | Global state | Simpler than Redux, no boilerplate |
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

`App.tsx` does three things:

1. **Sets up the MUI theme** — custom colors, fonts, and component overrides that apply globally
2. **Sets up the date picker locale** — `LocalizationProvider` wraps the app so MUI date/time pickers work
3. **Defines all routes** — which URL maps to which page component

```tsx
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

## State Management: Why Zustand?

The app has state that multiple components need to share. For example, after login, the `Navbar`, every page, and every API call all need to know who the current user is. Passing this as props from a parent to every child would be a nightmare ("prop drilling").

**Zustand** is a global store — a central place to read and write shared state. Any component can access it directly without prop drilling.

### The Three Stores

#### `authStore.ts` — Who Is the User?

```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login(credentials): Promise<void>,
  logout(): void,
}
```

This store persists to **localStorage** — if you refresh the page, you stay logged in. Zustand's `persist` middleware handles this automatically. On app load, it rehydrates from localStorage before the first render.

**Why use `fetch` for login instead of `apiClient` (Axios)?** The Axios client has an interceptor that reads the token from this store. At login time, the token doesn't exist yet, so using Axios could create a circular dependency. Using raw `fetch` for the initial login avoids that.

#### `otStore.ts` — OT Record Data

```typescript
{
  otRecords: OtRecord[],     // supervisor view: all records
  myOtRecords: OtRecord[],   // employee view: personal records only
  isLoading: boolean,
  error: string | null,
  fetchOtRecords(): Promise<void>,
  fetchMyOtRecords(): Promise<void>,
  createOtRecord(data): Promise<void>,
  updateOtStatus(id, status): Promise<void>,
  deleteOtRecord(id): Promise<void>,
}
```

Two separate arrays exist because supervisors and employees see fundamentally different data sets. When a supervisor approves a record, the store updates `otRecords` locally — no need to re-fetch everything from the server. This is called **optimistic UI** (you update the UI immediately, trusting the server call succeeded).

#### `analyticsStore.ts` — Dashboard Charts

Holds the aggregated data for each chart. Each piece of analytics data is fetched independently so they can load in parallel:

```typescript
Promise.all([
  fetchDashboardStats(),
  fetchDepartmentStats(),
  fetchMonthlyStats(),
  fetchTopUsers(),
  fetchOtTrends(),
])
```

`Promise.all` fires all five requests simultaneously instead of one after another. The dashboard loads as fast as the slowest single request rather than the sum of all of them.

---

## API Client: The HTTP Layer

`utils/apiClient.ts` creates a single Axios instance used by all stores:

```typescript
const apiClient = axios.create({ baseURL: '/api' });

// Before every request: attach the JWT token
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After every failed response: handle expired sessions
apiClient.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    authStore.getState().logout();
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

**Why interceptors?** Without them, every single API call would need to manually attach the token and manually handle 401 errors. With interceptors, you write that logic once and it runs automatically on every request/response.

**Why `/api` as the base URL?** In development, Vite's dev server proxies `/api` to `http://localhost:3001` — so the frontend never needs to know the backend's real address. In production, this is handled by the server configuration. The frontend code never changes.

---

## Routing: How Navigation Works

React Router gives the app **client-side navigation** — clicking a link changes the URL and swaps components without the browser loading a new page. This makes navigation feel instant.

### Route Protection

The `ProtectedRoute` component is a wrapper that guards routes:

```tsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}
```

Every page that requires login is wrapped in `<ProtectedRoute>`. If `isAuthenticated` is false, the user is redirected to `/login` before the page renders.

### Role-Based Redirects

Beyond authentication, some routes are role-specific. Rather than a separate `RoleRoute` component, `App.tsx` uses inline conditional redirects:

```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    {user?.role === UserRole.SUPERVISOR
      ? <SupervisorDashboard />
      : <Navigate to="/my-ot" />}
  </ProtectedRoute>
} />
```

An employee who navigates to `/dashboard` gets silently redirected to `/my-ot`. They can't access supervisor pages — not because the UI hides the buttons (though it does), but because the routing itself redirects them away.

**Defense in depth:** the Navbar shows different links based on role, AND the routes themselves redirect. Either layer alone is enough, but both together are more robust.

---

## Components: Building Blocks

### `Navbar.tsx`

The Navbar reads from `authStore` to know who is logged in and shows role-appropriate navigation links. A supervisor sees "Dashboard" and "OT Management"; an employee sees "My OT Records" and "Submit OT".

This is a perfect example of **state-driven UI** — the Navbar doesn't receive props telling it what to show. It reads global state directly.

### `DashboardStats.tsx`

A pure **display component** — it receives data as props and renders stat cards. It has no internal state and makes no API calls. This is the ideal form of a component: given the same props, it always renders the same output. Easy to reuse, easy to test.

---

## Pages: The Main Views

### `Login.tsx` — The Entry Point

The login page manages its own local state (email, password, error, showPassword) using React's `useState`. This state doesn't need to be global — it only matters while the form is visible.

```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
```

On submit, it calls `authStore.login()`, which handles the API call. If it succeeds, the store updates `isAuthenticated = true` and the component navigates to `/dashboard`. If it fails, the caught error is shown to the user.

### `CreateOtRecord.tsx` — Forms and Derived State

The most form-heavy page. Key ideas:

**Derived state:** `duration` is never stored separately — it's calculated on the fly from `startTime` and `endTime` using dayjs. Derived values should never be stored in state; compute them from existing state instead.

```typescript
const duration = endTime && startTime
  ? Math.round(endTime.diff(startTime, 'minute') / 60 * 100) / 100
  : 0;
```

**Validation on submit, not on change:** Errors only show after the user tries to submit, not while they're typing. This avoids showing "start time required" the moment the form loads.

**Controlled components:** Every input's value is tied to state. React owns the input value — you can't type something that React doesn't know about. This makes the form fully serializable and resettable.

### `MyOtRecords.tsx` — The Employee View

Fetches `myOtRecords` from the OT store on mount using `useEffect`:

```typescript
useEffect(() => {
  fetchMyOtRecords();
}, []);  // empty array = run once when component mounts
```

**Why not fetch in the store?** The store holds data, but the component decides *when* to fetch it. This separation means the store can be reused across components — the component is in charge of its own data lifecycle.

**Summary statistics** at the top of the page are computed from `myOtRecords` directly — no separate API call needed:

```typescript
const approvedHours = myOtRecords
  .filter(r => r.status === OtStatus.APPROVED)
  .reduce((sum, r) => sum + Number(r.duration), 0);
```

### `OtRecordManagement.tsx` — The Supervisor View

This page manages a local `selectedRecord` state for the detail dialog. When a supervisor clicks "View Details", the record is stored locally and the dialog opens. This is appropriate local state — it doesn't need to live in the global store because no other component cares about it.

Approve/Reject actions call `updateOtStatus()` from the store, which patches the record on the server and updates the `otRecords` array in place. The table re-renders automatically because Zustand triggers a re-render when store state changes.

### `SupervisorDashboard.tsx` — Charts and Analytics

Each chart uses a Recharts component (`BarChart`, `PieChart`, `LineChart`). Recharts is built for React — you compose charts the same way you compose components:

```tsx
<BarChart data={monthlyStats}>
  <XAxis dataKey="monthName" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="count" name="Requests" fill="#1976d2" />
  <Bar dataKey="totalHours" name="Hours" fill="#42a5f5" />
</BarChart>
```

**Data transformation before rendering:** Raw API data (month numbers like `1`, `2`, `3`) gets mapped to display values (`'Jan'`, `'Feb'`, `'Mar'`) before being passed to the chart. Charts shouldn't know about your data format — you transform it into the shape they expect.

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

In production, a real reverse proxy (Nginx) does the same job.

---

## The Data Flow: A Complete Example

Trace what happens when an employee submits an OT request:

```
1. User fills out CreateOtRecord form, clicks Submit
2. Component validates: date not in future, end > start, duration 0.25-12
3. Component calls otStore.createOtRecord(formData)
4. Store calls apiClient.post('/ot-records', formData)
5. Axios interceptor attaches Bearer token to request header
6. Backend receives request, JwtAuthGuard validates token
7. ValidationPipe checks CreateOtRecordDto rules
8. OtRecordsService creates record in DB with status=PENDING
9. Backend returns the new OtRecord
10. Store pushes new record into myOtRecords array
11. React re-renders MyOtRecords (if it was visible) automatically
12. Component shows success message, resets form
```

Every step is handled by a dedicated layer. The component doesn't know about HTTP. The store doesn't know about form validation. The API client doesn't know about business rules. Each piece does one thing.

---

## Key Things to Internalize

1. **State drives the UI.** You never manually update the DOM. You update state, and React figures out what changed.

2. **Local state vs. global state.** If only one component needs it, use `useState`. If multiple components share it, put it in a Zustand store.

3. **Interceptors are middleware for HTTP.** Write auth token logic once, apply everywhere.

4. **Derived values are computed, not stored.** Calculate `duration` from `startTime` and `endTime` — don't maintain a third `useState` that can get out of sync.

5. **`useEffect` controls when you fetch.** The empty dependency array `[]` means "run once on mount." Dependencies in the array mean "re-run when these change."

6. **Route protection has two layers.** The Navbar hides links visually; the route itself redirects if someone navigates directly. Both matter.

7. **The Vite proxy is a development convenience.** In production, a real server handles routing. The frontend code stays identical.
