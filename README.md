# Deprince Foodmart — Web App (Master README for GitHub Copilot)

> **Copilot: read this whole file first.** It is the single source of truth for this project.
> Build it **one stage at a time** (Stage 1 → Stage 8). Do not jump ahead. At the end of each stage, stop, summarise what you built, list how to run/test it, and wait for me to say "continue to Stage N".

---

## 0. Project Summary

**Deprince Foodmart** is an online grocery / foodstuff store for a real shop in Lagos, Nigeria. It is a **responsive web app (PWA)**, opened in a browser and optionally "Add to Home Screen". It is **not** a Play Store / App Store app.

It is inspired by the *general idea* of an affordable online grocery site (like cheapmarketdeals.com): a homepage with banners, product browsing, a cart, and a simple checkout. **It must NOT copy that site.** See Section 9 (Originality Rules).

### Business details (use everywhere: footer, contact page, SEO, WhatsApp)

| Field | Value |
|---|---|
| Business name | Deprince Foodmart |
| Phone / WhatsApp | 08072206245 (international format for links: `2348072206245`) |
| Email | deprincefoodmart@gmail.com |
| Address | Ajah Shopping Place, Obodo 1, Lagos, Nigeria |
| Currency | Nigerian Naira (₦) |

All of the above must be **editable by the admin in Settings** (stored in the database), never hard-coded in components. Seed them as defaults.

### Two kinds of users

1. **Admin (the shop owner, my friend)** — logs in and manages everything.
2. **Customers** — no account needed. They browse, add to cart, and checkout via WhatsApp.

---

## 1. Required Features (my choices — do not change)

### Admin (login required)
- Secure login page (`/admin/login`) and logout.
- **Products:** upload (create), edit, delete. Fields: name, category, description, **price**, optional old price (shows a discount badge), unit (e.g. "per bag", "per kg", "per tuber"), stock status (In stock / Out of stock), image(s), featured toggle.
- **Prices:** quickly **add and edit prices** (including an inline "quick edit price" in the product list table, without opening the full form).
- **Categories:** create, edit, delete (e.g. Grains & Rice, Oils, Tubers, Vegetables, Provisions, Drinks, Spices, Frozen Foods).
- **Homepage banners:** add, edit, delete, reorder, activate/deactivate. Each banner has an image, optional headline, optional sub-text, optional button label and link. **The banners in the project are only demos and must be fully replaceable from the admin panel.**
- **Blog:** add, edit, delete posts with a **cover/blog picture**, title, body (rich text or markdown), **author name**, published/draft status, date.
- **Name space:** a **"Owner / Admin name" field in Settings** that appears in blog author bylines (default author), the About section, the footer, and the admin dashboard greeting ("Welcome, <name>").
- **Settings:** business name, phone/WhatsApp number, email, address, opening hours, social links, owner name, logo upload (light and dark versions), WhatsApp checkout greeting text.
- Change admin password.

### Customers (no login)
- View homepage with banner slider, categories, featured products, latest products, and latest blog posts.
- Browse all products, filter by category, search, sort by price/newest.
- Product detail page.
- **Add to cart**, change quantity, remove items; cart persists after refresh (localStorage).
- **Checkout → WhatsApp:** when the customer taps Checkout, open WhatsApp (`https://wa.me/2348072206245?text=...`) with a **plain-text list of the cart items — NO images, only details** (name, unit, quantity, unit price, line total, grand total, optional customer name/phone/address/note).
- Blog list and blog detail pages.
- Contact/About info (from Settings), including click-to-call, click-to-WhatsApp, email, and address.

---

## 2. Tech Stack (use exactly this unless a stage says otherwise)

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript, React Router, Tailwind CSS |
| Data fetching | TanStack Query (React Query) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Auth | Email + password, bcrypt hashing, JWT in **httpOnly secure cookie** |
| Validation | Zod (frontend and backend) |
| Image storage | Cloudinary (upload via backend; store URL + public_id) |
| PWA | `vite-plugin-pwa` (manifest + service worker) |
| Deployment | Frontend: Vercel or Netlify. Backend: Render or Railway. DB: Neon or Supabase Postgres |
| Package layout | Monorepo with two folders: `/client` and `/server` |

Use environment variables for every secret. Provide `.env.example` files. Never commit real secrets.

---

## 3. Branding & Design

