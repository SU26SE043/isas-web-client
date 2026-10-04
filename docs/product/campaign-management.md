# Campaign Management

Frontend contract for employer campaign list, create/publish (Flow 1), and invite (Flow 2).

## Status

**List / detail GET live** — `GET /api/v1/campaign`, `GET /api/v1/campaign/{id}`.

**Create Draft live** — `POST /api/v1/campaign` once after the wizard finishes (Employer Bearer). Body includes metadata, JD text (or null for file-later), criteria, schedule, and non-empty questions.

**Update Draft live** — `PUT /api/v1/campaign/{id}` (metadata/JD/criteria) + `PUT /api/v1/campaign/{id}/questions` (JSON array body).

**Publish live** — From Draft detail preview: **Xuất bản** → confirm modal → `POST /api/v1/campaign/{id}/publish`.

**Status after Active** — From detail: **Kết thúc chiến dịch** (Active→Closed) / **Lưu trữ** (Closed→Archived) → confirm → `PUT /api/v1/campaign/{id}/status` with `{ status }`. Ending is irreversible: the action sits beside the Active status badge, requires the user to enter `KẾT THÚC` (or the localized equivalent), and only then sends `{ "status": "Closed" }`. Closed campaigns retain results/candidate data but cannot receive new candidates, new invitations, or invitation reissues.

**Soft-delete** — From Draft / Closed / Archived detail: **Xóa** → confirm → `DELETE /api/v1/campaign/{id}` (204).

**Invite by email live** — Active detail → invite/email → `POST /api/v1/campaign/{id}/invitations` with `{ emails }`. Response `{ created, failed }` shown on result page. Errors: 400 · 404 · 409 (not Active).

**JD PDF live** — Create mode keeps the JD file local (browser-only) until the final `POST /api/v1/campaign` succeeds, then a single `POST /api/v1/campaign/{id}/files`. Edit mode uploads immediately via `POST` (first upload) or `PUT …/files` (replace). Field `jdFile` (PDF ≤10MB). Criteria no longer supports file upload — replaced by a manual rubric (step 3) plus a freeform `criteriaText` note (step 2).

**Attachments on Employer Campaign Detail** — The detail view shows files successfully uploaded through this frontend, including document type, original filename, size, and a download action backed by `POST /api/v1/campaign/{id}/files/download?fileType=jd|criteria`. API v10 `CampaignResponse` does not expose attachment metadata or a file-list endpoint, so the frontend retains filename/size metadata in browser storage after a successful upload. Files uploaded from another browser/device cannot be listed authoritatively until the backend adds attachment metadata; the UI does not probe by downloading PDFs on page load.

**Interview slots live** — Campaign availability (`campaign.startsAt` → `campaign.expiresAt`) is separate from interview slots. After the Draft has a real id, Employer manages slots with `GET/POST /api/v1/campaign/{id}/slots` and `PUT/DELETE /api/v1/campaign/{id}/slots/{slotId}`. Each slot has `startsAt`, `endsAt`, `capacity`, `assignedCount`, and `startedCount`. The frontend validates basic time/capacity rules but does not reimplement overlap or candidate assignment; Backend remains authoritative. Invitation capacity is informationally checked with `sum(capacity - assignedCount)`.

**CV invite** — still mock-shaped for upcoming live wiring (candidates upload, invite by candidateIds).

