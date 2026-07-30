# US-017 Validation

## Proof Strategy

Prove exact endpoint/body behavior, response parsing, role-specific controls,
error feedback, and responsive layout before marking the story implemented.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | GET/PUT endpoints, partial update body, response normalization, invalid payload |
| Integration | Settings hook consumes live Auth organization service |
| E2E | OrgAdmin read/update, HrMember read-only, GET 403 feedback |
| Platform | i18n parity, typecheck, UI-size, production build |
| Performance | No separate benchmark; one GET on employer settings mount |
| Logs/Audit | Harness detailed trace; backend audit remains service-owned |

## Fixtures

- OrgAdmin and HrMember sessions.
- Organization `org-1` with three members.
- Deterministic `200`, `403`, and update responses.

## Commands

```text
npm test -- src/features/engagement/services/engagement.organization.service.test.ts
npm run check:i18n
npm run check:ui-size
npm run typecheck
npm run build
npx playwright test e2e/specs/smoke/auth-org-profile.spec.ts --project=chromium
```

## Acceptance Evidence

- Focused service tests: 4/4 passed.
- Chromium E2E: 5/5 passed for OrgAdmin update, HrMember read-only, GET
  `403/404`, PUT `403/404`, and draft preservation.
- i18n parity, typecheck, and production build passed.
- Desktop and 375px screenshots passed visual inspection at
  `test-results/auth-org-profile/orgadmin-{desktop,mobile}.png`.
- Global UI-size remains blocked only by the pre-existing 253-line
  `CampaignDetailView.tsx`; all files changed by US-017 are below 250 lines.
- In-app browser bootstrap failed because its desktop runtime could not resolve
  a required path; route-backed Playwright interaction and screenshots provide
  the visible UI proof.
