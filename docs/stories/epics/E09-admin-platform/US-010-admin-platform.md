# US-010 Admin Platform

## Status

implemented

## Lane

normal

## Product Contract

Admins can access a dedicated admin portal with dashboard, user/RBAC management, audit logs, AI/system configuration, feature flags, health monitoring, maintenance scheduling, and operational queues.

## Relevant Product Docs

- `docs/product/admin-platform.md`
- `docs/product/api-gateway.md`
- `docs/UI_GUIDE.md`

## BRD References

- SCR-ADM-069 through SCR-ADM-088
- UF-201 through UF-213
- FR-255 through FR-289
- BRL-010, BRL-019, BRL-020, BRL-029, BRL-033, BRL-053, BRL-060, BRL-065

## Acceptance Criteria

- `/admin/*` uses `AdminDashboardLayout` and is Admin-only.
- Admin dashboard shows platform KPIs, service health, and recent audit activity.
- User management supports search and account suspend action.
- Role and permission management expose RBAC roles and permission groups.
- AI config supports threshold edit and shows dual-sign pending state.
- Audit log viewer is immutable/read-only and includes hash evidence.
- System config and feature flags surface dual-sign and tenant isolation rules.
- Monitoring, health, backup, maintenance, support, content, learning, reports, campaign moderation, candidate admin, and approval queues are routable.
- All visible UI text is bilingual through `useLanguage().t()`.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `npm test` |
| Integration | Pending live Admin APIs; mock service covered by manual flow |
| E2E | `npm run test:e2e`; manual Phase 13 browser flow |
| Platform | `npm run check:ui-size`, `npm run check:i18n`, `npm run typecheck`, `npm run build` |
| Release | Not in this story |

## Evidence

- `npm run check:ui-size` passed.
- `npm run check:i18n` passed.
- `npm run typecheck` passed.
- `npm test` passed: 3 files, 12 tests.
- `npm run build` passed with existing CSS import, `/history-bg.jpg`, chunk-size, and plugin timing warnings.
- `npm run test:e2e` passed: 2 Chromium smoke tests.
- `harness-cli story verify US-010` passed.
- Manual visible UI verification screenshots: `test-results/phase13-ui/01-admin-dashboard.png`, `02-admin-users-search.png`, `03-admin-users-suspended.png`, `04-admin-ai-dual-sign.png`, `05-admin-audit-logs.png`, `06-admin-maintenance-scheduled.png`, `07-admin-feature-flags.png`, `08-admin-dashboard-mobile.png`.
