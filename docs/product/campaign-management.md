# Campaign Management

Frontend contract for Phase 10: HR campaign lifecycle.

Status: implemented with mock data/service.

## Scope

Phase 10 covers employer-side campaign management:

- `/employer/campaigns` campaign list with status filter and search.
- `/employer/campaigns/new` campaign wizard.
- `/employer/campaigns/:id` campaign detail with publish and invite actions.
- `/employer/campaigns/:id/edit` draft campaign editing.

Out of scope: candidate ranking/pipeline, employer analytics, billing, admin moderation, and live backend integration.

## BRD Trace

- Screens: `SCR-EMP-055`, `SCR-EMP-056`, `SCR-EMP-057`, `SCR-EMP-058`.
- User flows: `UF-103`, `UF-104`, `UF-105`, `UF-106`, `UF-111`.
- Functional requirements: `FR-095` to `FR-124`, `FR-125` to `FR-159`.
- Rules: `BRL-012` publish readiness, `BRL-031` max 5 active campaigns, `BRL-036` rubric weights sum to 100%.

## UI Contract

Campaign list provides:

- Search by title/company/role text.
- Status filtering for draft, active, paused, closed.
- Empty/loading states.
- Create campaign CTA.

Campaign wizard provides four steps:

1. Job description: title, company, location, working mode, summary, JD content.
2. Rubric: weighted criteria must total 100%.
3. Questions: selected question bank items.
4. Settings: capacity, deadline, duration, locale, welcome/completion messages.

Campaign detail provides:

- Campaign metadata, rubric summary, questions, settings.
- Publish validation errors inline.
- Publish action transitions draft to active.
- Invite modal accepts comma/newline-separated emails and records mock invitations.

## Data Contract

Until backend contracts are wired, the client uses a mock `EmployerCampaignService`:

- `listCampaigns(filters)`
- `getCampaign(id)`
- `saveDraft(input, id?)`
- `publishCampaign(id)`
- `inviteCandidates(id, emails)`

The mock is tenant-scoped in memory and uses the existing `enterprise` mock domain.

## Validation

Required gates:

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Visible UI verification must include desktop and mobile screenshots plus a manual flow: create draft, edit/detail, publish, invite candidates.
