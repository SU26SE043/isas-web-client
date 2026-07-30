# US-018 Validation

## Proof Strategy

Prove exact endpoint/query/header parsing, response normalization, Admin-only
route behavior, error handling, and desktop/mobile directory presentation.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Both endpoints, query trimming/clamping, cursors, user/org parsing |
| Integration | React Query consumes live Auth directory services |
| E2E | Search, role, cursor, limit, Admin 403, other-role and anonymous guards |
| Platform | i18n parity, UI-size, typecheck, production build |
| Performance | Cursor pages capped at 500; UI defaults to 20 |
| Logs/Audit | No sensitive payload logging; Harness detailed trace |

## Fixtures

- Admin, Candidate, and anonymous sessions.
- Two organizations and two users across cursor pages.
- `401/403` responses and exposed `X-Next-Cursor`.

## Commands

```text
npm test -- src/features/admin/utils/adminDirectoryApi.test.ts
npm run check:i18n
npm run check:ui-size
npm run typecheck
npm run build
npx playwright test e2e/specs/admin/auth-directory.spec.ts --project=chromium
```

## Acceptance Evidence

- Focused parser/service tests: 4/4 passed.
- Chromium E2E: 3/3 passed for exact search/role/cursor/limit queries,
  `X-Next-Cursor`, backend `403`, Candidate denial, and anonymous redirect.
- Existing Admin platform Chromium regression: 2/2 passed after replacing its
  user-list fixture with the live Auth response shape.
- i18n parity, typecheck, and production build passed.
- Desktop and 375px organization directory screenshots passed visual
  inspection at `test-results/admin-auth-directory/organizations-{desktop,mobile}.png`.
- Global UI-size remains blocked only by the pre-existing 253-line
  `CampaignDetailView.tsx`; all US-018 UI files are below 250 lines.