### Logo files (provided by me; already in the project assets)
- `obodo_logo.png` — full-colour logo (dark green + orange leaf, grey wheels). Use on **light** backgrounds (header, invoices, login page).
- `obodo_logo_light_mood.png` — white/light-grey version for **dark** backgrounds (footer, dark banners). 

Copy both into `client/src/assets/brand/` and also allow the admin to replace them in Settings. The logo shows a shopping-cart curve with leaves and the text "Deprince / Foodmart".

### Colour palette (sample exact values from the logo and put them in `tailwind.config`)
- Primary dark green: approx `#044B18` (text, headings, header)
- Primary green: approx `#007424` (buttons, links, active states)
- Accent orange: approx `#FF6B00` (sale badges, highlights, call-to-action hover)
- Neutral grey: approx `#5E5E5E` (secondary text)
- Background: white `#FFFFFF` and soft off-white/green tint `#F6FAF6`

### Typography & feel
- Clean, modern sans-serif (e.g. Montserrat for headings, Inter or system font for body — the logo uses a Montserrat-like face).
- Mobile-first. Most customers will be on phones in Nigeria, so: **small bundle size, lazy-loaded images, fast on slow networks**, large tap targets, sticky bottom "View cart" bar on mobile.
- Fresh, friendly, trustworthy grocery feel. Rounded cards, generous spacing, product cards with badge (sale / out of stock).

### Demo banners (placeholders only)
Create **3 demo banners** as brand-coloured SVG/gradient images in `server/prisma/seed-assets/` (e.g. "Fresh Foodstuff, Fair Prices", "Free Delivery Around Ajah — Ask On WhatsApp", "New Arrivals This Week"). Seed them into the database so the homepage is not empty. They must be **deletable/replaceable from the admin panel**. Use only original artwork — no copied images.

---

## 4. Data Model (Prisma — starting point)

```prisma
model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  imageUrl  String?
  sortOrder Int       @default(0)
  products  Product[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Int                 // store in kobo-free whole Naira, or use Decimal; be consistent
  oldPrice    Int?
  unit        String?             // "per bag", "per kg"...
  inStock     Boolean  @default(true)
  featured    Boolean  @default(false)
  imageUrl    String?
  imagePublicId String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Banner {
  id            String  @id @default(cuid())
  imageUrl      String
  imagePublicId String?
  headline      String?
  subtext       String?
  buttonLabel   String?
  buttonLink    String?
  sortOrder     Int     @default(0)
  active        Boolean @default(true)
  createdAt     DateTime @default(now())
}

model BlogPost {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  excerpt       String?
  body          String
  coverUrl      String?
  coverPublicId String?
  authorName    String
  published     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Setting {                    // single-row table (id = 1)
  id               Int     @id @default(1)
  businessName     String  @default("Deprince Foodmart")
  ownerName        String  @default("")
  phone            String  @default("08072206245")
  whatsappNumber   String  @default("2348072206245")
  email            String  @default("deprincefoodmart@gmail.com")
  address          String  @default("Ajah Shopping Place, Obodo 1, Lagos, Nigeria")
  openingHours     String?
  instagramUrl     String?
  facebookUrl      String?
  logoUrl          String?
  logoLightUrl     String?
  checkoutGreeting String  @default("Hello Deprince Foodmart, I would like to order the items below:")
}
```

Adjust types as needed, but keep every field above available.

---

## 5. API Outline

Public (no auth):
- `GET /api/products?category=&search=&sort=&page=`
- `GET /api/products/:slug`
- `GET /api/categories`
- `GET /api/banners` (active only, ordered)
- `GET /api/blog` and `GET /api/blog/:slug` (published only)
- `GET /api/settings` (public fields only)

Admin (auth required, cookie-based):
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`, `PATCH /api/admin/password`
- CRUD: `/api/admin/products`, `/api/admin/categories`, `/api/admin/banners`, `/api/admin/blog`
- `PATCH /api/admin/products/:id/price` (quick price edit)
- `PUT /api/admin/settings`
- `POST /api/admin/upload` (image → Cloudinary; validate type and size, max ~3 MB)

---

## 6. WhatsApp Checkout Spec

Cart lives in localStorage (`deprince_cart`). On "Checkout via WhatsApp":

1. Show a small form: customer name (required), phone (optional), delivery address/area (optional), note (optional).
2. Build a **plain-text message — no images**. Example:

```text
Hello Deprince Foodmart, I would like to order the items below:

1. Premium Parboiled Rice (per bag) — 2 x ₦95,000 = ₦190,000
2. Vegetable Oil 5L (per gallon) — 1 x ₦12,500 = ₦12,500
3. Garri White (per paint bucket) — 3 x ₦2,800 = ₦8,400

