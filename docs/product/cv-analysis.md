# CV Analysis (B2C)

BRD: FR-004–006, SCR-CAN-021–022.

## User flow

1. **Domain** → lưu `localStorage` key `cv-analysis:domain`; gửi API dưới dạng **tên** (`Frontend` · `Backend` · `Business Analyst`), không dùng `1|2|3`.
2. **Upload CV** PDF ≤10MB → `POST /api/v1/interview/files/upload?fileType=cv` → lưu `cvId` (`fileId`).
3. **Upload JD** (required) PDF → `...?fileType=jd` → lưu `jdId`.
4. **Analyze** → `POST /api/v1/interview/practice/cv-analysis` `{ cvId, jdId, jobCategory }`.
5. **Report** landing → `GET /api/v1/interview/practice/cv-analysis/{id}` — render đúng fields response.

## Base URL

`VITE_API_BASE_URL` = gateway **origin only** (no `/api` suffix).

| Action | Path |
| --- | --- |
| Upload | `/api/v1/interview/files/upload?fileType=cv\|jd` |
| Analyze | `/api/v1/interview/practice/cv-analysis` |
| Detail | `/api/v1/interview/practice/cv-analysis/{id}` |

Auth: `Authorization: Bearer {accessToken}` via `apiClient` (Candidate).

## Status

Live Interview API only. No runtime mock fixtures.
