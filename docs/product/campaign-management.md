# Campaign Management

Frontend contract for employer campaign list + creation wizard (OrgAdmin / HrMember).

## Status

**List API live** — `GET /api/v1/campaign` powers `/employer/campaigns` (summary cards, search/status filters, loading / empty / 403 / retry).

**Detail API live** — `GET /api/v1/campaign/{id}`.

**Create wizard (UI)** — 10-step sidebar wizard at `/employer/campaigns/new` and `/employer/campaigns/:id/edit`. Local/mock AI upload helpers until create/publish APIs are wired. **Answer Requirement Configuration is not part of the flow.**

## Wizard steps (sidebar)

1. Campaign information (title, Frontend/Backend/Business Analyst domain, Fresher–Senior level, schedule, time limit, anti-cheat)
2. Job description (upload **or** paste + analysis editor)
3. Evaluation criteria (AI or upload; UI weights in %; submit as decimals summing to 1.0)
4. Question configuration (AI generate with count, or upload bank; sources `AiGenerated` / `CustomHr`)
5. Candidate invitation method (email list **or** CV ranking)
6. Candidate selection / CV ranking (skipped when method is email list)
7. Magic link
8. Invitation email setup
9. Final review
10. Publish campaign (confirm + progress)

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
- Shell: top header (draft badge, autosave, save, close) + left stepper (Pending / Active / Completed / Error) + bottom action bar.
- Draft save / publish still use mock `campaignManagementService` until POST/PUT endpoints land.
- List/detail remain live GET.
- Create body maps toward `POST /api/v1/campaign` (`title`, `domain`, `maxCandidates`, `timeLimitMinutes`, `antiCheatEnabled`, `jdText`, `criteria[]` decimal weights, `questions[]`, `startsAt` / `expiresAt`). `passScorePct` and `criteriaText` stay null.

## Validation

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`
