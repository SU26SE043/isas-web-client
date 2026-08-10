# 0011 Live Employer Payment Contract

Date: 2026-07-28

## Status

Accepted

## Context

Employer billing was implemented as a mock postpaid subscription/invoice experience.
The accepted PaymentService contract now supports packages, PayOS-backed orders, an
organization payment account, credit transactions, and current subscription state.
It also grants `HrMember` read-only visibility while restricting purchase and cancel
actions to organization administrators.

## Decision

The Employer billing surface will use the public `/api/v1/payment` contract directly
through the shared authenticated client and parse unknown responses at the service
boundary. Payment callbacks never trust URL outcome text; they resolve an order ID and
poll the status endpoint with a bounded lifecycle. Server state stays in TanStack Query.
Only pending identifiers and package type are stored in session storage.

The live package/account/subscription model supersedes the mock Employer card-payment,
synthetic invoice-generation, seat-limit, and monthly usage behavior. Candidate
reserve/settle behavior remains unchanged.

## Alternatives Considered

1. Keep the mock Employer service beside the live flow. Rejected because two billing
   truths create authorization and financial-state ambiguity.
2. Redirect Employers through Candidate routes. Rejected because ownership, roles,
   callback semantics, and success copy are different.

## Consequences

Positive:

- Payment outcome is verified against backend state.
- Employer read/write authorization is explicit.
- Account and subscription no-data states remain valid independently.

Tradeoffs:

- Old mock invoice/payment-method UI is retired.
- Invoice settlement is now available through the v10 invoice endpoints; refund and auto-renew controls remain deferred.

## Follow-Up

- Add browser E2E against a deterministic PaymentService/PayOS sandbox fixture.
- Add browser E2E against a deterministic PaymentService/PayOS invoice fixture.

