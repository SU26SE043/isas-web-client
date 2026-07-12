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
- Invite modal accepts comma/newline-separated emails and records invitations.
- **Candidate list** on detail or pipeline: shows rows as soon as emails are processed (see invite resolution below).

## Invite email resolution

When HR adds emails (invite modal or candidate-selection upload), the client calls lookup (or mock equivalent) per [`product-scope.md`](./product-scope.md) BR-B2B-06–11:

| Result | UI behavior |
| --- | --- |
| Email is an existing **Candidate** | Row appears **immediately** in campaign candidate list with `candidate_id`, display name, status **`invited`** |
| Email unknown | Row with email only, status **`invite_pending`** |
| Email is HR / Organize / Admin | Inline error on that address; do not add to list |

After publish, magic-link email is sent. Existing candidates **sign in** via `/invite/:token`; new emails **register** first.

## Data Contract

Until backend contracts are wired, the client uses a mock `EmployerCampaignService`:

- `listCampaigns(filters)`
- `getCampaign(id)`
- `saveDraft(input, id?)`
- `publishCampaign(id)`
- `inviteCandidates(id, emails)` — resolves emails; links existing Candidate accounts immediately
- `resolveInviteEmails(id, emails)` — optional explicit lookup returning `{ linked, pending, rejected }` per email (wire with Auth/Campaign API)

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
