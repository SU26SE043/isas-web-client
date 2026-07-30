# US-016 Live Employer Payment — Validation

## Proof Strategy

Prove API parsing at the service boundary, role-aware actions in components, deterministic
callback polling/cleanup, mutation de-duplication, independent overview sections, cursor
pagination, and responsive visible UI.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Enum/status mappings, VND/date/delta formatting, order ID precedence, terminal status |
| Integration | Package/order/account/subscription/transaction parsing, headers, error mapping |
| E2E | OrgAdmin purchase redirect, callback outcomes, cancel confirmation, HrMember read-only |
| Platform | i18n parity, UI-size, TypeScript, production build, desktop/tablet browser QA |
| Performance | Poll every 3 seconds, stop by 2 minutes, no timer after unmount |
| Logs/Audit | No checkout URL persistence or raw stack trace presentation |

## Fixtures

- Active one-time and subscription packages.
- Active/suspended account and active/inactive subscription.
- Pending and each terminal order status.
- Positive/negative credit transactions and cursor headers.
- `OrgAdmin` and `HrMember` authenticated users.

## Commands

```text
npm run check:i18n
npm run check:ui-size
npm run typecheck
npm test -- --run
npm run build
```

## Acceptance Evidence

- Focused Employer payment tests: 3 files, 12 tests passed.
- Full Vitest run: 45 files and 205 tests passed; one unrelated
  `EndCampaignDialog.test.tsx` accessible-name assertion failed because the shared
  loading spinner contributes `Loading` to the button name.
- `npm run check:i18n` passed for 16 translation files.
- TypeScript project check passed with a 4096 MB Node heap.
- Production build passed: 4,129 modules transformed. Existing large-chunk and Babel
  plugin timing warnings remain.
- `check:ui-size` confirms every US-016 UI file is below 250 lines; the repository-wide
  command remains red on the pre-existing 253-line
  `src/features/employer-campaigns/components/CampaignDetailView.tsx`.
- Visible in-app browser QA passed for desktop and 768 px tablet: overview, route-based
  package tab, order list, Pending cancel dialog, and zero console warnings/errors.
- Screenshots: `test-results/us016-ui/01-overview-desktop.png`,
  `02-packages-desktop.png`, `03-packages-tablet.png`,
  `04-cancel-dialog-tablet.png`.