TOTAL: ₦210,900

Name: Ada Obi
Phone: 080XXXXXXXX
Delivery area: Ajah
Note: Please call before delivery.
```

3. Encode with `encodeURIComponent` and open `https://wa.me/<whatsappNumber from settings>?text=<encoded>` in a new tab.
4. Do not clear the cart automatically; offer a "Clear cart" button after redirect.
5. Handle empty cart, out-of-stock items (block them), and very long messages (WhatsApp URL limits — if over ~3,500 characters, shorten by dropping optional lines).
6. Format Naira with `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })`.

---

## 7. Recommended Folder Structure

```text
deprince-foodmart/
├─ README.md
├─ .github/copilot-instructions.md      (short copy of the rules in Section 10)
├─ client/
│  ├─ src/
│  │  ├─ assets/brand/                  (logos)
│  │  ├─ components/                    (ui, layout, product, cart, admin)
│  │  ├─ pages/                         (storefront + admin)
│  │  ├─ hooks/  lib/  store/           (cart store, api client, formatters)
│  │  └─ main.tsx  App.tsx  routes.tsx
│  └─ vite.config.ts  tailwind.config.ts
└─ server/
   ├─ prisma/ (schema.prisma, seed.ts, seed-assets/)
   └─ src/ (routes, controllers, middleware, lib, index.ts)
```

---

## 8. THE 8 BUILD STAGES

Work through these **in order**. Each stage has: goal, tasks, a **"done when"** checklist, and a ready-to-paste Copilot prompt.

### Stage 1 — Project Setup & Branding Foundation
**Goal:** Empty-but-running monorepo with design system.
**Tasks**
- Create `/client` (Vite + React + TS + Tailwind + React Router + TanStack Query) and `/server` (Express + TS + Prisma).
- Add ESLint, Prettier, `.gitignore`, `.env.example` for both.
- Configure Tailwind with the brand palette and fonts (Section 3).
- Copy logos into `client/src/assets/brand/`.
- Build base layout: Header (logo, search, cart icon with count, nav), Footer (logo light version, contact info), mobile menu, and reusable UI components (Button, Input, Card, Badge, Modal, Skeleton loader, Toast).
- Add placeholder routes for all storefront and admin pages.

**Done when:** `npm run dev` runs both apps; header/footer render with the logos in brand colours on mobile and desktop.

```text
Read README.md fully. Start STAGE 1 only. Scaffold the /client and /server folders with the stack in Section 2, configure Tailwind with the brand palette in Section 3, copy the logos, and build the base layout (header, footer, mobile menu) and reusable UI components. Add placeholder routes. Don't build features from later stages. When done, list the commands to run and wait for me to say "continue to Stage 2".
```

### Stage 2 — Database, Backend Foundation & Seed Data
**Goal:** Working API skeleton connected to PostgreSQL.
**Tasks**
- Write the Prisma schema from Section 4; run the first migration.
- Create Express app with CORS (allow only the client origin), helmet, JSON parsing, cookie-parser, error handler, request logging, and health route `/api/health`.
- Zod validation middleware and a consistent JSON error format.
- Seed script: default settings, the 3 demo banners, 8 categories, ~20 realistic demo products (Nigerian foodstuff with ₦ prices), 2 demo blog posts, and the admin account from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- Implement all **public** read endpoints from Section 5.

**Done when:** After `prisma migrate dev` and `prisma db seed`, the public endpoints return seeded data.

```text
Continue to STAGE 2 of README.md. Implement the Prisma schema, migration, seed script, Express app foundation, and all public GET endpoints from Section 5. Use Zod for validation and a consistent error format. Show me example curl commands to test each endpoint.
```

### Stage 3 — Admin Authentication & Dashboard Shell
**Goal:** Secure admin login and protected admin area.
**Tasks**
- `POST /api/admin/login` (bcrypt compare, JWT in httpOnly, `sameSite`, `secure` in production cookie), logout, `me`, change password.
- Auth middleware protecting `/api/admin/*`; login rate limiting (`express-rate-limit`), generic error messages.
- Frontend: `/admin/login`, protected route wrapper, admin layout (sidebar on desktop, bottom/hamburger menu on mobile) with links: Dashboard, Products, Categories, Banners, Blog, Settings.
- Dashboard shows greeting "Welcome, <ownerName>" and counts (products, categories, banners, blog posts, out-of-stock items).

