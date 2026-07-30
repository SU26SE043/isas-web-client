# Employer Billing Contract

BRD baseline: FR-160-194, SCR-EMP-063-065, UF-109, UF-114. Live contract
override: decision 0011 and US-016.

## Scope

US-016 replaces the Phase 12 mock with the live organization PaymentService flow:

- `/employer/billing` shows payment-account and subscription state plus recent orders and transactions.
- `/employer/billing/packages` lists active one-time credit and subscription packages.
- `/employer/billing/orders` and `/employer/billing/orders/:orderId` show live order history/detail.
- `/employer/billing/transactions` shows cursor-paginated credit movements.
- `/employer/payment/success` and `/employer/payment/cancel` verify PayOS return state.

Candidate wallet/payment screens stay governed by `docs/product/payment.md`.

## Roles

`OrgAdmin` and platform `Admin` can view and mutate billing. `HrMember` can view account,
subscription, packages, orders, and transactions but cannot create or cancel orders.
The UI explains the restriction and still treats backend `403` as authoritative.

## Live Contract

All calls use the shared authenticated client except the public package catalog.
Account and subscription are independent resources; a 200 response with zero credit or
`active=false` is a valid empty state. Order callbacks poll only while `Pending`, every
three seconds, for at most two minutes, and stop on unmount or terminal status.

Endpoints:

- `GET /api/v1/payment/package`
- `GET /api/v1/payment/package/{id}`
- `POST /api/v1/payment/order`
- `GET /api/v1/payment/order/my-orders`
- `GET /api/v1/payment/order/{id}`
- `GET /api/v1/payment/order/{id}/status`
- `DELETE /api/v1/payment/order/{id}`
- `GET /api/v1/payment/me/account`
- `GET /api/v1/payment/me/credit-transactions`
- `GET /api/v1/payment/me/subscription`

## Deferred

- Invoice settlement/detail UI until an invoice API/route exists.
- Refund controls, subscription cancellation, and auto-renew controls.
- Provider tokenization and card collection; checkout is hosted by PayOS.
- Multi-seat workflows.

## Related

- [`payment.md`](./payment.md)
- [`api-gateway.md`](./api-gateway.md)
- [`../decisions/0011-live-employer-payment-contract.md`](../decisions/0011-live-employer-payment-contract.md)
- [`../stories/epics/E11-employer-billing/US-016-live-employer-payment/overview.md`](../stories/epics/E11-employer-billing/US-016-live-employer-payment/overview.md)
