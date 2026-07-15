# Architecture — ISAS Web Client

Frontend monolith for the ISAS platform. Backend is a separate repo (microservices + API Gateway).

## Product surfaces

| Surface | Stack | Status |
| --- | --- | --- |
| Browser SPA | React 19, Vite, TypeScript | Active |

Out of scope per BRD: native mobile, offline mode, CLI.

## Runtime stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + Tailwind v4 |
| Routing | react-router-dom |
| State | zustand (auth), react-query (server — preferred) |
| HTTP | axios → API Gateway |
| Build | Vite → static assets in Docker/Nginx |
| CI | GitHub Actions |

Record stack changes in `docs/decisions/`.

## Layering (frontend)

```text
features/          ← domain UI + hooks + services (vertical slices)
layouts/           ← shell layouts (header, sidebar, footer)
components/ui/     ← design-system primitives
shared/            ← api client, i18n, cross-feature utils
routes/            ← route guards
```

Dependency rule: `components/ui` and `shared` must not import from `features`. Features may import from `shared`, `components/ui`, `layouts`.

## Backend boundary

```text
Browser
  → API Gateway (/api/v1/<service>/...)
      → AuthService | InterviewService | CampaignService | PaymentService | AIService
```

- Client never calls `/internal/...` or provider webhooks.
- JWT validated offline with shared key (no runtime AuthService call).
- File references store keys/paths, not full URLs.
- JSON field names: **camelCase** (ISO 8601 UTC dates, GUID as `string`, decimal as `number`) — see [`product/api-gateway.md`](./product/api-gateway.md).

## Parse-first boundary (client)

Unknown API responses must be parsed at the service layer before entering components:

```text
HTTP response
  → service parser / zod schema
  → typed DTO
  → component props / hook state
```

## B2C vs B2B

Same interview engine UI; distinguished by `campaign_id`:

- `null` → B2C practice (prepaid **token** wallet — reserve on create, settle after report). See [`product/payment.md`](./product/payment.md).
- set → B2B campaign session (magic link only, proctoring, org ranking). See [`product/campaign-assessment.md`](./product/campaign-assessment.md).

Interview room components stay campaign-agnostic (BRD D1). B2B adds proctoring overlay, periodic face capture, violation pause per product contract.

**Product scope:** [`product/product-scope.md`](./product/product-scope.md) · **Module map:** [`product/module-scope.md`](./product/module-scope.md) · **Development plan:** [`FRONTEND_MASTER_PLAN.md`](./FRONTEND_MASTER_PLAN.md).

## Observability (client)

- Log API errors with action context in dev.
- User-facing errors: graceful copy, no raw stack traces.
- Future: request_id correlation when gateway exposes it.

## Folder creation rule

Do not add new top-level `src/` folders without a story packet. New features go under `src/features/<name>/`.
