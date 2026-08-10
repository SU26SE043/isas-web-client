# Overview

## Current Behavior

The magic-link join page mapped every `403 Forbidden` response to an invitation-email mismatch message.

## Target Behavior

Only an explicit backend marker for `INVITATION_EMAIL_MISMATCH` produces the account-mismatch UI. The user can switch accounts without losing the invite token; all other forbidden responses retain generic error handling.

## Affected Users

- Candidate opening an employer campaign invitation while signed in to another account.

## Affected Product Docs

- `docs/product/campaign-discovery.md`
- `docs/product/auth-profile.md`

## Non-Goals

- Changing the backend response contract or invitation metadata.
- Redesigning the shared authentication UI.
