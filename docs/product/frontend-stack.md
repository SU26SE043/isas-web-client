# Frontend Stack & Conventions

Living contract for how the ISAS web client is built.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build | Vite |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS v4 + design tokens (`src/styles/colors.css`) |
| UI primitives | shadcn-style in `src/components/ui/` + shared templates `SectionPanel`, `SelectionOption` |
| Forms | react-hook-form + zod (preferred) |
| Server state | @tanstack/react-query (preferred) |
| Client state | zustand (`authStore`) |
| HTTP | axios (`src/shared/api/apiClient.ts`) |
| i18n | Custom `LanguageProvider` (vi/en) |

## Folder layout

```text
src/
  components/ui/     # Reusable primitives + SectionPanel / SelectionOption
  features/          # Domain slices (auth, home, cv-analysis, practice, …)
  layouts/           # MainLayout, DashboardLayout, Header, Footer
  routes/            # ProtectedRoute, PublicRoute
  shared/            # api, languages, cross-cutting utils
  lib/utils.ts       # cn() helper
  styles/colors.css  # Design tokens
```

Feature folders follow: `components/`, `pages/`, `services/`, `types/`, `hooks/` as needed.

## API access

All public API calls go through Gateway:

```text
/api/v1/<service>/...
```

Configure base URL via environment. Auth uses JWT stored client-side; gateway validates offline with shared key (see backend `AGENTS.md`).

## UI rules

Read `docs/UI_GUIDE.md` before any UI work — dark monochrome only, semantic colors for status.

**Shared templates (project-wide):**

| Component | Path | Use |
| --- | --- | --- |
| `SectionPanel` | `src/components/ui/section-panel.tsx` | Wizard/setup section shell |
| `SelectionOption` | `src/components/ui/selection-option.tsx` | Selectable option tiles in grids |

Do not invent alternate glass option cards in feature folders; wrap or re-export these.

## Validation

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (tsc + vite) |
| `npm test` | Unit tests (when present) |
