# UI Guide

This frontend uses a shared UI baseline so generated code remains consistent.

## Tech Stack

- Framework: React + Vite + TypeScript
- Styling: Tailwind CSS v4
- Base primitives: `@base-ui/react`
- Class variants: `class-variance-authority`
- Utility merge: `clsx` + `tailwind-merge` via `cn()`

## Component Locations

- UI primitives: `src/components/ui`
- Shared utility helpers: `src/lib`

## Generation Rules

- Prefer reusing existing primitives from `src/components/ui`.
- Import `cn()` from `src/lib/utils` for class composition.
- Keep business screens compositional: feature-level containers + reusable UI atoms.
- Do not introduce a second styling system (no CSS-in-JS or extra UI kit by default).
- Keep forms on `react-hook-form` with schema validation via `zod`.
- Keep async server state on `@tanstack/react-query`.

## Vercel Commands

- Local preview with Vercel runtime: `npm run vercel:dev`
- Production deploy: `npm run vercel:deploy`
