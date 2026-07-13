# Candidate Profile (Phase 4)

BRD: FR-020–059, SCR-CAN-012–020, BRL-032 (70% gate).

## Routes

| Route | Screen | Status |
| --- | --- | --- |
| `/candidate/dashboard` | SCR-CAN-012 | Implemented (mock summary) |
| `/candidate/profile` | SCR-CAN-013 | Implemented — basic account info + uploaded CV list |
| `/candidate/profile/complete` | SCR-CAN-014 | Implemented — `ProfileWizard` (legacy; not linked from main profile) |
| `/candidate/profile/career-goal` | SCR-CAN-015 | Implemented (legacy section route) |
| `/candidate/profile/education` | SCR-CAN-016 | Implemented (legacy section route) |
| `/candidate/profile/experience` | SCR-CAN-017 | Implemented (legacy section route) |
| `/candidate/profile/skills` | SCR-CAN-018 | Implemented (legacy section route) |
| `/candidate/profile/certificates` | SCR-CAN-019 | Implemented (legacy section route) |
| `/candidate/profile/portfolio` | SCR-CAN-020 | Implemented (legacy section route) |
| `/candidate/profile/social` | F-PROF-008 | Implemented (legacy section route) |

## `/candidate/profile` contract (current)

The main profile screen is intentionally lightweight:

1. **Basic account info** from Auth API (`GET /api/v1/auth/me`) — full name, email, title, location, member since.
2. **Uploaded CV files** from CV service (`listUploadedCvs` mock today) — file name, size, upload time, link to match report.

Edit basic fields via `EditProfileModal` (Auth update profile). New uploads flow through `/candidate/cv/analysis` and appear in the profile list after analysis completes.

## Components

- `ProfileViewPage`, `CandidateProfileHeader`, `ProfileBasicInfoCard`, `ProfileUploadedCvSection`
- Legacy: `ProfileWizard`, section forms, `CvProfileMappingPanel`, completeness widgets

## Behavior

- Completeness / 70% gate still uses `profileService` mock for interview prepare until backend profile APIs land.
- CV uploads tracked in `cvAnalysisService.listUploadedCvs()` (mock `sessionStorage` + seed fixture).
- CV mapping panel on match report can still merge parsed data into legacy profile store.

## E2E

- `e2e/specs/b2c/cv-upload.spec.ts`

## Open gaps

- Wire `auth/me` and CV file list to real Gateway APIs.
- Deprecate or remove legacy profile section routes when product retires wizard CRUD.
