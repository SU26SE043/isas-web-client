# US-013 Shared Engagement

## Status

implemented

## Lane

normal

## Product Contract

Candidates, employers, and admins can access shared notifications, notification settings, help, support tickets, and employer team management surfaces.

## Relevant Product Docs

- `docs/product/shared-engagement.md`
- `docs/product/api-gateway.md`
- `docs/UI_GUIDE.md`

## BRD References

- SCR-CAN-047, SCR-CAN-049, SCR-CAN-050, SCR-CAN-051
- SCR-EMP-066, SCR-EMP-067, SCR-EMP-068
- SCR-SHR-095
- UF-028, UF-029, UF-113, UF-115
- FR-225-254
- BRL-040, BRL-069, BR-002
- NOTI-048

## Acceptance Criteria

- Candidate notification/settings/help/support routes render in `DashboardLayout`.
- Employer notification/settings/help/support/team routes render in `EmployerDashboardLayout`.
- Admin shared routes are guarded and render notification/settings/help/support surfaces.
- Notification center shows unread count, empty state, mark-all-read, and a mock live trigger under the Phase 14 realtime target.
- Settings form saves channel preferences, quiet hours, and marketing opt-out state.
- Help center filters scoped articles.
- Support form creates a ticket and updates the local ticket list.
- Employer team page can invite members and surfaces BR-002 role restriction.
- Employer team uses live Auth APIs to list members, invite an `HrMember` with
  email/full name, change `OrgAdmin`/`HrMember` roles, and remove organization
  membership without deleting the user account.
- Member removal requires confirmation and leaves the list unchanged when the
  backend rejects self-removal or removal of the final `OrgAdmin`.
- Only `OrgAdmin` can access team management; platform `Admin` is not treated as
  having implicit organization context.
- All visible UI text is bilingual through `useLanguage().t()`.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `npm test` |
| Integration | Live Auth organization-member service tests; Notification/Settings/Support APIs remain pending |
| E2E | `npm run test:e2e`; manual Phase 14 browser flow |
| Platform | `npm run check:ui-size`, `npm run check:i18n`, `npm run typecheck`, `npm run build` |
| Release | Not in this story |

## Evidence

- `npm run check:ui-size` passed.
- `npm run check:i18n` passed.
- `npm run typecheck` passed.
- `npm test` passed: 3 files, 12 tests.
- `npm run build` passed with existing CSS import, `/history-bg.jpg`, chunk-size, and plugin timing warnings.
- `npm run test:e2e` passed: 2 Chromium smoke tests.
- `harness-cli story verify US-011` passed.
- Manual visible UI verification screenshots: `test-results/phase14-ui/01-candidate-notifications.png`, `02-candidate-notification-live.png`, `03-candidate-settings-saved.png`, `04-candidate-support-created.png`, `05-employer-team-invite.png`, `06-employer-notifications.png`, `07-candidate-help-mobile.png`.
- Live organization-member proof: service tests 6/6; Chromium E2E 2/2
  (list/invite/role update/remove, `204` removal, final-OrgAdmin conflicts,
  platform Admin denial);
  i18n, typecheck, and production build pass; responsive screenshots at
  `test-results/auth-org-members/team-{desktop,mobile}.png`.
