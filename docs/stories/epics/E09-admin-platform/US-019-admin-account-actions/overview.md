# Overview

## Current Behavior

The live Admin user directory exposes ban metadata but no Auth-backed account actions.

## Target Behavior

Platform Admins can ban, unban, and reset a user's password from `/admin/users`, with confirmation, localized errors, and accurate token-lifecycle warnings.

## Affected Users

- Platform `Admin` and accounts targeted by an Admin action.

## Affected Product Docs

- `docs/product/admin-platform.md`
- `docs/product/auth-profile.md`

## Non-Goals

- Immediate revocation of already-issued access tokens.
- Backend audit-log or Identity lockout changes.
