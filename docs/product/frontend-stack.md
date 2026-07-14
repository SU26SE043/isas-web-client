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

**Visual system (project-wide):**

| Token / pattern | Rule |
| --- | --- |
| Bright black | Page base `#141416` (`--surface-base`) — not pure `#000` |
| Satin silver frames | Tables, cards, panels, inputs, dialogs use `frame-satin` / `--satin-*` |
| Shared templates | `SectionPanel` + `SelectionOption` |

Do not invent alternate chrome borders (glossy / colored glow) in feature folders.

## Validation

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (tsc + vite) |
| `npm test` | Unit tests (when present) |
