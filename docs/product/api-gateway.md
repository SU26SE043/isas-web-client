# API Gateway Conventions

BRD: `BRD/Integration_Requirements.md`, `BRD/Project_Overview.md` §4.

## Routing rule

Client calls **only** the public gateway prefix:

```text
/api/v1/<service>/...
```

Examples:

| Service | Example path |
| --- | --- |
| auth | `/api/v1/auth/...` |
| interview | `/api/v1/interview/...` |
| campaign | `/api/v1/campaign/...` |
| payment | `/api/v1/payment/...` |

Callbacks `/internal/...` and PayOS webhooks are **not** called from this client.

## JSON / payload conventions

Authoritative for request and response bodies on the public gateway (ASP.NET default):

| Rule | Detail | Examples |
| --- | --- | --- |
| Field names | **camelCase** | `accessToken`, `jobCategory`, `maxCandidates` |
| Date/time | ISO 8601 UTC strings | `2026-07-15T08:30:00Z` |
| GUID | JSON strings | `"a1b2c3d4-..."` |
| decimal | JSON numbers | `12.5` |

Client TypeScript DTOs and parsers should treat camelCase as primary. Auth helpers may keep PascalCase key fallbacks for resilience only (`src/shared/api/authPayload.ts`, auth feature parsers) — that does **not** change the contract.

Role **values** (e.g. `Candidate`, `OrgAdmin`) stay PascalCase strings; see [`auth-profile.md`](./auth-profile.md). That is unrelated to JSON field naming.

## Client implementation

- `src/shared/api/apiClient.ts` — axios instance, base URL, interceptors.
- `src/features/*/services/*` — per-domain endpoint modules.
- 401 handling: token refresh interceptor (see auth feature).
- Payload shape: see **JSON / payload conventions** above.

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Gateway origin (document in `.env.example` when added) |
| `VITE_PHOTON_API_URL` | Optional Photon geocoding instance/proxy for campaign location autocomplete; not an API Gateway route |

## Error handling

Map gateway error envelopes to user-visible messages. Network failures → graceful retry/offline copy per BRD NFRs.
