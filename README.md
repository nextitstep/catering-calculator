# Food Cost Calculator

A mobile-first Progressive Web App for calculating food production costs, selling prices, and
profitability for a catering / meal-preparation business. Built with React, TypeScript, Vite, and
Fluent UI v9.

## Features

- Live cost calculations (ingredients, packaging, transport, labor, utilities, misc.) — no
  "Calculate" button, everything updates as you type
- Recipe management: create, rename, duplicate, delete (with undo), favorites, recents
- Drag-to-reorder ingredient list
- Selling price simulator with slider, pricing-tier suggestions, and a live profit-vs-price chart
- Dashboard KPIs and cost-breakdown charts (bar / pie / line via Recharts)
- Printable report with CSV (Excel) export and print-to-PDF
- Currency (DA / EUR / USD), language (EN / FR / AR with RTL), and light/dark/system theme
- Installable PWA with offline support (service worker via `vite-plugin-pwa`)
- All data is stored locally in the browser (`localStorage`) — nothing leaves the device

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
