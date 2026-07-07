# Food Cost Calculator

A mobile-first Progressive Web App for simulating catering costs and profitability. Built with
React, TypeScript, Vite, and Fluent UI v9.

## Concepts

- **Menus** are served independently and carry no cost data - just a name, description,
  ingredients (name/quantity/unit only), a reference portion size, and a preferred sell price.
- **Ingredients** are managed as a shared catalog (Settings → Ingredients) that also powers
  autocomplete when adding an ingredient line to a menu.
- **The Cost Simulator** is the only place costing exists: pick any number of menus, set a
  quantity and estimated sell price for each, add one shared set of overhead costs (transport,
  labor, packaging, utilities, misc.), and price every ingredient - the simulator computes
  combined cost, revenue, profit, margin, markup, and checks the result against a 3x-cost
  pricing target.

## Features

- Live calculations everywhere — no "Calculate" button
- Menu management: create, rename, duplicate, delete (with undo), favorites
- Drag-to-reorder ingredients, with name autocomplete from the shared ingredient catalog
- Multi-menu cost simulator with a 3x-cost target indicator
- Dashboard is a lightweight overview (menu/ingredient counts + quick actions) — no financial
  metrics live there by design
- Language (EN / FR / AR with RTL) and light/dark/system theme
- Installable PWA with offline support (service worker via `vite-plugin-pwa`)
- **Local-first data**: everything is written to `localStorage` immediately and works fully
  offline with no login
- **Real-time shared sync** (optional, requires Firebase config): when enabled, menus and the
  ingredient catalog sync live to everyone who has the app open — there's no per-user account,
  it's one shared dataset for the whole team
- **PIN gate**: the whole app is behind a single shared PIN before rendering anything

### ⚠️ About the PIN gate — read before relying on it

The PIN (`110799`, in `src/shared/lib/appLock.ts`) is a **client-side-only** convenience gate. It
keeps casual visitors out of the UI, but it is not a real access-control boundary:

- The PIN ships inside the built JavaScript bundle — anyone can read it via browser dev tools.
- It does **not** protect the Firebase Realtime Database directly. Database access is controlled
  entirely by Firebase security rules (see below) and requires *some* authenticated principal
  (the app signs in anonymously behind the scenes), not the PIN itself.
- If you need real security (e.g. this data becomes sensitive, or you want to keep out people who
  inspect network requests), you'd need server-verified auth — a Cloud Function that checks the
  PIN and mints a custom Firebase token, or per-user accounts — rather than a hardcoded client
  constant.

This is intentionally the simple version for a small, trusted team. Treat it as a lock on the
front door, not a vault.

## Firebase setup (optional — the app works fully offline without it)

1. In the Firebase console, enable **Anonymous** as a sign-in provider (Authentication → Sign-in
   method). The app signs in silently in the background — there's no visible login step, since
   everyone shares the same data.
2. Set Realtime Database rules so any authenticated (including anonymous) client can read/write
   the shared data, and nothing else:
   ```json
   {
     "rules": {
       "shared": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```
3. Copy `.env.example` to `.env` and fill in your Firebase project's web config
   (`VITE_FIREBASE_*` values from Project settings → General → Your apps).
4. For the deployed GitHub Pages build, add the same `VITE_FIREBASE_*` values as **repository
   secrets** (Settings → Secrets and variables → Actions) — `.github/workflows/deploy.yml` reads
   them from there since `.env` itself is gitignored.

Without a `.env` file, `firebaseEnabled` is `false` and the app runs local-only with no errors.

## Development

```bash
npm install
npm run dev
```

## Testing

Pure calculation logic (`src/features/costing/calculations.ts`) is covered by unit tests:

```bash
npm test
```

## Building

```bash
npm run build   # type-checks then builds to dist/
npm run preview # serve the production build locally
```

## Deploying to GitHub Pages

This repo is configured to publish to `https://<username>.github.io/catering-calculator/`.

- `vite.config.ts` sets `base: '/catering-calculator/'` for production builds only (dev server
  still runs at `/`).
- Routing uses `HashRouter`, so deep links work without any server-side rewrite rules.
- `.github/workflows/deploy.yml` builds and publishes to GitHub Pages automatically on every push
  to `main` (via the built-in Pages GitHub Actions deployment, no `gh-pages` branch needed —
  just enable "GitHub Actions" as the Pages source in the repo settings).

If you rename the repository, update the `base` path in `vite.config.ts` to match.

To publish manually instead: `npm run deploy` (uses the `gh-pages` package to push `dist/` to a
`gh-pages` branch).
