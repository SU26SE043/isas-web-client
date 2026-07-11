# Campaign Discovery (Candidate B2B Entry)

BRD: SCR-CAN-023-025, BP-006, BP-007, BRL-022, BRL-032, BRL-059, FR-095-124 candidate-facing discovery.

## User Flow

1. Candidate opens `/candidate/campaigns`.
2. Candidate searches and filters active public campaigns.
3. Candidate opens `/candidate/campaigns/:id` to review role, company, requirements, process, language, deadline, and capacity.
4. Candidate starts `/candidate/campaigns/:id/enroll`.
5. Enrollment checks the 70% profile completeness gate before submit.
6. Successful enrollment reserves the candidate and routes to interview preparation.
7. Magic links open `/invite/:token`, validate the invite, and continue into enrollment or the interview preparation path.

## Routes

| Path | Component | Notes |
| --- | --- | --- |
| `/candidate/campaigns` | `CampaignBrowsePage` | Search, mode, seniority filters |
| `/candidate/campaigns/:id` | `CampaignDetailPage` | Detail view with enroll CTA |
| `/candidate/campaigns/:id/enroll` | `CampaignEnrollmentPage` | Profile gate + consent form |
| `/invite/:token` | `MagicLinkLandingPage` | Public magic-link validation landing |

## UI Contract

- Structural UI stays dark monochrome per `docs/UI_GUIDE.md`.
- Status, capacity, and fit indicators may use semantic colors.
- List page includes loading skeleton, empty state, search, filters, and campaign cards.
- Detail page includes hero, facts, skills, requirements, responsibilities, benefits, process, and enrollment CTA.
- Enrollment page blocks submit when profile completeness is below 70%.
- All user-visible copy is bilingual through `campaignsTranslations`.

## API

CampaignService endpoints are not wired yet. Mock fixtures live under `src/features/campaigns/mocks/`.

## Status

Phase 8 UI implemented on mock data. Live CampaignService integration, payment-gated campaigns, and employer-side campaign creation remain future stories.
