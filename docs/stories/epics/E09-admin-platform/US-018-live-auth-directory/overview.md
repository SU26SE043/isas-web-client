# US-018 Live Admin Auth Directory

## Current Behavior

The Admin Users page reads a local snapshot and offers a mock suspend action.
There is no Admin organization directory.

## Target Behavior

Platform Admin can browse live organization and account directories with
server-side search, role filters, cursor pagination, and ban metadata.

## Affected Users

- Platform `Admin`.

## Affected Product Docs

- `docs/product/admin-platform.md`
- `docs/product/auth-profile.md`
- `docs/decisions/0015-admin-directory-access-boundary.md`

## Non-Goals

- Ban, unban, role, or organization mutations.
- Allowing tenant roles to access platform-wide directories.