**Attempt rules (ATT1-F1, ATT1-F2) — implemented, backend-dependent** — Sitting length (`timeLimitMinutes`) and maximum attempts (`maxAttempts`) are configured in wizard step 5 and shown/increased on Campaign Detail. See [Attempt rules (ATT1)](#attempt-rules-att1). Until Backend ATT1 is deployed, responses without `maxAttempts` render as 1 (the contract default).

## Flow 1 — Create & publish

Wizard at `/employer/campaigns/new` (and draft edit): **6 steps**

1. Campaign information — title, domain, maxCandidates, passScorePct (optional, HR decides when empty), startsAt, expiresAt. (`timeLimitMinutes` is not collected in this step: before ATT1 its input sat in the invite step’s email tab; since ATT1-F1 its only input is step 5 “Luật làm bài”.) Existing campaign responses may still expose `location` for list/detail display, but the create/edit wizard does not collect or persist it.
2. Job description — file (local-only until create) **or** text for `jdText`, plus a `criteriaText` note
3. Evaluation criteria — HR may write criteria or preview the system default set by domain/language; criteria preserve `id`, `levels`, and optional `minPct` floor (0–100). Weights are shown as % and converted to 0–1 decimals on submit.
4. Questions — AI-generated or HR-authored, each with `prompt`, `source`, `questionGroup`, `isRequired` (“Luôn hỏi”); the question bank shows K questions per candidate and group counts.
5. Settings — first block **“Luật làm bài”** (ATT1-F1): `timeLimitMinutes` (5–180) and `maxAttempts` (1 / 2 / 3, default 1); then `antiCheatEnabled`, `faceVerifyEnabled`, `adaptiveEnabled`; adaptive depth presets map to `maxDeepPerQuestion` and `maxFollowUps`. `maxQuestions` is read-only and derived as `min(20, max(0, K×(1+d)))`, where `K = questionsPerSession` when positive, otherwise the authored question-bank count. There is no manual max-question input in the wizard.
6. Review — read-only summary of every step with per-section "Edit" jump links, then **Create/Save** performs the final submit

In step 4 draw mode, `questionsPerSession` (K) is the **total** base questions each candidate receives, including every required question. The “Bốc” input shows and accepts only the number drawn from the optional pool; its value is converted to K by adding the required count. Switching a question between required and pool keeps K unchanged and updates the displayed draw. K is limited to 1–20; `null` means the full bank. The pool heading displays the computed draw and actual pool size. This correction applies to the Draft wizard only and does not change the API or Active campaigns.

Draft preview actions: **Chỉnh sửa** · **Xuất bản** (confirm → publish) · **Xóa** (confirm → soft-delete).

Active detail: **Mời ứng viên** · **Pipeline** · **Kết thúc chiến dịch** beside the status badge (two-step confirmation → status Closed).

Closed detail: status badge **Đã kết thúc** + stopped-accepting notice · **Pipeline** · **Lưu trữ** (confirm → status Archived) · **Xóa**.

Archived detail: **Pipeline** · **Xóa**.

There is **no** “Save draft” button mid-wizard, and no API call at all while navigating between steps — every field lives in local wizard state until the Review step's final submit. Create calls `POST /api/v1/campaign` exactly once (Review step only); if a JD file is pending it uploads right after via `POST …/files`. Edit mode sends only dirty/changed metadata fields via `PUT /api/v1/campaign/{id}` (see `buildDirtyUpdateRequest`), plus the full question list via `PUT …/questions`; criteria/questions edits only apply while the campaign is Draft. Publish is only from Campaign Detail.

Candidate invitation is **not** part of Flow 1.

## Attempt rules (ATT1)

ATT1 makes two campaign values server-enforced rules (contract hash `7e4792f993948da2`, codes `[C1]`–`[C5]`; the full contract stays in the ATT1 spec, not here). Story packet: [`ATT1-frontend`](../stories/epics/ATT1-attempts-server-clock/ATT1-frontend/overview.md).

- **Sitting length** `timeLimitMinutes` — the whole-sitting clock the server runs from the moment the candidate enters the interview room (see [`practice-interview.md`](./practice-interview.md#b2b-campaign-sitting-clock-att1)). Before ATT1 the value was only printed in the invitation email.
- **Maximum attempts** `maxAttempts` — how many times one candidate may start a new sitting for the campaign (1–3, default 1). Resuming an unfinished sitting does not count. Each retake costs the organization 1 more credit and draws a different base question set.

### Wizard step 5 — “Luật làm bài” (ATT1-F1)

- The block sits at the top of step 5 (“Bảo mật & phỏng vấn thích ứng”), above anti-cheat and adaptive settings. It is the **only** input for `timeLimitMinutes`; the field was removed from the invite step’s email tab so there is one source of truth.
- Sitting length: whole number in **[5, 180]** minutes (new campaigns default to 60). Out of range → step-5 error `employer.campaigns.wizard.timeLimitInvalid`. Server `400` messages that mention `timeLimit` / `maxAttempts` also route back to step 5.
- Maximum attempts: choose **1 / 2 / 3** (default 1); helper text says each retake costs 1 organization credit, draws different base questions, and can only be **increased** after deployment.
- Estimate line: `ceil(K × (1 + d) × 2)` minutes, where `K = questionsPerSession ?? number of authored questions` and `d = maxDeepPerQuestion` when adaptive is on, else 0 (2 min = default 120 s answer time). When the sitting length is below the estimate the line turns warning-coloured — it **never blocks** saving.
- Read-only question budget: the wizard shows `max(0, min(20, K × (1+d)))` and its formula; an empty bank shows “Chưa có câu hỏi ở bước 4” instead of `0 câu`. The same derived value is used in Review and create/update payloads; a zero result omits `maxQuestions` so the backend can preserve its no-limit meaning.
- Requests: create always sends `maxAttempts` (and `timeLimitMinutes`) [C1]; the full Draft update body keeps both keys because the backend treats an absent key as “unchanged” [C2]; the dirty-only edit PUT sends them only when changed. Mapper reads `maxAttempts` from `CampaignResponse` [C5]; absent ⇒ 1.
- Review (“Kiểm tra”) step: summary row “Luật làm bài · {minutes} phút · tối đa {n} lần” with **Sửa** jumping to step 5.

### Campaign Detail — attempt-rules card (ATT1-F2)

The “Luật làm bài” card replaces the former Duration metric and shows sitting length + maximum attempts.

| Campaign status | Card behaviour |
| --- | --- |
| Draft | Link **Sửa ở bước 5** → `/employer/campaigns/{id}/edit?step=5`; no increase button |
| Active, `maxAttempts` < 3 | **Tăng số lần** opens the increase dialog |
| Active, `maxAttempts` = 3 | Display only |
| Closed / Archived / Paused | Display only |
| Any non-Draft | “(khoá sau khi triển khai)” next to the sitting length; there is no way to edit the sitting length [C3] |

Increase dialog (“Tăng số lần làm bài”): lists only values **greater than** the current one; states the three consequences (applies to every candidate including those already out of attempts; each retake costs 1 organization credit; cannot be decreased later). Saving sends `PUT /api/v1/campaign/{id}` with exactly `{ title, maxAttempts }` — `title` is required by the backend, and no other form field is sent (partial PUT; extra keys risk another lock’s 409). On success: close, invalidate campaign detail and list queries, toast “Đã tăng lên {n} lần”.

Errors in the dialog (dialog stays open):

| Response | UI |
| --- | --- |
| `409 { code: "MAX_ATTEMPTS_DECREASE", error }` [C2] | Server `error` shown verbatim |
| `409 { code: "TIME_LIMIT_LOCKED", error }` [C3] | Server `error` shown verbatim |
| Other `409` with `error` (e.g. Closed/Archived value change) | Server `error` shown verbatim |
| Anything else | Generic localized failure |

Publishing with a missing or out-of-range sitting length is rejected by the server with `400` [C4].

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
| Increase max attempts (Active, Campaign Detail) | `PUT /api/v1/campaign/{id}` with exactly `{ title, maxAttempts }` (ATT1 [C2]) |
| Attempt-rules contract | `timeLimitMinutes` 5–180 and `maxAttempts` 1–3 on create/update; `maxAttempts` on every `CampaignResponse`; 409 `MAX_ATTEMPTS_DECREASE` / `TIME_LIMIT_LOCKED` (ATT1 [C1]–[C5]) |
| End / Archive | `PUT /api/v1/campaign/{id}/status` `{ status: "Closed" \| "Archived" }` |
| Soft-delete | `DELETE /api/v1/campaign/{id}` |
| Invite by email | `POST /api/v1/campaign/{id}/invitations` `{ emails: string[] }` |
| Upload JD PDF (edit mode, on file select) | `POST /api/v1/campaign/{id}/files` (multipart) |
| Replace JD PDF (edit mode) | `PUT /api/v1/campaign/{id}/files` (multipart, Draft only) |
| Save job needs (Draft only) | `PUT /api/v1/campaign/{id}/job-needs` (replace-all array; echo existing `needId`) |
| Preview system criteria | `GET /api/v1/campaign/criteria/system-default/preview?jobCategory&language` |
| Apply system criteria (Draft only) | `POST /api/v1/campaign/{id}/criteria/from-system-default` |
| Criteria contract | `criteria[].id`, `minPct`, `levels` are preserved through mapper and replace-all writes |
| Questions contract | `questionsPerSession`, `questionGroup`, `isRequired`, `questionBankSummary` |
| Adaptive validation | `maxDeepPerQuestion`, derived `maxQuestions`; surface `ADAPTIVE_BUDGET_TOO_SMALL` and `QUESTION_BANK_INVALID`. When `questionsPerSession` (K) is omitted, adaptive budget uses the full question-bank count (`questions.length`) — the same rule used by settings, review, and create/update payloads. |
| Job-needs contract | `isMustHave`, `eligible`, `missingMustHave`; invitation may send `includeIneligible` |
| CV screening ranking | `GET /api/v1/campaign/{id}/candidates` — `overallMatchScore` remains the sort score; `verificationRisk` and `screeningVersion` are separate flags |
| CV screening detail | `GET /api/v1/campaign/{id}/candidates/{candidateId}` — `strengths`/`gaps` include CV evidence; legacy `criterionScores` is not rendered |
| Interview results ranking | `GET /api/v1/campaign/{id}/results` — independent from CV screening ranking |

## Validation

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`

## Location field boundary

- `location` remains a read-only response field for existing campaign list/detail
  views where the backend provides it.
- The create/edit wizard does not collect, validate, autocomplete, map, or send
  location data. The former Photon/OpenStreetMap browser integration was removed
  in UX4-F5 because the current create/update contract does not persist it.

## ATS API key integration

The frontend uses the v10 split credential model:

- `POST/GET /api/v1/campaign/api-keys` and `DELETE /api/v1/campaign/api-keys/{id}` use the authenticated Employer JWT; only `OrgAdmin` may manage keys.
- `GET /api/v1/campaign/public/campaigns` and `GET /api/v1/campaign/public/campaigns/{id}/results` use `X-Api-Key` and deliberately omit the Bearer token.
- Key creation sends `expiresInDays` (1–730) and deny-by-default `includePii=false`; the raw key is returned only once.
- Public campaign lists use `X-Next-Cursor`; public results expose `piiIncluded` so consumers know whether identity fields are present.
