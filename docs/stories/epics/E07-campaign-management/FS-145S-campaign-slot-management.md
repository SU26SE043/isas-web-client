# FS-145S Campaign Slot Management

## Status

implemented

## Lane

normal

## Product Contract

Employer creates a Draft campaign, configures one or more interview slots with `startsAt`, `endsAt`, and `capacity`, reviews the schedule, then publishes and invites candidates. Slot CRUD uses the live Campaign Slot APIs; Backend remains authoritative for overlap, assignment, and running-candidate restrictions.

## Relevant Product Docs

- `docs/product/campaign-management.md`
- `docs/product/product-scope.md`
- `D:/Capstone/campaign-slot-api-spec.md`

## Acceptance Criteria

- Wizard contains a dedicated Interview slots step before Review and obtains a real campaign id before slot calls.
- Employer can list, create, edit, and delete slots through the four API endpoints without mock data.
- Slot forms validate time order, positive integer capacity, and capacity not lower than `assignedCount`.
- Slot list shows assigned/capacity, started count, total capacity, and loading/empty/error/mutation states.
- Campaign Detail shows the current schedule before Publish.
- Invitation flow warns when pending emails exceed `sum(capacity - assignedCount)` before the invitation request.
- Candidate routes, join flow, room, and anti-cheating behavior are unchanged.

## Design Notes

- API: `GET|POST /api/v1/campaign/{campaignId}/slots`; `PUT|DELETE /api/v1/campaign/{campaignId}/slots/{slotId}`.
- Domain rules: ISO UTC on the wire; local `datetime-local` in forms; no frontend overlap algorithm; no candidate-to-slot assignment UI.
- UI surfaces: existing Campaign wizard, Campaign Detail, and email invitation confirmation.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Slot parsing, validation, capacity calculations, error mapping |
| Integration | React Query invalidation and exact CRUD request bodies |
| E2E | Create/edit/delete slot, stats, conflict states, invitation warning |
| Platform | Desktop and 375px visual verification |
| Release | Typecheck, i18n, UI-size, production build |

## Harness Delta

None expected.

## Evidence

- Unit: `npx vitest run src/features/employer-campaigns/utils/campaignSlots.test.ts` — 5/5 passed.
- E2E: `npx playwright test e2e/specs/b2b/campaign-slots.spec.ts --workers=1` — 9/9 passed on Chromium, Firefox, and WebKit.
- Static gates: `npm run typecheck`, `npm run check:i18n`, and `npm run check:ui-size` passed.
- Release: `npm run build` passed.
- Visual: `test-results/campaign-slots-desktop.png`, `test-results/campaign-slots-mobile.png`, and `test-results/campaign-slots-wizard.png`.
