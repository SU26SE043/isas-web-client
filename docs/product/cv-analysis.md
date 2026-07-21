# CV Analysis (B2C)

BRD: FR-004–006, SCR-CAN-021–022.

## User flow

1. **Domain** → lưu `localStorage` key `cv-analysis:domain`; gửi API dưới dạng **enum** (`FE` · `BE` · `BA`), không dùng `1|2|3` hay tên đầy đủ.
2. **Upload CV** (step 2) — tab **CV đã tải lên** (`GET /api/v1/interview/files/files`, filter `cv`) hoặc **Tải CV mới** PDF ≤10MB → `POST ...?fileType=cv` → lưu `cvId`.
3. **Upload JD** (step 3) — tab **JD đã tải lên** hoặc **Tải JD mới** PDF → `...?fileType=jd` → lưu `jdId`.
4. **Analyze** → `POST /api/v1/interview/practice/cv-analysis` `{ cvId, jdId, jobCategory }`.
5. **Report** landing → `GET /api/v1/interview/practice/cv-analysis/{id}` — render đúng fields response.

## Base URL

`VITE_API_BASE_URL` = gateway **origin only** (no `/api` suffix).

| Action | Path |
| --- | --- |
| Upload | `/api/v1/interview/files/upload?fileType=cv\|jd` |
| List files | `/api/v1/interview/files/files` |
| Analyze | `/api/v1/interview/practice/cv-analysis` |
| Detail | `/api/v1/interview/practice/cv-analysis/{id}` |

Auth: `Authorization: Bearer {accessToken}` via `apiClient` (Candidate).

## Status

Live Interview API only. No runtime mock fixtures.
