# Shared Engagement Contract

BRD: FR-225-254, SCR-CAN-047-051, SCR-EMP-066-068, SCR-SHR-095, UF-028-029, UF-113, UF-115, BRL-040, BRL-069, BR-002, NOTI-048.

## Scope

Phase 14 implements shared engagement surfaces:

- Candidate: `/candidate/notifications`, `/candidate/settings`, `/candidate/help`, `/candidate/support`
- Employer: `/employer/notifications`, `/employer/settings`, `/employer/help`, `/employer/support`, `/employer/team`
- Admin fallback shared routes: `/admin/notifications`, `/admin/settings`, `/admin/help`, `/admin/support`

The implementation is mock-first and API-ready for future notification, settings, support, and team endpoints.

## Key Behaviors

- Notification center shows unread count, empty state, mark-all-read, and a mock live trigger for NOTI-048-style delivery under 2 seconds.
- Settings form manages email, in-app, marketing opt-out, and quiet hours.
- Marketing opt-out copy is tied to BRL-040.
- Help center supports scoped articles and search.
- Support page creates tickets and lists existing support requests.
- Employer team page supports inviting HR/Organize members while surfacing BR-002 role restriction.

## Deferred

- Real websocket/push transport.
- Real notification template catalog and 137 notification type rollout.
- Signed webhook configuration UI beyond BRL-069 contract copy.
- Live support ticket API and email fallback draft persistence.
