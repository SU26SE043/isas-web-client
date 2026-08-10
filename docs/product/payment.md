# Payments & Token Billing

**Parent:** [`product-scope.md`](./product-scope.md) §5  
**Module map:** [`module-scope.md`](./module-scope.md)

Both B2C and B2B bill by **AI tokens consumed**. Users **see token usage** on the frontend. Legacy “1 credit = 1 session” and “hide tokens” (BRD D4/D15) are **retired** for the web client.

---

## B2C — Prepaid wallet + reserve/settle

### User flow

1. Candidate opens wallet at `/candidate/credits` (balance, reserved, available tokens).
2. Top up via `/candidate/subscription` → `/candidate/payment?packageId=...` → PayOS (mock redirect) → `/payment/callback`.
3. **Create practice session** at `/practice` — system **reserves** estimated tokens (`800` mock estimate).
4. Complete interview → report → system **settles** actual tokens used (`620` mock actual).
5. Usage history at `/candidate/usage` and wallet transaction log on `/candidate/credits`.

### Business rules

| Rule | Behavior |
| --- | --- |
| BR-B2C-02 | Block session create if insufficient **available** balance for reserve |
| BR-B2C-03 | Reserve estimated tokens on session create (`/practice`) |
| BR-B2C-04 | Settle actual tokens after scored report |
| BR-B2C-05 | Count tokens for CV analysis, question gen, evaluation, etc. |
| BR-B2C-06 | Display per-session and historical token usage |

### Routes

| Path | Component | Notes |
| --- | --- | --- |
| `/candidate/credits` | `CreditsWalletPage` | Wallet + transactions |
| `/candidate/usage` | `TokenUsagePage` | Per-session reserve/settle history |
| `/candidate/subscription` | `SubscriptionPlansPage` | Token packs + subscriptions |
| `/candidate/payment` | `CheckoutPage` | PayOS checkout (mock) |
| `/payment/callback` | `PaymentCallbackPage` | Return URL |

### UI contract

- Show **tokens used**, reserved, and available on wallet and session flows.
- `ReserveSettleBanner` in interview room (reserved) and result page (settled).
- `useTokenWallet` (React Query) shared wallet state.
- Prices show USD; token counts visible on packages and checkout.

### Phase 7 coverage (FS-110–116)

- **FS-110** Token wallet page with balance / reserved / available
- **FS-111** Package selection (`SubscriptionPlansPage`)
- **FS-112** Checkout + mock PayOS redirect
- **FS-113** Payment callback updates wallet
- **FS-114** Transaction history on wallet page
- **FS-115** Token usage history (`/candidate/usage`)
- **FS-116** Reserve at `/practice`, settle after report, gate checks available ≥ estimate

E2E: `e2e/specs/b2c/payment-credits.spec.ts`

Live PaymentService + PayOS integration TBD.

### Public package catalog (wired)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/payment/package` | Public | Catalog → `PackageResponse[]` (`id`, `name`, `type`, `priceVnd`, `interviewCredits`, `durationDays`, `isActive`, `createdAt`) |

Marketing `/pricing` loads this catalog via `paymentService.listCatalogPackages()` (always live). Wallet / checkout remain mock until PayOS order APIs are wired.

---

## B2B — Live package purchase and organization account

> Decision 0011 and [`employer-billing.md`](./employer-billing.md) supersede the
> earlier mock-only postpaid/invoice description below. The active frontend
> contract supports one-time credit and subscription packages, verified PayOS
> orders, organization account/subscription state, and credit transactions.
> `OrgAdmin` can purchase/cancel; `HrMember` is read-only.

### User flow (Organize)

1. Org onboarded and verified — billing profile at `/employer/billing` (*TBD*).
2. HR runs campaigns; AI usage accrues per session (screening, rubric, interviews, evaluation).
3. **No prepaid block at publish** — usage accumulates through the month.
4. Start of next month: invoice email + invoice list in Organize billing UI.

### Business rules

| Rule | Behavior |
| --- | --- |
| BR-B2B-01 | No prepaid deduction at publish |
| BR-B2B-02 | Accumulate tokens per AI session |
| BR-B2B-03 | Invoice at month start = prior month total tokens |
| BR-B2B-04 | Organize sees usage by campaign / month / session |
| BR-PAY-01 | Only Organize accesses billing and invoices |

### Routes

| Path | Component | Status |
| --- | --- | --- |
| `/employer/billing` | `EmployerBillingOverviewPage` | Live |
| `/employer/billing/invoices` | `EmployerInvoicesPage` | Live |

---

## Open product items

- Token → VND conversion (fixed vs dynamic)
- Reserve estimate formula (currently mock constant `800`)
- Abandon session: partial settle vs release reserve

---

## Status

Phase 7 B2C token wallet remains on its existing mock reserve/settle flow.
US-016 migrates Employer billing to the live PaymentService package/order/account/
subscription/transaction APIs with bounded PayOS callback verification.

## Related

- Practice session: [`practice-interview.md`](./practice-interview.md)
- Dashboard metrics: [`dashboard.md`](./dashboard.md)
