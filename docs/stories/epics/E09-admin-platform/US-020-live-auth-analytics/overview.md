# Overview

## Current Behavior

The Admin dashboard renders user metrics from the Phase 13 mock snapshot.

## Target Behavior

The dashboard reads the Admin-only Auth analytics contract for user, organization, activity, login, role, and time-bucket metrics. Health and audit panels remain on their existing mock boundary.

## Affected Users

- Platform `Admin`.

## Affected Product Docs

- `docs/product/admin-platform.md`
- `docs/product/auth-profile.md`

## Non-Goals

- Live service health or audit logs.
- Custom arbitrary date-range controls.
