# Campaign Management

Frontend contract for employer campaign list, create/publish (Flow 1), and invite (Flow 2).

## Status

**List / detail GET live** — `GET /api/v1/campaign`, `GET /api/v1/campaign/{id}`.

**Create Draft live** — `POST /api/v1/campaign` once after the wizard finishes (Employer Bearer). Body includes metadata, JD text (or null for file-later), criteria, schedule, and non-empty questions.

**Update Draft live** — `PUT /api/v1/campaign/{id}` (metadata/JD/criteria) + `PUT /api/v1/campaign/{id}/questions` (JSON array body).

**Publish live** — From Draft detail preview: **Xuất bản** → confirm modal → `POST /api/v1/campaign/{id}/publish`.

**Delete Draft** — From Draft detail: **Xóa** → confirm → `DELETE /api/v1/campaign/{id}`.

**Invite / file upload** — still mock-shaped for upcoming live wiring (candidates, invitations, files).

## Flow 1 — Create & publish

Wizard at `/employer/campaigns/new` (and draft edit): **4 steps** (current UI)

1. Campaign information
2. Job description (text sent on create; file selection is UI-only until a later file API)
3. Evaluation criteria
4. Question configuration → **Create campaign** (`POST`) → navigate to **Campaign Detail (Draft preview)**

Draft preview actions: **Chỉnh sửa** · **Xuất bản** (confirm → publish) · **Xóa** (confirm → delete).

There is **no** “Save draft” button mid-wizard. Create produces `Draft` from the backend. Publish is only from Campaign Detail.

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
| Next step while creating | None |
| Finish wizard (create) | `POST /api/v1/campaign` |
| Next step while editing Draft | None |
| Save changes (edit) | `PUT /api/v1/campaign/{id}` then `PUT …/questions` |
| Publish | `POST /api/v1/campaign/{id}/publish` |

## Validation

- `npm run check:ui-size`
- `npm run check:i18n`
- `npm run typecheck`
