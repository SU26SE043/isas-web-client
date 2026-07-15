# US-010 Employer Billing

## Status

implemented

## Lane

normal

## Product Contract

Organize users can select an organization subscription, manage payment method details, view credit/seat billing state, and generate invoice PDFs from employer routes.

## Relevant Product Docs

- `docs/product/employer-billing.md`
- `docs/product/api-gateway.md`
- `docs/UI_GUIDE.md`

## BRD References

- SCR-EMP-063, SCR-EMP-064, SCR-EMP-065
- UF-109, UF-114
- FR-160-194
- BRL-013, BRL-021, BRL-024
- VR-010, VR-011, VR-012
- NOTI-084, NOTI-085

## Acceptance Criteria

- `/employer/subscription` renders B2B plans, cycle switch, active plan state, and select/renew action.
- Selecting a plan creates an invoice, adds credits to the organization pool, and shows success feedback.
- `/employer/billing` renders current plan, credit pool, seat usage, monthly postpaid token accrual, usage by campaign with per-session drill-down, renewal/grace-period state, and payment method management.
- Payment method form validates Luhn card number, future MM/YY expiry, and 3-4 digit CVV.
- `/employer/invoices` renders invoice metrics plus desktop table and mobile cards.
- Invoice PDF generation shows loading feedback and success copy for the BRL-024 60-second SLA.
- Billing routes are Organize/Admin-only inside the employer dashboard.
- All visible UI text is bilingual through `useLanguage().t()`.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `npm test` |
| Integration | Pending live PaymentService contract; mock service covered by manual flow |
| E2E | `npm run test:e2e`; manual Phase 12 browser flow |
| Platform | `npm run check:ui-size`, `npm run check:i18n`, `npm run typecheck`, `npm run build` |
| Release | Not in this story |

## Evidence

- `npm run check:ui-size` passed.
- `npm run check:i18n` passed.
- `npm run typecheck` passed.
- `npm test` passed: 3 files, 12 tests.
- `npm run build` passed with existing CSS import, `/history-bg.jpg`, chunk-size, and plugin timing warnings.
- `npm run test:e2e` passed: 2 Chromium smoke tests.
- `harness-cli story verify US-010` passed.
- Manual visible UI verification screenshots: `test-results/phase12-ui/01-subscription-desktop.png`, `02-subscription-selected.png`, `03-billing-desktop.png`, `04-billing-payment-saved.png`, `05-invoices-desktop.png`, `06-invoices-pdf-generated.png`, `07-billing-mobile.png`.
