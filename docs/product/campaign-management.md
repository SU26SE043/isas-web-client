# Campaign Management

Frontend contract for employer campaign list, create/publish (Flow 1), and invite (Flow 2).

## Status

**List / detail GET live** — `GET /api/v1/campaign`, `GET /api/v1/campaign/{id}`.

**Create Draft live** — `POST /api/v1/campaign` once after the wizard finishes (Employer Bearer). Body includes metadata, JD text (or null for file-later), criteria, schedule, and non-empty questions.

**Update Draft live** — `PUT /api/v1/campaign/{id}` (metadata/JD/criteria) + `PUT /api/v1/campaign/{id}/questions` (JSON array body).

**Publish live** — From Draft detail preview: **Xuất bản** → confirm modal → `POST /api/v1/campaign/{id}/publish`.

**Status after Active** — From detail: **Đóng** (Active→Closed) / **Lưu trữ** (Closed→Archived) → confirm → `PUT /api/v1/campaign/{id}/status` with `{ status }`.

**Soft-delete** — From Draft / Closed / Archived detail: **Xóa** → confirm → `DELETE /api/v1/campaign/{id}` (204).

**Invite by email live** — Active detail → invite/email → `POST /api/v1/campaign/{id}/invitations` with `{ emails }`. Response `{ created, failed }` shown on result page. Errors: 400 · 404 · 409 (not Active).

**JD PDF live** — Create mode keeps the JD file local (browser-only) until the final `POST /api/v1/campaign` succeeds, then a single `POST /api/v1/campaign/{id}/files`. Edit mode uploads immediately via `POST` (first upload) or `PUT …/files` (replace). Field `jdFile` (PDF ≤10MB). Criteria no longer supports file upload — replaced by a manual rubric (step 3) plus a freeform `criteriaText` note (step 2).

**CV invite** — still mock-shaped for upcoming live wiring (candidates upload, invite by candidateIds).

## Flow 1 — Create & publish

Wizard at `/employer/campaigns/new` (and draft edit): **6 steps**

1. Campaign information — title, domain, maxCandidates, timeLimitMinutes, passScorePct (optional, HR decides when empty), startsAt, expiresAt
2. Job description — file (local-only until create) **or** text for `jdText`, plus a `criteriaText` note
3. Evaluation criteria — manual rubric only (name, description, weight %, maxScore); weights shown as % summing to 100, converted to 0–1 decimals on submit
4. Questions — AI-generated or HR-authored, each with `prompt`, `source` (`AiGenerated`/`CustomHr`), `isRequired`; add/edit/delete/reorder, tracked against `maxQuestions` when adaptive is on
5. Settings — `antiCheatEnabled`, `faceVerifyEnabled`, `adaptiveEnabled`; when adaptive is on, `maxFollowUps` (>=0) and `maxQuestions` (0–20)
6. Review — read-only summary of every step with per-section "Edit" jump links, then **Create/Save** performs the final submit

Draft preview actions: **Chỉnh sửa** · **Xuất bản** (confirm → publish) · **Xóa** (confirm → soft-delete).

Active detail: **Mời ứng viên** · **Pipeline** · **Đóng** (confirm → status Closed).

Closed detail: **Pipeline** · **Lưu trữ** (confirm → status Archived) · **Xóa**.

Archived detail: **Pipeline** · **Xóa**.

There is **no** “Save draft” button mid-wizard, and no API call at all while navigating between steps — every field lives in local wizard state until the Review step's final submit. Create calls `POST /api/v1/campaign` exactly once (Review step only); if a JD file is pending it uploads right after via `POST …/files`. Edit mode sends only dirty/changed metadata fields via `PUT /api/v1/campaign/{id}` (see `buildDirtyUpdateRequest`), plus the full question list via `PUT …/questions`; criteria/questions edits only apply while the campaign is Draft. Publish is only from Campaign Detail.

Candidate invitation is **not** part of Flow 1.

## Flow 2 — Invite candidates (Active only)

| Route | Screen |
| --- | --- |
| `/employer/campaigns/:id/invite` | Choose method |
| `/employer/campaigns/:id/invite/cv` | Upload CVs + ranking + invite by candidateIds |
| `/employer/campaigns/:id/invite/email` | Enter emails → invite |
| `/employer/campaigns/:id/invite/result` | Partial success result |

Campaign Detail shows **Mời ứng viên** only when `status === active`. Draft shows helper copy to publish first, plus **Edit** and **Publish**.

## Routes

| Route | Screen |
| --- | --- |
| `/employer/campaigns` | List |
| `/employer/campaigns/new` | Flow 1 wizard (create) |
| `/employer/campaigns/:id/edit` | Edit Draft wizard |
| `/employer/campaigns/:id` | Detail |
| `/employer/campaigns/:id/invite/*` | Flow 2 |

Legacy `/selection` redirects to `/invite`.

## API call matrix

| Case | API |
| --- | --- |
| Next/back through any step (create or edit) | None |
| Finish wizard on Review (create) | `POST /api/v1/campaign`, then `POST …/files` once if a JD file is pending |
| Save on Review (edit) | `PUT /api/v1/campaign/{id}` (dirty fields only) then `PUT …/questions` |
| Publish | `POST /api/v1/campaign/{id}/publish` |
| Close / Archive | `PUT /api/v1/campaign/{id}/status` `{ status: "Closed" \| "Archived" }` |
| Soft-delete | `DELETE /api/v1/campaign/{id}` |
| Invite by email | `POST /api/v1/campaign/{id}/invitations` `{ emails: string[] }` |
| Upload JD PDF (edit mode, on file select) | `POST /api/v1/campaign/{id}/files` (multipart) |
| Replace JD PDF (edit mode) | `PUT /api/v1/campaign/{id}/files` (multipart, Draft only) |

## Validation

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`
