# Employer Billing Contract

BRD: FR-160-194, SCR-EMP-063-065, UF-109, UF-114, BRL-013, BRL-021, BRL-024, VR-010-012, NOTI-084/085.

## Scope

Phase 12 implements organization billing UI only. Phase 15 covers the B2B
billing invoice path with Playwright regression:

- `/employer/subscription` lets Organize/Admin users compare and select B2B subscription plans.
- `/employer/billing` shows subscription status, org credit pool, seat usage, monthly postpaid token accrual, usage by campaign with per-session drill-down, renewal/grace-period state, and payment method management.
- `/employer/invoices` lists postpaid token usage invoices and simulates timestamped PDF generation inside the BRL-024 60-second SLA.

Candidate wallet/payment screens stay in `docs/product/payment.md`; this contract is B2B employer billing.

## Roles

Billing routes are nested under `EmployerDashboardLayout` and guarded for `organize` and `admin` only.

## Validation

- VR-010: card number must pass Luhn.
- VR-011: expiry must be `MM/YY` in the future.
- VR-012: CVV must be 3 or 4 digits.

## Deferred

- Live PaymentService, provider tokenization, refund/tax editing, and actual PDF download endpoints.
- Multi-seat add/remove workflows beyond displaying BRL-021 limits.
