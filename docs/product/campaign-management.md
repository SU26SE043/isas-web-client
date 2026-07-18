# Campaign Management

Frontend contract for employer campaign list + creation wizard (OrgAdmin / HrMember).

## Status

**List API live** — `GET /api/v1/campaign` powers `/employer/campaigns` (summary cards, search/status filters, loading / empty / 403 / retry).

**Detail API live** — `GET /api/v1/campaign/{id}`.

**Create wizard (UI)** — 8-step sidebar wizard at `/employer/campaigns/new` and `/employer/campaigns/:id/edit`. Local/mock AI upload helpers until create/publish APIs are wired. **Answer Requirement Configuration is not part of the flow.**

## Wizard steps (sidebar)

1. Campaign information (domain, target level, schedule)
2. Job description (upload + analysis editor)
3. Evaluation criteria (AI generate or upload template; weights = 100%; save required)
4. Question configuration (AI generate with count, or upload bank)
5. Candidate invitation (email list **or** CV ranking selection)
6. Magic link
7. Invitation email setup
8. Final review + publish

Removed entirely: Answer Requirement Configuration (EMP-CAM-07 legacy).

## Routes

| Route | Screen |
| --- | --- |
| `/employer/campaigns` | EMP-CAM-01 Campaign List |
| `/employer/campaigns/new` | EMP-CAM-02 Create wizard |
| `/employer/campaigns/:id/edit` | Continue draft wizard |
| `/employer/campaigns/:id` | Campaign detail |

## Data notes

- Wizard state is held in `useCampaignWizard` (survives step remounts; no refetch on back).
- Stepper statuses: Pending / Active / Completed / Error (red on step API/validation failure).
- Draft save / publish still use mock `campaignManagementService` until POST/PUT endpoints land.
- List/detail remain live GET.

## Validation

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`
