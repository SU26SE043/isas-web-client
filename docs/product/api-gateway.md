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

## Client implementation

- `src/shared/api/apiClient.ts` — axios instance, base URL, interceptors.
- `src/features/*/services/*` — per-domain endpoint modules.
- 401 handling: token refresh interceptor (see auth feature).

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Gateway origin (document in `.env.example` when added) |

## Error handling

Map gateway error envelopes to user-visible messages. Network failures → graceful retry/offline copy per BRD NFRs.