**Done when:** Only a logged-in admin can open `/admin/*`; refreshing keeps the session; logout works.

```text
Continue to STAGE 3 of README.md. Build secure admin auth (httpOnly JWT cookie, bcrypt, rate limiting), the protected admin layout and routes, the login page, change-password, and a dashboard with summary counts and a greeting using the ownerName setting.
```

### Stage 4 — Product & Category Management (Admin)
**Goal:** Admin can upload, edit, delete products and manage prices.
**Tasks**
- Cloudinary upload endpoint (`/api/admin/upload`) with file type and size validation; delete old image when replaced/deleted.
- Admin CRUD for categories and products (Section 5).
- Product form: name, category, description, price, old price, unit, in-stock toggle, featured toggle, image upload with preview and drag-and-drop.
- Product list table: search, filter by category, pagination, **inline quick-edit price**, toggle stock, edit, delete (with confirmation modal).
- Auto-generate unique slugs.

**Done when:** Admin can add a product with an image, change its price inline, mark it out of stock, and delete it; changes appear in the public API.

```text
Continue to STAGE 4 of README.md. Build Cloudinary image upload and complete admin CRUD for categories and products, including the product form with image preview, the products table with inline quick price edit, stock toggle, search, pagination, and delete confirmation.
```

### Stage 5 — Banners, Blog & Settings (Admin)
**Goal:** Admin controls homepage banners, blog, and business info.
**Tasks**
- **Banners:** CRUD, image upload, optional headline/sub-text/button, reorder (drag-and-drop or up/down buttons), active toggle. Include guidance text: "Recommended size 1600×600 px (desktop) — keep key text in the centre for mobile crop."
- **Blog:** CRUD with cover image upload, title, excerpt, body (use a lightweight rich-text editor such as Tiptap, or markdown with preview), **author name field (defaults to owner name)**, draft/published toggle.
- **Settings page:** every field from the `Setting` model, including **Owner/Admin name**, WhatsApp number (with validation and a "test WhatsApp link" button), logos upload (light & dark), opening hours, social links, checkout greeting text.

**Done when:** Replacing a demo banner in admin immediately changes the homepage data; a new blog post with a picture appears in the public blog API; changing the WhatsApp number in Settings updates the public settings endpoint.

```text
Continue to STAGE 5 of README.md. Build the admin pages and endpoints for banners (with reorder and active toggle), blog posts (cover image, author name, draft/published), and the full Settings page including Owner name, WhatsApp number, logos, and checkout greeting. Demo banners must be deletable and replaceable.
```

### Stage 6 — Customer Storefront
**Goal:** Beautiful, fast public website.
**Tasks**
- **Home:** auto-sliding banner carousel (swipe on mobile, pause on hover, lazy-load, skeleton while loading), category chips/grid, Featured products, Latest products, "Why shop with us" strip, latest blog posts, contact strip.
- **Shop page:** product grid, category filter, search (debounced), sort, pagination or "load more".
- **Product detail:** large image, price (with old price and discount %), unit, stock status, quantity selector, "Add to cart", related products.
- **Blog list & blog detail** pages with SEO-friendly URLs.
- **About/Contact** page using Settings data (call, WhatsApp, email, address, opening hours; embed a "Get directions" link to Google Maps using the address).
- Empty states, 404 page, loading skeletons, image fallbacks.

**Done when:** A customer on a phone can browse everything with seeded data, and all content comes from the API (nothing hard-coded).

```text
Continue to STAGE 6 of README.md. Build the full public storefront: Home (banner carousel, categories, featured, latest, blog preview), Shop (filter/search/sort), Product detail, Blog list/detail, About/Contact. Mobile-first, lazy-loaded images, skeleton loaders, and all data from the API.
```

### Stage 7 — Cart & WhatsApp Checkout
**Goal:** Working cart and WhatsApp order flow.
**Tasks**
- Cart store (Zustand or Context + localStorage): add, increment/decrement, remove, clear, totals, persisted.
- Cart drawer + full Cart page; sticky mobile "View cart (n) — ₦total" bar.
- Re-validate cart against current prices/stock when the cart opens (prices may have changed in admin) and warn about changes or unavailable items.
- Checkout modal/page and WhatsApp message builder exactly per Section 6 (**text only, no images**), using the WhatsApp number and greeting from Settings.
- Unit tests for the message builder and totals.

**Done when:** Adding items and tapping Checkout opens WhatsApp with the correct text list and totals; changing a price in admin is reflected in the cart on next open.

