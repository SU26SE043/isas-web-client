# US-016 Live Employer Payment — Design

## Domain Model

- Packages are `OneTime` or `Subscription`.
- Orders are owned by a user or organization and move from `Pending` to a terminal
  state: `Paid`, `Failed`, `Expired`, `Cancelled`, or `Refunded`.
- Payment account and subscription are separate resources and must always be queried
  independently.
- `OrgAdmin` may purchase/cancel; `HrMember` may inspect billing state only.

## Application Flow

1. Load each billing section with an independent TanStack Query.
2. Create an order with package, return, and cancel URLs derived from
   `window.location.origin`.
3. Persist only pending order/package identifiers and package type in `sessionStorage`,
   then redirect to the returned checkout URL.
4. Callback resolves `orderId`, then `id`, then stored pending order ID.
5. Poll status every three seconds for at most two minutes and stop on terminal status
   or unmount.
6. On `Paid`, invalidate order, account, subscription, and transaction queries. One-time
   success presents account credit; subscription success presents subscription state.

## Interface Contract

Public:

- `GET /api/v1/payment/package`
- `GET /api/v1/payment/package/{id}`

Authenticated:

- `POST /api/v1/payment/order`
- `GET /api/v1/payment/order/my-orders`
- `GET /api/v1/payment/order/{id}`
- `GET /api/v1/payment/order/{id}/status`
- `DELETE /api/v1/payment/order/{id}`
- `GET /api/v1/payment/me/account`
- `GET /api/v1/payment/me/credit-transactions`
- `GET /api/v1/payment/me/subscription`

Routes:

- `/employer/billing`
- `/employer/billing/packages`
- `/employer/billing/orders`
- `/employer/billing/orders/:orderId`
- `/employer/billing/transactions`
- `/employer/payment/success`
- `/employer/payment/cancel`

## Data Model

No client persistence beyond minimal pending-order session keys. No schema or migration.

## UI / Platform Impact

Employer billing becomes a route-based tab surface inside `EmployerDashboardLayout`.
Desktop uses shared tables; tablet/mobile uses stacked cards. Existing dark monochrome
tokens, semantic status colors, shared buttons/dialogs, and cursor pagination are reused.

## Observability

API errors are mapped to safe action-specific messages. Raw backend stack traces and
provider URLs are never rendered or persisted.

## Alternatives Considered

1. Extend the existing mock pages: rejected because it preserves divergent types and
   cannot prove the live PaymentService contract.
2. Reuse Candidate pages unchanged: rejected because Employer ownership, roles,
   subscription semantics, callback routes, and empty states differ.

