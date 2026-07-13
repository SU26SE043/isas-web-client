# US-014 B2B E2E Full Journey

## Status

implemented

## Lane

normal

## Product Contract

Phase 15 must prove the B2B production regression path: a candidate opens a
magic link, completes the proctored assessment flow, records a proctoring
violation, completes the interview, and an Organize user can review the
postpaid token usage invoice.

## Relevant Product Docs

- `docs/product/product-scope.md`
- `docs/product/campaign-assessment.md`
- `docs/product/payment.md`
- `docs/product/employer-billing.md`
- `docs/FRONTEND_MASTER_PLAN.md`

## Acceptance Criteria

- Playwright covers `/invite/:token` through enrollment, prepare, device check,
  identity capture, waiting room, interview room, proctoring tab-switch alert,
  completion, and assessment id display.
- Playwright covers `/employer/invoices` as an Organize user and verifies the
  token usage invoice table plus PDF generation success state.
- Playwright configuration includes Chromium, Firefox, and WebKit projects for
  Phase 15 browser coverage.
- E2E media flow is deterministic in CI through test-owned camera/microphone and
  recorder mocks.

## Design Notes

- Commands: `npm run test:e2e`.
- Queries: no backend seed; auth state is seeded via Playwright localStorage.
- API: existing mock services remain the backing source for campaign,
  practice, and invoice data.
- Tables: invoice UI now exposes `tokenUsage` for B2B postpaid usage evidence.
- Domain rules: BR-B2B-12-23, BR-B2B-01-04, BR-PAY-01.
- UI surfaces: `/invite/phase8-valid`, `/interview/:sessionId/*`,
  `/employer/invoices`.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-014 --unit 0 --integration 0 --e2e 1 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | Existing unit suite remains green. |
| Integration | Not required; mock services drive this frontend regression. |
| E2E | `npm run test:e2e` passes the B2B full-journey spec and smoke specs. |
| Platform | Playwright projects cover Chromium, Firefox, and WebKit. |
| Release | `npm run build` passes. |

## Harness Delta

Add US-014 to durable Harness matrix with Phase 15 E2E evidence.

## Evidence

- `e2e/specs/b2b/full-journey.spec.ts`
