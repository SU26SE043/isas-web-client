# US-016 Live Employer Payment — Exec Plan

## Goal

Ship a complete, API-backed Employer package purchase and payment-verification flow.

## Scope

In scope:

- Employer billing overview, package catalog/detail, order list/detail, and credit transactions.
- Payment account and subscription summaries with independent query states.
- Order creation, session handoff, callback polling, cancellation, query invalidation.
- Role-aware read/write behavior, bilingual copy, responsive dark UI, and automated proof.

Out of scope:

- Candidate payment behavior.
- Backend contract implementation.
- Invoice download, refund controls, and subscription auto-renew settings.

## Risk Classification

Risk flags:

- Authorization.
- External systems.
- Public contracts.
- Existing behavior.
- Weak proof.
- Multi-domain.

Hard gates:

- Authorization.
- External provider behavior.

## Work Phases

1. Reconcile the accepted change request with product docs and the mock implementation.
2. Define parsed API DTOs, query keys, pagination, callback storage, and polling rules.
3. Implement the smallest complete Employer vertical flow.
4. Add unit/component tests for contract, roles, mutations, polling, and cleanup.
5. Run static, unit, build, and visible browser verification.
6. Update Harness evidence.

## Stop Conditions

Pause for human confirmation if:

- The backend response differs materially from the supplied contract.
- Payment ownership or role rules conflict with authenticated claims.
- A validation requirement must be weakened.
- Implementation would require a new backend or PayOS capability.

