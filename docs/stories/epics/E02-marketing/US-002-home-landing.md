# US-002 Home Landing Page

## Status

implemented

## Lane

normal

## Product Contract

Public marketing home at `/` with hero, features, and employer sections. Guest can navigate to CV analysis or auth.

## Relevant Product Docs

- `docs/product/overview.md`

## BRD References

- `BRD/Screen_Inventory.md` — SCR-AUT-001 (welcome context)
- `BRD/Project_Overview.md`

## Acceptance Criteria

- `/` renders HeroSection, FeaturesSection, EmployerSection.
- Primary CTA navigates to `/cv-analysis`.
- Responsive layout; dark monochrome per `docs/UI_GUIDE.md`.
- i18n vi/en via LanguageProvider.

## Validation

| Layer | Expected proof |
| --- | --- |
| Platform | `npm run dev` — home loads without console errors |

## Evidence

- `src/features/home/pages/HomePage.tsx`
- `src/features/home/components/*`
