# US-007 Campaign Management Employer Workflow

## Status

implemented

## Lane

normal

## Product Contract

HR users can manage B2B assessment campaigns from draft creation through publish and candidate invitation.

## Relevant Product Docs

- `docs/product/campaign-management.md`
- `docs/product/api-gateway.md`

## BRD References

- SCR-EMP-055, SCR-EMP-056, SCR-EMP-057, SCR-EMP-058
- UF-103, UF-104, UF-105, UF-106, UF-111
- FR-095-124, FR-125-159
- BRL-012, BRL-031, BRL-036

## Acceptance Criteria

- `/employer/campaigns` renders campaign table/cards with search, status filter, loading, and empty states.
- `/employer/campaigns/new` renders a multi-step campaign wizard.
- Rubric weights must sum to 100% before saving/publishing.
- `/employer/campaigns/:id` renders campaign detail and publish/invite actions.
- Publish validates readiness, org verification, and max active campaign limit before setting active status.
- Invite modal resolves emails: registered candidates appear as `invited`, unknown as `invite_pending`, HR/Organize/Admin emails rejected inline.
- Campaign detail shows candidate table and proctoring settings summary.
- Wizard step Settings includes proctoring config (face interval, similarity threshold, max violations).
- `/employer/campaigns/:id/edit` allows editing draft campaigns.
- All visible text is bilingual through `useLanguage().t()`.

## Design Notes

- Use `EmployerDashboardLayout` with Phase 10 campaign navigation only.
- Keep UI dark monochrome, semantic colors only for status and validation.
- Use `react-hook-form` and `zod`.
- API is mock-only for Phase 10; live CampaignService integration is deferred.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `npm test` |
| Integration | Pending live CampaignService contract; mock service covered by manual flow |
| E2E | `npm run test:e2e`; manual Phase 10 browser flow |
| Platform | `npm run check:ui-size`, `npm run check:i18n`, `npm run typecheck`, `npm run build` |
| Release | Not in this story |

## Evidence

- `npm run check:ui-size` passed.
- `npm run check:i18n` passed.
- `npm run typecheck` passed.
- `npm test` passed: 3 files, 12 tests.
- `npm run build` passed with pre-existing CSS import, `/history-bg.jpg`, chunk-size, and plugin timing warnings.
- `npm run test:e2e` passed: 2 Chromium smoke tests.
- Manual visible UI verification screenshots: `test-results/phase10-ui/01-campaign-list.png`, `02-campaign-wizard-jd.png`, `03-campaign-wizard-rubric.png`, `04-campaign-wizard-questions.png`, `05-campaign-detail-draft.png`, `07-campaign-published.png`, `10-final-detail-i18n.png`, `11-final-invite-dialog.png`, `12-final-list-mobile.png`.
