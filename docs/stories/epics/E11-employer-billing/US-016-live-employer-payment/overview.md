# US-016 Live Employer Payment — Overview

## Current Behavior

Employer billing uses feature-local mock state for subscription selection, card details,
postpaid usage, and invoice PDF generation. Existing shared payment code only wires a
partial package/order contract for the Candidate surface.

## Target Behavior

Replace the Employer mock billing journey with the live PaymentService package-purchase
flow. Employer users can inspect account, subscription, packages, orders, and credit
transactions. `OrgAdmin` can create and cancel orders; `HrMember` has read-only access.
PayOS success/cancel callbacks verify the order status before rendering an outcome.

## Affected Users

- `OrgAdmin`
- `HrMember`
- Platform `Admin` for support access

## Affected Product Docs

- `docs/product/employer-billing.md`
- `docs/product/payment.md`
- `docs/product/api-gateway.md`
- `docs/FRONTEND_MASTER_PLAN.md`

## Non-Goals

- Candidate wallet/reserve/settle redesign.
- Invoice settlement UI or synthetic invoice routes.
- Reusing an old checkout URL from order history.
- Payment-method collection in the browser.
- Backend changes, PayOS webhooks, refunds, or subscription cancellation.

