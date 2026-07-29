# Validation

## Proof Strategy

Prove exact query parameters, strict parsing, role guarding, live dashboard values, grouping changes, errors, and responsive rendering.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Query cleanup, complete response parsing, malformed count rejection |
| Integration | React Query refetches when `groupBy` changes |
| E2E | Admin sees live metrics; Candidate makes no request |
| Platform | Typecheck, i18n, build, UI size |
| Accessibility | Chart has text labels and hidden tabular equivalent |

## Fixtures

- Admin session and deterministic 30-day analytics payload.

## Commands

```text
npm test -- --run src/features/admin/utils/adminAnalyticsApi.test.ts
npm run typecheck
npm run check:i18n
npx playwright test e2e/specs/admin/auth-analytics.spec.ts --project=chromium
npx vite build
```

## Acceptance Evidence

- Analytics service/parser unit suite: 3/3 passed.
- TypeScript and i18n parity passed.
- Vite production build passed with the existing large-chunk warning.
- Chromium analytics and Admin regression suite: 5/5 passed.
- Desktop and 375px screenshots were visually inspected.
- UI-size reports only the pre-existing 253-line `CampaignDetailView.tsx`.
