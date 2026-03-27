# 🏷️ Ganpati Label Print System

**Shree Ganpati Agency** — Precision A4 label printing (12 labels · 105×48mm · 2×6 grid)

A full-stack web app for printing product labels on A4 sticker sheets. Cloud-backed templates, PDF export, real-time sync.

---

## ✨ Features

- **Exact A4 layout** — 2×6 grid, 105×48mm per label, 4.5mm top/bottom margin
- **Label fields** — Product name, code, QR code, price, size, qty, manufacturer
- **Conditional fields** — Empty fields render as `______` for manual pen fill
- **Live preview** — Real-time A4 preview as you type
- **One-click print** — Browser print dialog, labels fill the page exactly
- **PDF export** — Server-side PDF via Puppeteer, stored in Supabase
- **Cloud templates** — Save/load/delete templates via Supabase PostgreSQL
- **Real-time sync** — WebSocket broadcasts across tabs/devices
- **Admin-only** — Single admin account, JWT-protected

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React + Vite + Tailwind CSS v4    |
| Backend   | Node.js + Express + WebSocket     |
| Database  | Supabase (PostgreSQL)             |
| Storage   | Supabase Storage                  |
| PDF       | Puppeteer                         |
| Auth      | JWT + bcrypt                      |

---

## 🚀 Quick Start

### 1. Supabase Setup

Create a project at [supabase.com](https://supabase.com) and run this SQL in the SQL Editor:

```sql
create table templates (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  name text not null,
  label_data jsonb not null,
  created_at timestamptz default now()
);

-- Enable RLS (optional, since backend uses service key)
alter table templates enable row level security;
```

Create a Storage bucket named **`pdfs`** (public bucket).

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=<generate a strong random string>
ADMIN_EMAIL=shreeganpatiagency.printer@admin
ADMIN_PASSWORD_HASH=<see below>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**Generate bcrypt hash for admin password:**

```bash
node scripts/generate-hash.js '@Shree_Ganpati@123'
# Copy the hash output into ADMIN_PASSWORD_HASH in .env
```

**Install & run:**

```bash
npm install
npm run dev        # development (hot reload)
npm start          # production
```

---

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env   # already configured for localhost
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Admin Login

| Field    | Value                              |
|----------|------------------------------------|
| Email    | `shreeganpatiagency.printer@admin` |
| Password | `@Shree_Ganpati@123`               |

---

## 🖨️ Print Instructions

1. Open the app and fill in label data
2. Click **🖨️ Print**
3. In the browser print dialog:
   - Paper size: **A4**
   - Margins: **None**
   - Scale: **100%**
   - Background graphics: **ON**
4. Print to your label sheet

---

## 📐 Label Layout

```
┌─────────────────────────────────────────┐
│  BRAND  #CODE            │   [QR CODE]  │
├──────────────────────────────────────────┤
│         PRODUCT NAME / DESCRIPTION       │
├──────────────────────────────────────────┤
│  Size: ____  Qty: ____   MRP: ₹____     │
├──────────────────────────────────────────┤
│  Manufacturer Name                       │
└──────────────────────────────────────────┘
         105mm × 48mm per label
```

A4 sheet = 2 columns × 6 rows = **12 labels**

---

## 📁 Project Structure

```
printer-image-generator/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express + WebSocket server
│   │   ├── routes/
│   │   │   ├── auth.js           # POST /api/auth/login
│   │   │   └── templates.js      # CRUD + PDF generation
│   │   ├── middleware/auth.js    # JWT verification
│   │   └── services/
│   │       ├── supabase.js       # Supabase client
│   │       └── pdf.js            # Puppeteer PDF engine
│   ├── scripts/generate-hash.js  # Bcrypt hash generator
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── Login.jsx          # Auth screen
        │   ├── Dashboard.jsx      # Main layout + WS sync
        │   ├── LabelEditor.jsx    # 12-label input panel
        │   ├── LabelSheet.jsx     # Printable A4 grid
        │   ├── LabelPreview.jsx   # Scaled preview + actions
        │   └── TemplateManager.jsx# Save/load templates
        ├── contexts/AuthContext.jsx
        ├── hooks/useWebSocket.js
        └── services/api.js
```

---

## 🌐 API Endpoints

| Method | Path                        | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/api/auth/login`           | Login, get JWT        |
| GET    | `/api/auth/verify`          | Verify token          |
| GET    | `/api/templates`            | List all templates    |
| POST   | `/api/templates`            | Create template       |
| GET    | `/api/templates/:id`        | Get template          |
| PUT    | `/api/templates/:id`        | Update template       |
| DELETE | `/api/templates/:id`        | Delete template       |
| POST   | `/api/templates/:id/pdf`    | Generate & store PDF  |
