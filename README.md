<div align="center">

# Shree Ganpati Agency -- Label Print System v4.0

**Precision A4 label printing with dual layouts, Jaquar product integration, cloud sync, and vector PDF export**

[![Version](https://img.shields.io/badge/Version-4.0.0-f97316?style=for-the-badge)](https://github.com/NIGHT-FURY-6023/printer-image-generator/releases)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Private-ef4444?style=for-the-badge)]()

> Print **12 or 18 labels per A4 sheet** with switchable layouts (2×6 at 105×48mm or 3×6 at 63.5×46.6mm), live preview, **instant Jaquar product search** (4,600+ products), **browser-native PDF/PNG/SVG export**, full cloud storage (drafts, history, templates), CSV import, and multi-page support. Built for Indian market hardware distribution workflows.

</div>

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Label Anatomy](#label-anatomy)
- [Export Pipeline](#export-pipeline)
- [API Routes](#api-routes)
- [Authentication Flow](#authentication-flow)
- [Project Structure](#project-structure)
- [Features](#features)
- [Whats New in v4.0](#whats-new-in-v40)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Performance](#performance)

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Browser (React SPA)"]
        LP[Landing Page] --> LG[Login]
        LG --> DB[Dashboard]
        DB --> LE[Label Editor]
        DB --> LPV[Label Preview]
        DB --> TM[Template Manager]
        LE -->|"labels[]"| LPV
        LPV --> LS[Label Sheet x12 or x18]
        LPV -->|"PDF/PNG/SVG"| EX[Export Engine<br/>html-to-image + jsPDF]
        LPV -->|"Ctrl+P"| PR[Print Portal<br/>React createPortal]
    end

    subgraph Vercel["Vercel Edge Network"]
        CDN[CDN / Static Assets]
        SF1["/api/auth/*"]
        SF2["/api/templates/*"]
        SF5["/api/drafts"]
        SF6["/api/history/*"]
        SF3["/api/jaquar-*"]
        SF4["/api/image-proxy"]
    end

    subgraph External["External Services"]
        SB[(Supabase<br/>PostgreSQL + Realtime)]
        JQ[Jaquar.com<br/>Product Catalog]
    end

    Client -->|"HTTPS"| Vercel
    SF1 -->|"JWT verify"| SB
    SF2 -->|"CRUD"| SB
    SF5 -->|"auto-save"| SB
    SF6 -->|"print log"| SB
    SF3 -->|"HTML scrape"| JQ
    SF4 -->|"CORS proxy"| JQ
    SB -->|"WebSocket RTC"| TM

    style Client fill:#0f172a,stroke:#f97316,color:#f1f5f9
    style Vercel fill:#1e293b,stroke:#334155,color:#f1f5f9
    style External fill:#1a2536,stroke:#334155,color:#f1f5f9
```

---

## Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | React 18.2 + Hooks | Component UI with memo optimization |
| **Build** | Vite 6.0 | HMR, code-splitting, tree-shaking |
| **Styling** | Tailwind CSS 4.0 | Utility-first + custom theme variables |
| **Routing** | React Router 7.13 | Client-side SPA navigation |
| **Animations** | Framer Motion 12.38 + anime.js 4.3 | 3D tilt cards, counter animations |
| **PDF** | jsPDF 2.5 | Vector PDF generation |
| **DOM Capture** | html-to-image 1.11 | Browser-native PNG/SVG/Canvas export |
| **QR Codes** | qrcode 1.5 | Per-label QR code generation (LRU cached) |
| **Backend** | Vercel Serverless Functions | 13 API endpoints (Node.js) |
| **Database** | Supabase (PostgreSQL) | Templates, drafts, history + realtime sync |
| **Auth** | JWT + bcrypt | 7-day tokens, salt-12 password hashing |
| **Notifications** | react-hot-toast 2.6 | Toast feedback for all operations |
| **Deployment** | Vercel CDN | Auto-deploy from GitHub, edge caching |

---

## Component Architecture

```mermaid
graph TD
    APP["App.jsx<br/>Router + Providers"] --> EB["ErrorBoundary"]
    APP --> AUTH["AuthProvider<br/>(JWT Context)"]
    APP --> THEME["ThemeProvider<br/>(Dark/Light)"]

    AUTH --> ROUTES{Routes}
    ROUTES -->|"/"| LAND["Landing.jsx<br/>765 lines<br/>3D animated homepage"]
    ROUTES -->|"/app"| GUARD["Auth Guard"]
    GUARD -->|"no token"| LOGIN["Login.jsx<br/>189 lines"]
    GUARD -->|"valid token"| DASH

    DASH["Dashboard.jsx<br/>1,155 lines<br/>Main Hub"] --> EDITOR["LabelEditor.jsx<br/>728 lines<br/>12-field form + Jaquar search"]
    DASH --> PREVIEW["LabelPreview.jsx<br/>293 lines<br/>A4 preview + export toolbar"]
    DASH --> TMGR["TemplateManager.jsx<br/>285 lines<br/>Cloud save/load/delete"]

    PREVIEW --> SHEET["LabelSheet.jsx<br/>390 lines<br/>2x6 or 3x6 grid renderer"]
    SHEET --> CELL1["LabelCell memo<br/>x12 or x18 per sheet"]
    PREVIEW --> PORTAL["Print Portal<br/>createPortal to body"]
    PREVIEW --> EXPORT["Export Engine<br/>PDF / PNG / SVG"]

    style DASH fill:#f97316,stroke:#ea580c,color:#fff
    style SHEET fill:#2563eb,stroke:#1d4ed8,color:#fff
    style EXPORT fill:#22c55e,stroke:#16a34a,color:#fff
```

### Component Sizes

| Component | Lines | Responsibility |
|:----------|------:|:---------------|
| Dashboard.jsx | 1,155 | Page management, undo/redo, CSV import, history, state hub |
| Landing.jsx | 765 | Public homepage with 3D animations and feature showcase |
| LabelEditor.jsx | 728 | 11 form fields per label, Jaquar live search, bulk operations |
| LabelSheet.jsx | 390 | A4 sheet renderer (2x6 or 3x6 CSS Grid), canvas text measurement |
| LabelPreview.jsx | 293 | Scaled A4 preview, PDF/PNG/SVG export, print portal, toolbar |
| TemplateManager.jsx | 285 | Supabase CRUD + localStorage fallback, realtime sync |
| Login.jsx | 189 | JWT auth form with validation |
| ErrorBoundary.jsx | 89 | Error UI fallback |

**Total: ~3,886 lines of component code**

---

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant LE as LabelEditor
    participant DB as Dashboard
    participant LP as LabelPreview
    participant LS as LabelSheet
    participant API as Vercel API
    participant JQ as Jaquar.com
    participant SB as Supabase

    Note over U,SB: JAQUAR SEARCH FLOW
    U->>LE: Type product code
    LE->>LE: Debounce 150ms
    LE->>LE: searchLocal() from 4,600 products
    LE-->>U: Show dropdown results
    U->>LE: Click result
    LE->>API: GET /api/jaquar-product
    API->>JQ: Scrape product page
    JQ-->>API: HTML response
    API-->>LE: code, name, price, description, image
    LE->>DB: setLabels(updated)

    Note over U,SB: PREVIEW AND EXPORT
    DB->>LP: labels[] prop
    LP->>LS: Render 12 or 18 LabelCells
    LS->>LS: buildTextLines() via canvas measurement
    LS-->>LP: Rendered A4 sheet

    U->>LP: Click PDF
    LP->>LP: html-to-image toCanvas() at 3x DPI
    LP->>LP: jsPDF addImage() per page
    LP-->>U: Download ganpati-labels.pdf

    Note over U,SB: TEMPLATE FLOW
    U->>DB: Click Save Template
    DB->>API: POST /api/templates
    API->>SB: INSERT into templates
    SB-->>DB: Realtime WebSocket notification
```

---

## Label Anatomy

The app supports **two switchable layouts** per A4 sheet.

### Layout 1: 12 Labels (2×6 Grid, 105×48mm)

Each A4 sheet holds **12 labels** in a **2-column x 6-row** CSS Grid.

```
+-----------------------------------------------------+
|  7mm padding                                         |
|  +---------------------+  +---------------------+   |
|  |     Label 1         |1m|     Label 2         |   |
|  |   105mm x 48mm      |  |   105mm x 48mm      |   |
|  +---------------------+  +---------------------+   |
|  +---------------------+  +---------------------+   |
|  |     Label 3         |  |     Label 4         |   |
|  +---------------------+  +---------------------+   |
|  +---------------------+  +---------------------+   |
|  |     Label 5         |  |     Label 6         |   |
|  +---------------------+  +---------------------+   |
|  +---------------------+  +---------------------+   |
|  |     Label 7         |  |     Label 8         |   |
|  +---------------------+  +---------------------+   |
|  +---------------------+  +---------------------+   |
|  |     Label 9         |  |     Label 10        |   |
|  +---------------------+  +---------------------+   |
|  +---------------------+  +---------------------+   |
|  |     Label 11        |  |     Label 12        |   |
|  +---------------------+  +---------------------+   |
|  3.5mm                                    3.5mm      |
+-----------------------------------------------------+
```

### Layout 2: 18 Labels (3×6 Grid, 63.5×46.6mm)

Each A4 sheet holds **18 labels** in a **3-column x 6-row** CSS Grid with **4mm column gaps** and **no row gaps**.

```
+-----------------------------------------------------------+
|  8.7mm top padding                                         |
|  +-----------------+    +-----------------+    +-----------+
|  |   Label 1       |4mm |   Label 2       |4mm |  Label 3  |
|  | 63.5mm x 46.6mm |    | 63.5mm x 46.6mm |    |           |
|  +-----------------+    +-----------------+    +-----------+
|  |   Label 4       |    |   Label 5       |    |  Label 6  |
|  +-----------------+    +-----------------+    +-----------+
|  |   Label 7       |    |   Label 8       |    |  Label 9  |
|  +-----------------+    +-----------------+    +-----------+
|  |   Label 10      |    |   Label 11      |    |  Label 12 |
|  +-----------------+    +-----------------+    +-----------+
|  |   Label 13      |    |   Label 14      |    |  Label 15 |
|  +-----------------+    +-----------------+    +-----------+
|  |   Label 16      |    |   Label 17      |    |  Label 18 |
|  +-----------------+    +-----------------+    +-----------+
|  5.75mm                                          5.75mm    |
|  8.7mm bottom padding                                      |
+-----------------------------------------------------------+
```

### Single Label Layout (105mm x 48mm)

```
+=====+============================================+
| I   | [BRAND LOGO]              [QR CODE]  8.5mm |
| T   |--------------------------------------------|
| E   | Size  | Qty  | MRP (Per Piece)      auto  |
| M   | 15mm  |  1   | Rs.3,800.00                |
|     |       |      | (Incl. of All Taxes)       |
| C   |--------------------------------------------|
| O   | PRODUCT NAME HERE        | [PRODUCT]  1fr  |
| D   | Description text that    |  [IMAGE]        |
| E   | wraps to multiple lines  |    11mm         |
|     |--------------------------------------------|
| 5.5 | Jaquar & Co. Pvt. Ltd.   Made in India 7mm |
| mm  | Mfg: 03/2026    service@jaquar.com          |
|     |                          1800-102-9900      |
+=====+============================================+
```

### Label CSS Grid Rows

```mermaid
graph LR
    subgraph Grid["gridTemplateRows: 8.5mm auto 1fr 7mm"]
        R1["Row 1<br/>Logo + QR<br/>8.5mm fixed"]
        R2["Row 2<br/>Size/Qty/MRP Table<br/>auto height"]
        R3["Row 3<br/>Product + Description<br/>1fr fills remaining"]
        R4["Row 4<br/>Footer<br/>7mm fixed"]
    end

    R1 --> R2 --> R3 --> R4

    style R1 fill:#f97316,stroke:#ea580c,color:#fff
    style R2 fill:#2563eb,stroke:#1d4ed8,color:#fff
    style R3 fill:#22c55e,stroke:#16a34a,color:#fff
    style R4 fill:#7c3aed,stroke:#6d28d9,color:#fff
```

### Label Data Fields (11 per label)

| # | Field | Type | Source | Display Location |
|:-:|:------|:-----|:-------|:-----------------|
| 1 | code | String | Jaquar / Manual | Left vertical strip |
| 2 | manufacturer | String | Jaquar / Manual | Logo fallback text |
| 3 | logoUrl | URL | Auto / Manual | Top-left logo |
| 4 | product | String | Jaquar / Manual | Product name (bold, 2 lines max) |
| 5 | description | String | Jaquar / Manual | Below product (3 lines max) |
| 6 | price | String | Jaquar / Manual | MRP cell with rupee symbol |
| 7 | size | String | Manual | Table cell |
| 8 | qty | String | Manual | Table cell |
| 9 | productUrl | URL | Jaquar | QR code source |
| 10 | productImage | URL | Jaquar | Right side product image |
| 11 | mfgDate | MM/YYYY | Auto-generated | Footer (3-5 months before today) |

---

## Export Pipeline

```mermaid
flowchart LR
    subgraph Input["DOM Source"]
        PS[".print-sheet<br/>React Portal"]
        PW[".print-scale-wrapper<br/>Preview"]
    end

    subgraph Engine["html-to-image<br/>Browser-Native Rendering"]
        TC["toCanvas()<br/>pixelRatio: 3x"]
        TP["toPng()<br/>pixelRatio: 2x"]
        TS["toSvg()<br/>vector output"]
    end

    subgraph Output["Download"]
        PDF["PDF<br/>jsPDF wrapper<br/>100-500 KB"]
        PNG["PNG<br/>raster image"]
        SVG["SVG<br/>vector editable"]
        PRINT["Ctrl+P<br/>browser native"]
    end

    PS --> TC --> PDF
    PW --> TP --> PNG
    PW --> TS --> SVG
    PS -->|"@media print CSS"| PRINT

    style Engine fill:#22c55e,stroke:#16a34a,color:#fff
    style Output fill:#2563eb,stroke:#1d4ed8,color:#fff
```

### Why html-to-image over html2canvas?

| Feature | html2canvas | html-to-image |
|:--------|:----------:|:-------------:|
| CSS Grid support | None | Full |
| Rendering engine | JS reimplementation | Browser-native (SVG foreignObject) |
| Layout accuracy | Approximate | Pixel-perfect |
| Bundle size | 202 KB | 14 KB |
| Flexbox support | Partial | Full |

---

## API Routes

```mermaid
graph LR
    subgraph Auth["Authentication"]
        A1["POST /api/auth/login<br/>Email + Password to JWT"]
        A2["GET /api/auth/verify<br/>Bearer token validation"]
    end

    subgraph Templates["Template CRUD"]
        T1["GET /api/templates<br/>List all"]
        T2["POST /api/templates<br/>Create"]
        T3["GET /api/templates/:id<br/>Read"]
        T4["PUT /api/templates/:id<br/>Update"]
        T5["DELETE /api/templates/:id<br/>Delete"]
    end

    subgraph Cloud["Cloud Storage"]
        D1["GET /api/drafts<br/>Load current draft"]
        D2["PUT /api/drafts<br/>Auto-save draft"]
        H1["GET /api/history<br/>List print history"]
        H2["POST /api/history<br/>Add history entry"]
        H3["DELETE /api/history<br/>Clear all history"]
        H4["DELETE /api/history/:id<br/>Delete single entry"]
    end

    subgraph Jaquar["Jaquar Integration"]
        J1["GET /api/jaquar-search<br/>Search products"]
        J2["GET /api/jaquar-product<br/>Product details + MRP"]
        J3["GET /api/jaquar-price<br/>MRP price only"]
        J4["GET /api/image-proxy<br/>CORS proxy"]
    end

    A1 & A2 --> DB[(Supabase)]
    T1 & T2 & T3 & T4 & T5 --> DB
    D1 & D2 --> DB
    H1 & H2 & H3 & H4 --> DB
    J1 & J2 & J3 --> JQ[Jaquar.com]
    J4 --> JQ

    style Auth fill:#ef4444,stroke:#dc2626,color:#fff
    style Templates fill:#f97316,stroke:#ea580c,color:#fff
    style Cloud fill:#22c55e,stroke:#16a34a,color:#fff
    style Jaquar fill:#2563eb,stroke:#1d4ed8,color:#fff
```

| Endpoint | Method | Auth | Response |
|:---------|:-------|:----:|:---------|
| /api/auth/login | POST | No | token + expiresIn |
| /api/auth/verify | GET | Bearer | valid: true/false |
| /api/templates | GET | Bearer | Array of templates |
| /api/templates | POST | Bearer | Created template |
| /api/templates/:id | GET/PUT/DELETE | Bearer | Template object |
| /api/drafts | GET | Bearer | Current draft (pages + layoutId) |
| /api/drafts | PUT | Bearer | Upserted draft |
| /api/history | GET | Bearer | Array of print history (max 30) |
| /api/history | POST | Bearer | Created history entry |
| /api/history | DELETE | Bearer | Cleared all history |
| /api/history/:id | DELETE | Bearer | Deleted single entry |
| /api/jaquar-search | GET | No | Array of products |
| /api/jaquar-product | GET | No | Product details + MRP |
| /api/jaquar-price | GET | No | MRP price |
| /api/image-proxy | GET | No | Binary image (jaquar.com only) |

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as AuthContext
    participant API as /api/auth
    participant SS as sessionStorage

    B->>A: App loads
    A->>SS: Check for JWT token
    alt Has token
        A->>API: GET /verify (Bearer token)
        API->>API: jwt.verify(token, secret)
        alt Valid
            API-->>A: valid true
            A-->>B: Render Dashboard
        else Expired
            API-->>A: 401
            A-->>B: Redirect to Login
        end
    else No token
        A-->>B: Redirect to Login
    end

    B->>A: Submit email + password
    A->>API: POST /login
    API->>API: bcrypt.compare(password, ADMIN_HASH)
    alt Match
        API->>API: jwt.sign with 7d expiry
        API-->>A: token
        A->>SS: Store token
        A-->>B: Render Dashboard
    else No match
        API-->>B: 401 Invalid credentials
    end
```

### Security

| Measure | Implementation |
|:--------|:---------------|
| Password hashing | bcrypt, 12 salt rounds |
| Token expiry | 7 days |
| Token storage | sessionStorage (cleared on browser close) |
| API auth | Bearer token on /api/templates/* |
| CORS | Restricted to FRONTEND_URL env var |
| CSP | Strict Content-Security-Policy in vercel.json |
| Image proxy | Whitelists jaquar.com domain only |
| Input sanitization | Logo URLs validated (http/https/relative only) |

---

## Project Structure

```
printer-image-generator/
|
|-- src/
|   |-- main.jsx                        Entry point + Service Worker registration
|   |-- App.jsx                         Router + Auth/Theme providers
|   |-- index.css                       Tailwind + print CSS + theme vars + animations
|   |
|   |-- components/
|   |   |-- Landing.jsx                 Public homepage (3D cards, animations)
|   |   |-- Login.jsx                   JWT auth form
|   |   |-- Dashboard.jsx              Main editor hub (state management center)
|   |   |-- LabelEditor.jsx            12-field form + Jaquar live search
|   |   |-- LabelPreview.jsx           A4 preview + PDF/PNG/SVG/Print export
|   |   |-- LabelSheet.jsx             Single A4 sheet (2x6 or 3x6 grid + text measurement)
|   |   |-- TemplateManager.jsx        Cloud save/load/delete templates
|   |   |-- ErrorBoundary.jsx          Error UI fallback
|   |
|   |-- contexts/
|   |   |-- AuthContext.jsx             JWT auth state + login/logout
|   |   |-- ThemeContext.jsx            Dark/Light theme toggle
|   |
|   |-- services/
|   |   |-- api.js                      Axios instance + JWT interceptor + API helpers
|   |   |-- supabase.js                 Supabase client singleton
|   |
|   |-- utils/
|       |-- mfgDate.js                  Random MFG date (3-5 months back, MM/YYYY)
|       |-- dynamicImport.js            Stale chunk recovery with cache-bust reload
|       |-- layoutConfig.js             Layout definitions (12-label and 18-label)
|
|-- api/
|   |-- auth/
|   |   |-- login.js                    POST: email+password -> JWT token
|   |   |-- verify.js                   GET: Bearer token validation
|   |-- templates/
|   |   |-- index.js                    GET/POST: list + create templates
|   |   |-- [id].js                     GET/PUT/DELETE: single template
|   |-- drafts/
|   |   |-- index.js                    GET/PUT: auto-save draft to cloud
|   |-- history/
|   |   |-- index.js                    GET/POST/DELETE: print history (max 30)
|   |   |-- [id].js                     DELETE: single history entry
|   |-- jaquar-search.js               GET: search jaquar.com (HTML scrape)
|   |-- jaquar-product.js              GET: product details + MRP
|   |-- jaquar-price.js                GET: MRP price extraction
|   |-- image-proxy.js                 GET: CORS proxy for jaquar.com images
|   |-- _lib/
|       |-- db.js                       Supabase client wrapper + DB helpers
|
|-- public/
|   |-- jaquar-products.json            4,600+ products preloaded (1.2 MB)
|   |-- jaquar-logo.png                 Brand logo
|   |-- manifest.json                   PWA manifest
|   |-- sw.js                           Service Worker (basic offline)
|   |-- favicon.svg / og-image.png      Icons and social preview
|
|-- scripts/
|   |-- build-jaquar-db.js             Crawl jaquar.com -> products JSON
|   |-- generate-hash.js               Generate bcrypt password hash
|   |-- generate-label-pdf.js          Standalone PDF generator (testing)
|   |-- generate-og.js                 Generate OG image
|   |-- setup-db.sql                   Supabase schema setup
|
|-- vercel.json                         Headers, rewrites, cache rules
|-- vite.config.js                      Vite + React + Tailwind plugins
|-- package.json                        Dependencies + scripts
```

---

## Features

### Core Workflow

1. **Login** -- Single admin JWT auth with bcrypt password verification
2. **Search** -- Type product code, get instant results from 4,600+ Jaquar products
3. **Fill** -- Auto-populate all 11 fields per label from Jaquar catalog
4. **Preview** -- Live A4 preview with exact 210x297mm dimensions
5. **Export** -- PDF, PNG, SVG download or Ctrl+P browser print

### Label Editor

- **Dual layouts**: 12 labels (2×6, 105×48mm) or 18 labels (3×6, 63.5×46.6mm) — switchable in toolbar
- 11 editable fields per label
- Live Jaquar search with dropdown (150ms debounce, <5ms local search)
- Auto-fill: code, name, description, price, product URL, product image
- QR code auto-generated from product URL
- Bulk operations: fill all, duplicate, copy/paste between labels
- Compact label rendering auto-adjusts fonts/spacing for 18-label layout

### Multi-page Support

- Unlimited A4 pages (12 or 18 labels each, depending on layout)
- Page navigator with filled-count badges
- Add, remove, duplicate pages
- All pages exported in single PDF

### Data Management

- **CSV Import** -- Upload or paste CSV data with auto-preview
- **CSV Export** -- All 11 fields with headers
- **JSON Import/Export** -- Full backup and restore
- **Cloud Templates** -- Save/load/delete via Supabase with realtime sync
- **Cloud Drafts** -- Auto-save current work to Supabase every 2s (no localStorage)
- **Cloud History** -- Last 30 print operations stored in Supabase with auto-naming
- **Template Gallery** -- Pre-built templates for quick start
- **Undo/Redo** -- 30-operation stack (Ctrl+Z / Ctrl+Y)
- **Auto-save** -- Draft saved to cloud every 2s via debounced API call

### UI/UX

- Dark theme (default) with light theme toggle
- 3D depth panels with CSS perspective + translateZ
- Glassmorphism cards with backdrop-filter blur
- Animated landing page (Framer Motion + anime.js)
- Responsive layout: 42% editor / 58% preview split
- Mobile fallback at 768px breakpoint
- Active label glow animation with pulsing ring

---

## Whats New in v4.0

### Dual Layout System (12 or 18 Labels)

- **New 18-label layout**: 3 columns × 6 rows, 63.5×46.6mm per label
- **Layout switcher** in the Dashboard toolbar — toggle between 2×6 and 3×6
- Compact rendering mode for 18-label layout (0.78× font scale, narrower strips, simplified footer)
- 4mm column gaps, 0mm row gaps, 8.7mm equal top/bottom margins, 5.75mm side margins
- Centralized layout config in `src/utils/layoutConfig.js`
- All features (CSV import, templates, history, PDF export) adapt to selected layout

### Full Cloud Storage

- **Drafts to cloud**: Auto-save to Supabase `drafts` table every 2s (debounced). No more localStorage for drafts.
- **History to cloud**: Print history stored in Supabase `history` table (max 30 entries, auto-pruned). Includes page count, labels per page, layout info.
- **New API endpoints**: `/api/drafts` (GET/PUT) and `/api/history` (GET/POST/DELETE) + `/api/history/:id` (DELETE)
- Loading spinner on initial draft fetch
- Realtime sync watches `drafts` table for live updates across tabs

### New Domain

- Migrated from `printer-image-generator.vercel.app` to **`saglps.vercel.app`**
- Updated CORS fallbacks, OG meta tags, JSON-LD schema, and OG image watermark

### Previous Highlights (v3.2)

- Browser-native export via html-to-image (replaced html2canvas)
- Full CSS Grid support in PDF/PNG/SVG exports
- Stale chunk recovery with cache-busting reload
- 4,600+ Jaquar products preloaded for instant local search
- React Portal print system (no blank pages)
- Code splitting: 500KB to 235KB main bundle (53% reduction)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (for cloud templates)

### Installation

```bash
git clone https://github.com/NIGHT-FURY-6023/printer-image-generator.git
cd printer-image-generator

npm install

# Generate password hash for admin login
node scripts/generate-hash.js "your-admin-password"

# Set up environment variables
cp .env.example .env
# Fill in all values (see Environment Variables below)

# Set up Supabase schema (run in Supabase SQL editor)
# See scripts/setup-db.sql

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build      # Output in dist/
npm run preview    # Test production build locally
```

### Rebuild Jaquar Product Database

```bash
node scripts/build-jaquar-db.js    # Crawls jaquar.com -> public/jaquar-products.json
```

---

## Environment Variables

| Variable | Scope | Purpose |
|:---------|:------|:--------|
| JWT_SECRET | Server | JWT signing secret |
| ADMIN_EMAIL | Server | Admin login email |
| ADMIN_PASSWORD_HASH | Server | bcrypt hash of admin password |
| SUPABASE_URL | Server | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Server | Supabase server-side key |
| VITE_SUPABASE_URL | Client | Supabase project URL (browser) |
| VITE_SUPABASE_ANON_KEY | Client | Supabase anon key (browser) |
| FRONTEND_URL | Server | CORS allowed origin |

---

## Keyboard Shortcuts

| Shortcut | Action |
|:---------|:-------|
| Ctrl + P | Print all pages |
| Ctrl + Z | Undo last change |
| Ctrl + Y | Redo |
| Escape | Close modals |

---

## Performance

| Metric | Value |
|:-------|------:|
| Main bundle (code-split) | 235 KB |
| Dashboard chunk | 107 KB |
| Landing chunk | 198 KB |
| Login chunk | 6 KB |
| Jaquar local search | < 5ms |
| PDF generation | 1-3 seconds |
| QR code cache | LRU, 50 entries |
| Undo stack depth | 30 operations |
| Auto-save interval | 2s debounced to cloud |
| Jaquar product DB | 4,600+ products (1.2 MB) |

---

## State Management

```mermaid
graph TD
    subgraph Global["Global Context"]
        AC["AuthContext<br/>user, token, login, logout"]
        TC["ThemeContext<br/>theme, toggle"]
    end

    subgraph Dash["Dashboard State"]
        PG["pages[]<br/>Array of label arrays (12 or 18 per page)"]
        LY["layoutId<br/>'layout12' or 'layout18'"]
        CP["currentPage index"]
        US["undoStack / redoStack<br/>30 ops each"]
        CO["copies 1-10"]
    end

    subgraph Editor["LabelEditor State"]
        SQ["searchQuery"]
        PDB["productDB<br/>4,600+ products"]
        SR["searchResults[]"]
    end

    subgraph Persist["Persistence"]
        SS["sessionStorage<br/>JWT token"]
        LS["localStorage<br/>theme only"]
        SB["Supabase<br/>templates + drafts + history + realtime"]
    end

    AC --> SS
    TC --> LS
    PG --> SB
    LY --> SB
    Editor --> PG

    style Global fill:#7c3aed,stroke:#6d28d9,color:#fff
    style Dash fill:#f97316,stroke:#ea580c,color:#fff
    style Editor fill:#2563eb,stroke:#1d4ed8,color:#fff
    style Persist fill:#22c55e,stroke:#16a34a,color:#fff
```

---

## Deployment

```mermaid
flowchart LR
    GH["GitHub Push"] --> VA["Vercel<br/>Auto-Deploy"]
    VA --> BUILD["npm run build<br/>Vite"]
    BUILD --> STATIC["Static Files<br/>dist/ on CDN"]
    BUILD --> FN["Serverless<br/>api/ on Edge"]

    STATIC --> C1["HTML: no-cache"]
    STATIC --> C2["Assets: 1yr immutable"]
    FN --> C3["API: stale-while-revalidate"]

    style VA fill:#000,stroke:#333,color:#fff
    style STATIC fill:#2563eb,stroke:#1d4ed8,color:#fff
    style FN fill:#f97316,stroke:#ea580c,color:#fff
```

---

<div align="center">

**Built with precision for Shree Ganpati Agency**

React + Vite + Tailwind + Supabase + Vercel

</div>
