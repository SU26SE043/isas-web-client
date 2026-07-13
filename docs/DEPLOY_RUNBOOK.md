# ISAS Web Client — Production Deploy Runbook

## Prerequisites

- Node.js 22+
- Vercel project linked (`vercel link`) or GitHub integration
- Gateway API URL for production (`VITE_API_BASE_URL`)
- Optional: Sentry DSN (`VITE_SENTRY_DSN`)

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes (prod) | Gateway base URL, e.g. `https://api.isas.example.com` |
| `VITE_SENTRY_DSN` | No | Error reporting endpoint |
| `VITE_ENABLE_ENTERPRISE_SSO` | No | Set `true` when tenant SSO is enabled |

Copy `.env.example` to `.env.production.local` for local production preview.

## Pre-deploy verification

```bash
npm ci
npm run typecheck
npm run test
npm run build
npm run check:i18n
npm run test:e2e
```

E2E runs against `vite preview` on port `4173` (see `playwright.config.ts`).

## Deploy to Vercel

```bash
npm run vercel:deploy
```

SPA routing is handled by `vercel.json` (`/(.*)` → `/index.html`).

## Post-deploy smoke

1. Open `/` — landing loads, dark theme, meta tags present.
2. Open `/login` — auth form renders.
3. Open `/maintenance` — maintenance copy renders (SCR-SHR-092).
4. Open `/unknown-path` — 404 page renders.
5. Confirm API calls hit the configured gateway (network tab).

## Rollback

1. Promote previous Vercel deployment from the dashboard, or
2. `git revert` the release commit and redeploy.

## CI artifacts

GitHub Actions uploads `playwright-report/` on every E2E run. Download from the workflow run when investigating failures.

## Maintenance mode

- Public page: `/maintenance` (static copy for candidates/employers).
- Admin scheduler: `/admin/maintenance` (mock schedule in dev; wire to backend for production).
