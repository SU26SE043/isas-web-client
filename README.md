# ISAS Web Client

Frontend for **ISAS** — AI-powered interview simulation and assessment (Capstone SEP490, SU26SE043).

Two product lines, one engine:

- **B2C:** Personal interview practice from CV/JD.
- **B2B:** Employer campaigns, magic links, AI scoring, ranking.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Documentation map

| What | Where |
| --- | --- |
| **Product spec (full)** | [`BRD/`](./BRD/README.md) |
| **Frontend contracts** | [`docs/product/`](./docs/product/README.md) |
| **Story backlog** | [`docs/stories/backlog.md`](./docs/stories/backlog.md) |
| **Agent entrypoint** | [`AGENTS.md`](./AGENTS.md) |
| **Harness workflow** | [`docs/HARNESS.md`](./docs/HARNESS.md) |
| **UI rules** | [`docs/UI_GUIDE.md`](./docs/UI_GUIDE.md) |
| **Architecture** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |

## Harness CLI (Windows)

```powershell
.\scripts\bin\harness-cli.exe init
.\scripts\bin\harness-cli.exe query matrix
.\scripts\bin\harness-cli.exe query backlog
```

## Source hierarchy

```text
BRD/                 ← Business requirements (source of truth)
docs/product/        ← Living frontend contracts
docs/stories/        ← Work packets
src/                 ← Implementation
```

## Validation

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm test` | Unit tests |

## Tech stack

React 19 · TypeScript · Vite · Tailwind v4 · react-router-dom · axios · zustand