```text
Continue to STAGE 7 of README.md. Implement the persisted cart, cart drawer/page, mobile sticky cart bar, price/stock revalidation, and the WhatsApp checkout exactly as in Section 6 (text only, no images, number and greeting from Settings). Add unit tests for the message builder and totals.
```

### Stage 8 — PWA, SEO, Security, Testing & Deployment
**Goal:** Production-ready, installable, secure, and handed over.
**Tasks**
- **PWA:** manifest (name "Deprince Foodmart", theme colour green, icons generated from the logo), service worker caching app shell and recent API responses, "Add to Home Screen" prompt, offline fallback page.
- **SEO:** per-page titles/meta, Open Graph image, `sitemap.xml`, `robots.txt`, JSON-LD `LocalBusiness` + `Product` structured data, clean slugs, alt text.
- **Performance:** code-splitting, image optimisation via Cloudinary transforms (`f_auto,q_auto,w_...`), Lighthouse ≥ 90 on mobile where possible.
- **Security:** helmet, strict CORS, rate limits, input validation everywhere, upload validation, sanitise blog HTML, secure cookies, no secrets in the client, dependency audit.
- **Testing:** basic API tests (auth, product CRUD) and a manual QA checklist.
- **Deployment:** step-by-step guide for Neon/Supabase (DB), Render/Railway (API), Vercel/Netlify (client), env vars, custom domain, CORS, running migrations and the seed (creating the real admin, **changing the default password immediately**).
- **Handover:** a short `ADMIN-GUIDE.md` in plain language (with steps: log in, add product, change price, change banner, write blog post, update WhatsApp number) for my friend, who is not technical.

**Done when:** The site is live, installable on a phone, and the owner can run it day to day using only the admin guide.

```text
Continue to STAGE 8 (final) of README.md. Add PWA support, SEO, performance and security hardening, basic tests, a deployment guide (Neon/Supabase, Render/Railway, Vercel/Netlify), and a plain-language ADMIN-GUIDE.md for a non-technical shop owner. End with a final QA checklist.
```

---

## 9. Originality Rules (avoid piracy / copying)

- Do **not** copy any code, text, images, logos, product photos, banners, colour scheme, or brand name from cheapmarketdeals.com or any other site.
- Use the **Deprince Foodmart** name, logo, colours, wording, layout and copy only. Write all text from scratch.
- Reference sites are for *general ideas only* (banner on top, products, cart, WhatsApp checkout). Layout details, component design, and code must be original.
- Demo content (banners, products, blog posts) must be original/placeholder and clearly replaceable. Use only images I upload, my own generated artwork, or properly licensed free images.
- Don't scrape any external site or reuse its API.

---

## 10. Coding Rules for Copilot (also put in `.github/copilot-instructions.md`)

1. TypeScript everywhere, strict mode on. No `any` unless justified.
2. Keep files small; one component per file; meaningful names; short comments only where logic isn't obvious.
3. Never hard-code business data (phone, address, name, WhatsApp number, banners). Read from Settings/API.
4. All admin routes must go through auth middleware; never trust the client for prices — recalc totals from the server data when validating.
5. Validate every input with Zod; return clear error messages.
6. Mobile-first, accessible (labels, alt text, focus states, colour contrast).
7. After each stage: run lint + type-check + tests, fix errors, then summarise and stop.
8. If something is ambiguous, make the simplest sensible choice, note it in the summary, and continue — don't stall.
9. Do not install large unnecessary dependencies; keep the bundle light for slow networks.
10. Never commit secrets. Use `.env.example`.

---

## 11. Environment Variables

**server/.env.example**
```text
DATABASE_URL=postgresql://user:password@host:5432/deprince
JWT_SECRET=change-this-to-a-long-random-string
CLIENT_ORIGIN=http://localhost:5173
ADMIN_EMAIL=deprincefoodmart@gmail.com
ADMIN_PASSWORD=ChangeMeNow!123
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=development
PORT=4000
```

**client/.env.example**
```text
VITE_API_URL=http://localhost:4000/api
```

---

## 12. If Copilot Gets Stuck

- Re-read Section 1 (features) and the current stage only.
- Split the stage into smaller tasks and do them one at a time (backend first, then frontend).
- Fix compile/type errors before adding anything new.
- Ask me one specific question instead of guessing on anything that changes the data model.

---

**Start now with Stage 1.**
#   D e - P r i n c e - F o o d m a r t  
 