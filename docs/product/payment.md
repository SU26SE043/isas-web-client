# Payments & Token Billing

**Parent:** [`product-scope.md`](./product-scope.md) §5  
**Module map:** [`module-scope.md`](./module-scope.md)

Both B2C and B2B bill by **AI tokens consumed**. Users **see token usage** on the frontend. Legacy “1 credit = 1 session” and “hide tokens” (BRD D4/D15) are **retired** for the web client.

---

## B2C — Prepaid wallet + reserve/settle

### User flow

1. Candidate opens wallet at `/candidate/credits` (balance shown as token budget / VND equivalent TBD).
2. Top up via `/candidate/payment?packageId=...` → PayOS → `/payment/callback`.
3. **Create practice session** at `/practice` — system **reserves** estimated tokens.
4. Complete interview → report → system **settles** actual tokens used.
5. Usage history visible on wallet / usage screen.

### Business rules

| Rule | Behavior |
| --- | --- |
| BR-B2C-02 | Block session create if insufficient balance for reserve |
| BR-B2C-03 | Reserve estimated tokens on session create |
| BR-B2C-04 | Settle actual tokens after report |
| BR-B2C-05 | Count tokens for CV analysis, question gen, evaluation, etc. |
| BR-B2C-06 | Display per-session and historical token usage |

### Routes

| Path | Component | Notes |
| --- | --- | --- |
| `/candidate/credits` | `CreditsWalletPage` | Wallet + token usage (update from credit-only UI) |
| `/candidate/subscription` | `SubscriptionPlansPage` | Review alignment with token packs |
| `/candidate/payment` | `CheckoutPage` | PayOS checkout |
| `/payment/callback` | `PaymentCallbackPage` | Return URL |
| `/candidate/usage` | *TBD* | Token usage history (Tier 1 — missing route) |

### UI contract

- Show **tokens used** and estimated reserve/settle on session flows.
- Show wallet balance sufficient for reserve before practice CTA.
- Prices may show VND; token counts must be visible.
- Transaction and usage history on wallet/usage pages.

---

## B2B — Postpaid monthly by tokens

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

### Routes (planned)

| Path | Component | Status |
| --- | --- | --- |
| `/employer/billing` | *TBD* | Missing — Tier 1 |
| `/employer/billing/invoices` | *TBD* | Missing — Tier 1 |

---

## Open product items

- Token → VND conversion (fixed vs dynamic)
- Reserve estimate formula
- Abandon session: partial settle vs release reserve

---

## Status

Payment routes exist with **mock** PayOS and credit-based UI. **Rework required** for token reserve/settle (B2C) and monthly usage/invoices (B2B).

## Related

- Practice session: [`practice-interview.md`](./practice-interview.md)
- Dashboard metrics: [`dashboard.md`](./dashboard.md)
