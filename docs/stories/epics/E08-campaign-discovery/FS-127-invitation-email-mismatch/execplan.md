# Exec Plan

## Goal

Explain an invitation-email mismatch clearly and enable a safe account switch while preserving the magic-link continuation.

## Scope

In scope:

- Explicit error classification in the campaign candidate service.
- Stable mismatch state and account-switch CTA on the live magic-link page.
- Bilingual copy, unit proof, and product-contract update.

Out of scope:

- Backend API changes, invite-email disclosure, and auth UI redesign.

## Risk Classification

Risk flags:

- Auth and existing behavior.
- Public client-visible API error contract.

Hard gates:

- Auth logout and return-path handling.

## Work Phases

1. Inspect current service, auth continuation, and error handling.
2. Define explicit mismatch classification.
3. Implement the stable UI state and shared logout/login handoff.
4. Add regression tests and validate UI/platform checks.
5. Record completion evidence.

## Stop Conditions

Pause for human confirmation if the backend uses a different, undocumented mismatch marker or the shared auth continuation cannot restore the invite URL.
