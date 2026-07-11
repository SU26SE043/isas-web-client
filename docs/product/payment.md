# Candidate Payments (B2C)

BRD: FR-160-194, SCR-CAN-026-028, UF-010, BRL-003 (USD), BRL-062 (no negative balance).

## User flow (UF-010)

1. Candidate opens credit wallet at `/candidate/credits`.
2. Chooses a one-time package or subscription at `/candidate/subscription`.
3. Checkout summary at `/candidate/payment?packageId=...`.
4. Redirect to PayOS (mock: internal `/payment/callback`).
5. Callback verifies payment and credits wallet.
6. Practice interview gate reads updated balance (1 credit per session).

## Routes

| Path | Component |
| --- | --- |
| `/candidate/credits` | `CreditsWalletPage` |
| `/candidate/subscription` | `SubscriptionPlansPage` |
| `/candidate/payment` | `CheckoutPage` |
| `/payment/callback` | `PaymentCallbackPage` |

## UI contract

- Show **credits**, never token costs (D4/D15).
- Prices in USD.
- Zero credits blocks practice CTA with link to wallet.
- Transaction history on wallet page.

## Status

Phase 7 on `phase-7-candidate-payments` — mock PayOS redirect + wallet service. Live PaymentService/PayOS integration TBD.

## Related

- Practice credit gate: `docs/product/practice-interview.md`
- Dashboard credits metric: `docs/product/dashboard.md`
