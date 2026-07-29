# Exec Plan

## Goal

Ship the three Admin account mutation APIs without duplicating the existing live directory.

## Scope

In scope: service contracts, hooks, dialogs, errors, tests, and docs.

Out of scope: instant access-token eviction and backend changes.

## Risk Classification

Flags: auth, authorization, audit/security, public contracts, existing behavior.

Hard gates: auth and authorization.

## Work Phases

1. Audit the live directory and record the contract.
2. Implement the service and UI slice.
3. Run unit, static, build, and browser proof.
4. Update Harness evidence.

## Stop Conditions

Pause if the backend contract diverges or validation must be weakened.
