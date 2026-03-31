# Copilot Instructions

## Build & Run Commands

```bash
npm run dev              # Vite dev server (frontend only) → http://localhost:5173
npx vercel dev           # Full local dev (frontend + serverless API) → http://localhost:3000
npm run build            # Production build → /dist
npm run preview          # Preview production build
npm run generate-hash -- "password"   # Generate bcrypt hash for ADMIN_PASSWORD_HASH
npm run build-db         # Scrape Jaquar catalog → public/jaquar-products.json
```

There are no tests or linters configured in this project.

## Architecture

This is a **React 18 + Vite** frontend with **Vercel Serverless Functions** as the backend, using **Supabase (PostgreSQL)** for storage. It prints product labels on A4 sticker sheets (12 labels per sheet, 2×6 grid, each 105×48mm).

### Frontend (`src/`)

- **`App.jsx`** — React Router v7 with two routes: `/` (Landing) and `/app` (Dashboard, protected)
- **`Dashboard.jsx`** — Main orchestrator. Holds all label state, passes it down via props. Split layout: 42% editor / 58% preview.
- **`LabelEditor.jsx`** — Form for editing 12 labels with Jaquar product search (uses preloaded static JSON from `/public/jaquar-products.json`)
- **`LabelPreview.jsx`** — A4 preview with print/PDF toolbar and calibration controls
- **`LabelSheet.jsx`** — Renders the 105×48mm label grid with QR codes and brand logos
- **`TemplateManager.jsx`** — Modal for cloud template CRUD; falls back to localStorage if Supabase is unavailable
- **`contexts/AuthContext.jsx`** — JWT auth state (token in localStorage, verified on mount via `/api/auth/verify`)
- **`services/api.js`** — Axios client with request interceptor that auto-attaches Bearer token from localStorage

### Backend (`api/`)

Vercel Serverless Functions. Each file exports a default `(req, res)` handler.

- **`api/_lib/db.js`** — Shared Supabase client singleton with CRUD helpers (`listTemplates`, `createTemplate`, etc.)
- **`api/auth/login.js`** — POST: validates against `ADMIN_EMAIL` + bcrypt-hashed password, returns JWT (7-day expiry)
- **`api/auth/verify.js`** — GET: validates Bearer token
- **`api/templates/index.js`** — GET (list) / POST (create) with JWT auth
- **`api/templates/[id].js`** — GET / PUT / DELETE by UUID
- **`api/jaquar-search.js`**, **`api/jaquar-product.js`**, **`api/jaquar-price.js`** — Product catalog proxy endpoints

Auth middleware is a `verifyToken(req)` helper inlined in each protected endpoint (not shared middleware).

### Data Flow

```
Dashboard (labels state)
  → LabelEditor (edits labels via onChange callbacks)
  → LabelPreview → LabelSheet (renders A4 grid)
  → TemplateManager (saves/loads label_data to Supabase)
```

## Label Data Model

Each label has 7 fields. A sheet is always an array of 12:

```javascript
{
  product: '',       // Product name
  code: '',          // SKU/product code (also used for QR)
  price: '',         // MRP in ₹
  manufacturer: '',  // Brand name
  logoUrl: '',       // Brand logo URL
  description: '',   // Product description
  productUrl: '',    // URL encoded into QR code
}
```

Stored in Supabase as `label_data JSONB` on the `templates` table.

## Key Conventions

### Error Handling Pattern

All API calls use this pattern consistently:

```javascript
try {
  await apiCall();
  toast.success('Done');
} catch (err) {
  if (err?.response?.data?.error) toast.error(err.response.data.error);
  else if (err?.code === 'ERR_NETWORK') toast.error('Network error');
  else toast.error('Failed. Try again.');
}
```

### CORS in Serverless Functions

Every API endpoint must set these headers before any logic:

```javascript
res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
res.setHeader('Access-Control-Allow-Methods', '...');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
if (req.method === 'OPTIONS') return res.status(200).end();
```

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js` — uses CSS-first config)
- Dark theme with saffron accent (`#f97316`). Theme variables are CSS custom properties in `src/index.css`
- Custom utility classes: `.btn-saffron`, `.btn-ghost`, `.input-dark`, `.glass` (glassmorphism)
- Print CSS in `src/index.css` under `@media print` — hides everything except `.print-root`

### Print & PDF

- **Browser print**: `window.print()` triggers `@media print` CSS that isolates the label sheet
- **PDF export**: Clones the sheet off-screen at full A4 size, captures with `html2canvas`, then writes to `jsPDF`. Both libraries are dynamically imported.
- QR codes are generated via the `qrcode` library and cached in an in-memory LRU map (max 50)

### State Management

- No Redux/Zustand — all state is local (`useState`) lifted to `Dashboard.jsx`
- Auto-save drafts to `localStorage` every 500ms on label change
- `TemplateManager` gracefully falls back to localStorage when Supabase is unavailable

### Environment Variables

Server-side (Vercel): `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
Client-side (Vite): `VITE_API_URL` (optional, defaults to relative URLs)

## Database Setup

Run `scripts/setup-db.sql` in the Supabase SQL Editor. It creates the `templates` table with UUID primary key, JSONB `label_data`, and auto-updating timestamps. RLS is disabled — auth is handled at the API layer via JWT.
