# US-017 Exec Plan

## Goal

Connect employer settings to the live Auth organization read/update contract.

## Scope

In scope:

- Endpoint, parser, service, hook, role-aware form, bilingual copy.
- Unit, E2E, responsive UI, type, i18n, and build proof.

Out of scope:

- Company verification and onboarding mock replacement.
- Platform-wide organization administration.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Public contracts.
- Existing behavior.

Hard gates:

- Auth.
- Authorization.

## Work Phases

1. Audit existing endpoint coverage.
2. Record the role boundary.
3. Implement the smallest settings slice.
4. Verify role, error, API-body, and responsive behavior.
5. Update Harness evidence.

## Stop Conditions

Pause for human confirmation if the backend grants platform `Admin` tenant
context or changes the `OrganizationResponse` shape.
