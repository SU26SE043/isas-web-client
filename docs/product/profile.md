# Candidate Profile (Phase 4)

BRD: FR-020–059, SCR-CAN-012–020, BRL-032 (70% gate).

## Routes

| Route | Screen | Status |
| --- | --- | --- |
| `/candidate/dashboard` | SCR-CAN-012 | Implemented (mock summary) |
| `/candidate/profile` | SCR-CAN-013 | Implemented — basic account info + CV/JD file management |
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
2. **Uploaded CV/JD files** from Interview API (`GET /api/v1/interview/files/files`) — grid cards with download, replace (`PUT /files/{id}`, field `newFile`), and delete (`DELETE /files/{id}`).

Edit basic fields via `EditProfileModal` → `PUT /api/v1/auth/me` then `GET /api/v1/auth/me` (Auth update profile; ignore PUT body string). New uploads flow through `/candidate/cv/analysis` (or Practice wizard) and appear in the profile file grid. Match reports are opened from the CV Analysis module, not from Profile.

## Components

- `ProfileViewPage`, `CandidateProfileHeader`, `ProfileBasicInfoCard`, `ProfileUploadedFilesSection`, `ProfileFileCard`
- Legacy: `ProfileWizard`, section forms, `CvProfileMappingPanel`, completeness widgets

## Behavior

- Completeness / 70% gate still uses `profileService` mock for interview prepare until backend profile APIs land.
- CV/JD file list uses `cvAnalysisService.listFiles()` (live Interview API).
- CV mapping panel on match report can still merge parsed data into legacy profile store.

## E2E

- `e2e/specs/b2c/cv-upload.spec.ts`

## Open gaps

- Deprecate or remove legacy profile section routes when product retires wizard CRUD.
