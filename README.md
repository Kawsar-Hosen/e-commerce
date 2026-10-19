# SHOBDOX — বাংলার ডিজিটাল বাজার

A **UI/UX phase** e-commerce concept for Bangladesh: one TypeScript monorepo that ships a
responsive React website (customer storefront + admin + seller dashboards) and a genuine
native Expo/React Native Android app, sharing **all** business logic, types, validation,
design tokens and mock data.

> **This is a design and interaction demo, not production software.**
> There is no backend, no database, no payment gateway and no authentication service.
> Nothing is charged, nothing ships, no message is sent anywhere. Every "order", "review",
> "seller" and "customer" is fixture data that lives in your browser's `localStorage`
> (and in the app's local storage on Android). The demo says so on every relevant screen,
> and a **ডেমো ডেটা রিসেট করুন** control restores the original fixtures at any time.

---

## 1. Quick start

Requirements:

| Tool | Version used here | Notes |
| --- | --- | --- |
| Node.js | 22.22.1 (>= 20.19 required) | `.nvmrc`-free; any Node 20.19+ works |
| pnpm | 12.14.0 | `corepack enable` then `pnpm --version` |
| Android, for the app | Expo Go (SDK 58) or an emulator | see §7 |

```bash
# 1. install (workspace-wide, uses the shared lockfile)
pnpm install

# 2. website → http://localhost:5173
pnpm dev:web          # alias: pnpm dev

# 3. native Android app (Metro + Expo) — scan the QR with Expo Go
pnpm dev:mobile       # alias: pnpm android  (opens the emulator)
```

Other scripts:

| Command | What it does |
| --- | --- |
| `pnpm build` | Type-check + production build of the website into `apps/web/dist` |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | Strict `tsc --noEmit` across every workspace package |
| `pnpm lint` | ESLint (flat config) across the monorepo |
| `pnpm validate:data` | Re-runs the demo-dataset integrity check (products, orders, coupons, totals) |
| `pnpm tokens:css` | Regenerates `apps/web/src/styles/tokens.generated.css` from the token source |
| `pnpm clean` | Removes `node_modules`, build output and `.tmp` |

Copy `.env.example` only if you want to override the optional display values — **the demo
runs with no environment variables at all**, and no secret is ever required.

### Try it in 60 seconds

1. `pnpm dev:web`, open <http://localhost:5173>.
2. Add two or three products to the cart (the rail on the homepage is the fastest way).
3. Go to the cart → checkout → place the demo order → watch the confirmation page.
4. Sign in as the admin (`01700000001` / `admin123`) and change that order's status.
5. Sign in as the seller (`01711000111` / `seller123`) and edit one of your products' stock.
6. Refresh the page — everything you changed is still there. Footer → **ডেমো ডেটা রিসেট করুন** puts it back.

---

## 2. Demo accounts

All three accounts are fixtures; the password field is validated but nothing is verified
against anything, and no session token exists.

| Role | Phone | Password | Lands on |
| --- | --- | --- | --- |
| Customer | `01712345678` | `shobdox123` | `/account` |
| Admin | `01700000001` | `admin123` | `/admin` |
| Seller | `01711000111` | `seller123` | `/seller` |

The sign-in screen also has one-tap **ডেমো হিসেবে ঢুকুন** buttons, so you never have to type.

---

## 3. What you can actually do

Everything below is implemented locally and persists across reloads.

**Shopper**

- Home page with hero campaigns, merchandising rails (flash sale with live countdown,
  trending, new arrivals, best sellers), category tiles, brand strip, recently viewed.
- Shop / category / brand / search listings: full-text Bangla-aware search, category +
  sub-category filters, brand filters, price range, rating, discount, in-stock and
  flash-sale toggles, seven sort orders, pagination — **all filter state lives in the URL**,
  so results are shareable and the Back button undoes a filter.
- Product page: image gallery with lightbox, variant matrix (colour swatches, size chips,
  dropdowns) that drives price, compare-at price, saving, SKU, stock and quantity limits;
  delivery estimator per division/district; specifications; reviews with rating
  distribution, helpful votes and a working review form.
- Cart: line editing, quantity stepper bounded by real variant stock, coupon validation,
  delivery-method picker with fees, free-delivery progress, stale price/stock warnings with
  a one-tap re-price, recommendations, empty state.
- Checkout: contact + address (division → district → area cascades), saved addresses,
  delivery method, payment method interface (Cash on Delivery, bKash, Nagad, Rocket),
  order note, sticky summary, then a clearly marked **demo order number** (`SDX-DEMO-…`).
- Order confirmation, order tracking by order number/phone, order history, re-order,
  invoice printing, wishlist, addresses, notifications, profile and settings.
- Wishlist, cart, session, filters, recently viewed and recent searches all persist locally.

**Admin** (`/admin`)

- Overview with GMV/orders/customers/stock KPIs, revenue and category charts, recent orders,
  low-stock list.
- Product catalogue table with search/sort/pagination; create, edit, duplicate, archive and
  delete products, including variants, options, images, pricing, discounts and stock.
- Orders: filter by status/payment, detail view, status transitions (with the customer
  notification that a real system would send), invoices, returns.
- Categories, coupons, banners, sellers (approve/suspend, commission tier), customers,
  reports and demo settings.

**Seller** (`/seller`)

- Overview with the shop's sales, orders and stock alerts, scoped to the signed-in seller.
- Own product catalogue + product form (including stock and price edits), orders with
  fulfilment actions, sales/revenue/commission/payout reports, reviews with replies,
  store profile and settings.
- Commission is computed by the shared business logic (12 / 10 / 8 / 6 % by tier) — the same
  function the admin dashboard uses.

---

## 4. Repository layout

```
shobdox/
├── apps/
│   ├── web/                      # React 19 + Vite 8 + Tailwind v4 website
│   │   ├── src/
│   │   │   ├── components/ui/    # design system (buttons, forms, overlays, nav, display)
│   │   │   ├── components/layout/# storefront + dashboard shells
│   │   │   ├── features/         # catalog, checkout, orders, admin, seller, auth components
│   │   │   ├── pages/            # route entry points (storefront, auth, account, admin, seller)
│   │   │   ├── hooks/            # catalog queries, URL query state, cart, shared helpers
│   │   │   ├── services/         # the only place that reads/writes demo data
│   │   │   ├── store/            # zustand stores (data, cart, wishlist, auth, ui)
│   │   │   ├── styles/           # Tailwind layers + generated token CSS
│   │   │   └── router.tsx        # lazy route table
│   │   └── scripts/validate-dataset.ts
│   └── mobile/                   # Expo SDK 58 + Expo Router native Android app
├── packages/
│   ├── design-tokens/            # colours, spacing, radii, type scale, breakpoints
│   ├── shared-types/             # domain models + Bangla label maps
│   ├── shared-utils/             # currency, Bangla numerals, dates, phone, BD geo data
│   ├── shared-validation/        # zod schemas shared by web forms and app forms
│   ├── shared-business-logic/    # pricing, variants, cart totals, coupons, orders, analytics
│   └── shared-mock-data/         # the demo dataset: 42 products, 20 orders, people, content
└── eslint.config.mjs
```

### Why it is structured this way

- **`shared-business-logic` is the single source of truth.** Cart totals, VAT extraction
  (5 %, shown as included — never added), delivery fees, free-delivery thresholds
  (৳5,000), coupon rules, commission tiers, variant matrices, stock status, order status
  transitions and all analytics aggregations are pure functions. The website and the Android
  app call exactly the same ones, which is why a price, a discount or a payout figure can
  never disagree between platforms.
- **Screens never import the mock dataset directly.** They read through `services/*` and
  `hooks/*`; the dataset itself lives in a persisted zustand store. Swapping the fixtures for
  a real API is therefore a change to a handful of service modules, not to every screen.
- **Design tokens are generated, not typed by hand.** `packages/design-tokens` emits
  `apps/web/src/styles/tokens.generated.css` (`pnpm tokens:css`) and the app imports the same
  object. Component code uses token utilities (`bg-primary`, `text-text-secondary`,
  `rounded-card`, …) — no raw hex values in components.
- **Route-level code splitting.** Every page is a `React.lazy` chunk with a content-shaped
  Suspense fallback, so the storefront entry does not pull in `recharts` or the dashboards.

---

## 5. Design system

| Token | Value | Used for |
| --- | --- | --- |
| Primary | `#166534` | actions, links, active states |
| Primary dark | `#14532D` | hover/pressed, headings-on-light accents |
| Accent | `#F59E0B` | offers, flash sale, "buy now", ratings |
| Background | `#F8FAFC` | page canvas |
| Surface | `#FFFFFF` | cards, sheets, navbar |
| Text | `#0F172A` | primary copy |
| Muted | `#64748B` | secondary copy, meta |
| Border | `#E2E8F0` | hairlines, dividers |
| Success | `#16A34A` | in stock, paid, delivered |
| Error | `#DC2626` | validation, destructive, cancelled |

- **Breakpoints** (Tailwind v4, customised): `xs 360`, `sm 480`, `md 640`, `lg 768`,
  `xl 1024`, `2xl 1280`, `3xl 1440`. Layouts are verified at 320 / 360 / 375 / 390 / 412 /
  430 / 768 / 1024 / 1280 / 1440 px.
- **Type scale**: 12 / 13 / 14 / 15 / 16 / 18 / 20 / 24 / 28 / 32 / 40 px.
- **Radii**: `rounded-button`, `rounded-card`, `rounded-panel`, `rounded-input`,
  `rounded-chip`, `rounded-sheet`, `rounded-image`.
- **Bangla-first**: `.font-bangla` is the body face and Bangla copy is the default in every
  screen; `.font-num` (tabular figures) is used for prices, counts and tables. Counts render
  in Bangla numerals (`toBanglaDigits`) while **prices stay in Western digits** for legibility
  (`৳ 1,499`), which matches how Bangladeshi shops print price tags.
- **Motion**: Framer Motion is used sparingly (drawers, sheets, toasts) and every animation is
  skipped when `prefers-reduced-motion: reduce` is set.

---

## 6. Accessibility and performance

- Semantic landmarks (`header`/`nav`/`main`/`footer`), one `h1` per page, labelled form
  controls, visible focus rings, `role="alert"` for form errors, `aria-live` regions for cart
  total changes, `aria-pressed` on toggles, ≥44 px touch targets, skip-to-content link,
  keyboard-operable drawers/modals/carousels with focus trapping and Escape handling.
- Colour pairs in the token set were chosen for ≥4.5:1 contrast on text and ≥3:1 on large
  text/UI borders.
- Images are lazy-loaded and decode asynchronously (above-the-fold images opt into eager
  loading), every image has an inline SVG fallback so a blocked CDN cannot break the layout,
  and long Bangla strings wrap instead of clipping at 320 px.
- Skeletons mirror the content shape, and every list has an explicit empty state and an error
  state with a retry action.

---

## 7. Android app (`apps/mobile`)

- **Expo SDK 58** with **Expo Router** (file-based routes) and TypeScript.
- Genuine React Native views only — no `WebView`, no HTML.
- Ships the shopper journey: home, categories, search, product detail with variants, cart,
  checkout (demo), order confirmation, orders, wishlist, account, plus the shared Bangla
  formatting, validation and business rules.
- Runs from `apps/mobile` via `pnpm dev:mobile`; scan the QR code with **Expo Go**, or press
  `a` for an emulator. `pnpm -F @shobdox/mobile doctor` runs `expo-doctor`.

> The app talks to the same local fixtures it bundles — it does not call the website, and it
> never talks to a server.

---

## 8. Demo data

- **42 products** across 12 top-level categories (with sub-categories), 24 brands,
  18 sellers, 20 seeded orders, 6 coupons, banners, notifications, reviews and analytics.
- Images are hot-linked from Unsplash with a picsum fallback and a final inline-SVG
  placeholder, so no screen can show a broken image.
- Prices, discounts, VAT, delivery fees and order totals are **derived** through
  `shared-business-logic`, never stored as a second copy of the truth.
- `pnpm validate:data` re-checks the dataset: unique order numbers, valid coupon references,
  category queries, and that every seeded order's totals reproduce exactly through the same
  cart-total function the checkout uses.
- Local storage keys are versioned (`shobdox.data.v1`, `shobdox.cart.v1`, …). Bumping
  `DATA_SCHEMA_VERSION` in `apps/web/src/store/data.store.ts` migrates old local data back to
  the fixtures.
- **Reset:** footer → *ডেমো ডেটা রিসেট করুন* (or the escape hatch on the error screen), which
  clears every `shobdox.*` key and reloads the fixtures.

---

## 9. Verification

Everything below was run in this repository; it is the honest state of the demo.

| Check | Command | Result |
| --- | --- | --- |
| Web types | `pnpm typecheck:web` | 0 errors (strict `tsc`, `noUncheckedIndexedAccess`) |
| App types | `pnpm typecheck:mobile` | 0 errors |
| Lint | `pnpm lint` | 0 errors |
| Website build | `pnpm build` | succeeds; ~50 lazy chunks, ~2.1 MB `dist` |
| Android bundle | `cd apps/mobile && pnpm exec expo export --platform android` | Metro bundles the app (see below) |
| Demo dataset | `pnpm validate:data` | 42 products, 20 orders, unique order numbers, coupon and category queries valid |

Layouts were checked at 320 / 360 / 375 / 390 / 412 / 430 / 768 / 1024 / 1280 / 1440 px by
inspection of the token breakpoints (`xs 360`, `sm 480`, `md 640`, `lg 768`, `xl 1024`,
`2xl 1280`, `3xl 1440`) and a static scan for fixed widths, non-responsive multi-column
grids and non-wrapping long text. There is no automated visual-regression suite yet — that
is listed under known limitations.

---

## 10. Known limitations

These are deliberate boundaries of this phase, not bugs:

1. **No backend.** There is no API, database, queue or webhook. All "data" is local fixtures.
2. **No real authentication.** Sign-in only selects one of three fixture users; there is no
   token, no password storage, no password reset (the screen says so), no session expiry.
3. **No real payments.** Cash on Delivery, bKash, Nagad and Rocket appear as interface demos
   only: no wallet number, PIN, OTP or card field exists anywhere in the codebase, and no
   payment status ever becomes "paid".
4. **No real order fulfilment.** Orders, tracking, returns and invoices are local objects.
   The order number is prefixed `SDX-DEMO-` to make that unmistakable.
5. **No email/SMS/push.** Newsletter, notifications and "notify me when back in stock" only
   write to local state.
6. **No search service.** Search/sort/facets run in the browser over 42 products; ranking is
   a simple scoring function, not an Elasticsearch-grade pipeline.
7. **Single-currency, single-country.** BDT and Bangladeshi addresses only.
8. **Images are external.** If the demo machine is offline, the SVG placeholder is used
   everywhere (tested), but the photography will not appear.
9. **No automated UI tests.** Verification is type-checking, linting, the dataset validator
   and manual breakpoint checks; there is no Playwright/Vitest suite yet.
10. **Admin/seller actions are unrestricted.** Roles are mock roles; anyone can open `/admin`
    by signing in as the admin fixture. Real authorization is a backend concern.
11. **Not audited.** This is a design/engineering showcase: no penetration test, no load test,
    no legal review of the copy, and the demo credentials above are intentionally public.

---

## 11. Backend integration plan

The seams are already in place: screens never touch fixtures, and the service modules are the
only place that would change. A realistic path from this demo to a working platform:

1. **Contracts first.** Promote `packages/shared-types` to the single API contract source and
   generate an OpenAPI/GraphQL schema from it, so the web app, the Android app and the future
   services agree by construction.
2. **Replace `services/*` with HTTP calls.** Each exported function maps ~1:1 to an endpoint:

   | Service function (web/mobile) | Suggested endpoint |
   | --- | --- |
   | `catalog.service.readCatalogue` | `GET /v1/catalog/bootstrap` (products, categories, brands, banners) |
   | `runProductQuery` / `computeFacets` | `GET /v1/products?q=&cat=&brand=&min=&max=&rating=&discount=&stock=&flash=&sort=&page=` |
   | `findProductBySlug` | `GET /v1/products/:slug` |
   | `validateCoupon` | `POST /v1/coupons/validate` |
   | `computeCartTotals` | `POST /v1/cart/price` (server-side re-price is mandatory) |
   | `order.service.placeDemoOrder` | `POST /v1/orders` (idempotency key from the client) |
   | `order.service.readOrdersForCustomer` | `GET /v1/me/orders` |
   | `order.service.applyStatusChange` | `PATCH /v1/orders/:id/status` (role-scoped) |
   | `analytics.service.*` | `GET /v1/admin/analytics/*`, `GET /v1/seller/analytics/*` |

3. **Keep the pricing logic server-authoritative.** Move `shared-business-logic` into a shared
   package the API also consumes, then re-verify every total server-side; the client copy
   becomes an optimistic estimate only.
4. **State and caching.** Add TanStack Query (already a dependency) in front of the services,
   with the current zustand stores reduced to cart/wishlist/session concerns.
5. **Authentication.** Replace the fixture sign-in with an OIDC/passwordless provider for
   customers and role-based access for admin/seller; keep the demo "one-tap" buttons behind a
   build flag so presentations stay easy.
6. **Payments.** Integrate a licensed Bangladeshi PSP for bKash/Nagad/Rocket/Cards as
   *hosted* redirect flows. Never collect wallet PINs or OTPs in the app; store only the
   gateway's transaction id and a webhook-verified status.
7. **Search, media and notifications.** Replace browser filtering with a search service,
   move images to an owned CDN with responsive variants, and move the notification fixtures
   to a real provider with templates and delivery receipts.
8. **Operations.** Add migrations, backups, audit logs, rate limiting, observability, CI for
   type-check/lint/build/the dataset validator, and a staging environment with a seeded
   catalogue that mirrors production shape.

---

## 12. Conventions

- **TypeScript strict everywhere**: `noUncheckedIndexedAccess`, `verbatimModuleSyntax`,
  `noUnusedLocals`, `noUnusedParameters`, `noEmit` (Vite/Metro do the compiling).
- **Components stay small.** Route files compose features; feature folders hold the logic and
  the design-system barrel (`@/components/ui`) holds the primitives. No screen reaches into
  another screen's folder.
- **No dead controls.** Every button either changes persisted demo state, navigates, or
  explains in a toast why the action is demo-only.
- **No hardcoded brand values in components.** Colours, radii, spacing and type sizes come
  from tokens; copy that belongs to the brand comes from `shared-mock-data` or `lib/constants.ts`.
- **Comments explain *why***, not what — especially where a rule exists because the demo must
  not overstate what it is.
- **Adding a page**: create it under `apps/web/src/pages/<area>/`, register it in
  `apps/web/src/router.tsx` with a `React.lazy` import and a content-shaped fallback, and put
  any new primitives in `components/ui` if two areas need them.

---

## 13. Credits

- Product photography: [Unsplash](https://unsplash.com) demo URLs (with picsum and inline-SVG
  fallbacks). Placeholder avatars are generated from initials.
- Icons: [Lucide](https://lucide.dev).
- Bangla typography: system Bangla faces (Noto Sans Bengali / Nirmala UI / Kalpurush) to keep
  the demo dependency-free and offline-friendly.

No production-readiness, compliance or certification claim is made anywhere in this repository.
