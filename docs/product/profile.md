# Candidate Profile (Phase 4)

BRD: FR-020–059, SCR-CAN-012–020, BRL-032 (70% gate).

## Routes

| Route | Screen | Status |
| --- | --- | --- |
| `/candidate/dashboard` | SCR-CAN-012 | Implemented (mock summary) |
| `/candidate/profile` | SCR-CAN-013 | Implemented |
| `/candidate/profile/complete` | SCR-CAN-014 | Implemented — `ProfileWizard` |
| `/candidate/profile/career-goal` | SCR-CAN-015 | Implemented |
| `/candidate/profile/education` | SCR-CAN-016 | Implemented |
| `/candidate/profile/experience` | SCR-CAN-017 | Implemented |
| `/candidate/profile/skills` | SCR-CAN-018 | Implemented |
| `/candidate/profile/certificates` | SCR-CAN-019 | Implemented |
| `/candidate/profile/portfolio` | SCR-CAN-020 | Implemented |
| `/candidate/profile/social` | F-PROF-008 | Implemented |

## Components

- `ProfileWizard`, `ProfileSectionLayout`, `ProfileSectionNav`, `ProfileCompletenessBar`
- `EducationForm`, `ExperienceForm`, `SkillsTagInput`, `CertificateCard`, `PortfolioGallery`
- `CareerGoalForm`, `CvProfileMappingPanel`

## Behavior

- Completeness calculated in `calculateProfileCompleteness()` — 70% gate for interviews (`PROFILE_COMPLETENESS_GATE`).
- Section nav shows completion badges from `completeness.sections`.
- Profile CRUD uses mock store (`profileService`) until Gateway profile APIs are wired.
- CV mapping merges into existing profile (append, no duplicate IDs/names).

## E2E

- `e2e/specs/b2c/cv-upload.spec.ts`

## Open gaps

- Real profile entity APIs (education, experience, etc.) via Gateway.
- React Query migration for profile entities.
- `react-hook-form` + `zod` on section forms.
