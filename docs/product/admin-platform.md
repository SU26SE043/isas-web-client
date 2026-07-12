# Admin Platform Contract

BRD: FR-255-289, SCR-ADM-069-088, UF-201-213, BRL-010, BRL-019, BRL-020, BRL-029, BRL-033, BRL-053, BRL-060, BRL-065.

## Scope

Phase 13 implements the Admin Platform UI under `/admin/*`, including dashboard, users, roles, permissions, approvals, candidates, campaigns, content, learning, AI config, notification templates, reports, audit logs, system config, feature flags, monitoring, health, backups, maintenance, and support tickets.

The current implementation is a mock-first frontend contract for the future Admin APIs.

## Roles

All routes are wrapped with `RequireAuth` and `RequireRole([admin])`. The UI surfaces MFA and single-session requirements from BRL-019 and BRL-033, but live MFA enforcement remains owned by auth.

## Key Behaviors

- User management supports search and suspend action.
- Role and permission screens show RBAC bundles and permission groups.
- Audit logs are immutable/read-only and show hash evidence.
- AI configuration shows BRL-020 bias guard and BRL-053 pending dual-sign state.
- System config shows dual-sign requirement for global changes.
- Feature flags show tenant isolation under BRL-060.
- Monitoring and health show heartbeat-oriented system status under BRL-065.
- Maintenance scheduler creates a mock maintenance window and surfaces BRL-029 copy.
- Resource queues cover approvals, candidates, campaign moderation, CMS, learning, notification templates, reports, backups, and support tickets.

## Deferred

- Live Admin API integration.
- Actual MFA re-auth modal for sensitive actions.
- Real impersonation session switching.
- Real report/export generation and backup restore workflows.
