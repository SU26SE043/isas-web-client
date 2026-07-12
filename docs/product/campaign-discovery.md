# Campaign Discovery — Status: OUT OF SCOPE (public browse)

> **Product decision (2026-07-12):** B2B candidates enter campaigns **only via magic link**. Public campaign browse/enroll is **not** part of the frontend product. See [`product-scope.md`](./product-scope.md) and [`module-scope.md`](./module-scope.md) §5.

---

## In scope — magic link only

| Path | Component | Status |
| --- | --- | --- |
| `/invite/:token` | `MagicLinkLandingPage` | **Keep** — canonical B2B candidate entry |

## Magic link flows

### Employer side (before candidate clicks)

1. HR adds emails (candidate selection or invite modal).
2. System **lookup email** ([`product-scope.md`](./product-scope.md) BR-B2B-06–11).
3. If email **already registered as Candidate** → row appears **immediately** in campaign candidate list (`invited`).
4. If email unknown → row `invite_pending` until registration.
5. Publish → send magic-link email.

### Candidate side (after click)

1. Candidate opens `/invite/:token`.
2. Validate invite token.
3. Branch:
   - **Account exists (Candidate)** → **Sign in** → interview preparation → interview room.
   - **No account** → **Register** (Candidate only) → interview preparation → interview room.

One email = one role — invite to an HR/Organize/Admin email is rejected at entry time on the employer UI.

---

## Out of scope — public discovery (deprecated)

The following were implemented during an earlier phase but **contradict** current product scope:

| Path | Component | Action |
| --- | --- | --- |
| `/candidate/campaigns` | `CampaignBrowsePage` | Deprecate — remove nav links; redirect or remove route |
| `/candidate/campaigns/:id` | `CampaignDetailPage` | Deprecate |
| `/candidate/campaigns/:id/enroll` | `CampaignEnrollmentPage` | Deprecate |

Do **not** extend these screens. New B2B candidate work should go through `/invite/:token` and the shared interview engine.

---

## Open items

- Profile completeness gate (70%) on magic-link path — confirm in a future story (`employer-analytics.md` / dashboard BRD refs).
- Whether Candidate sees campaign in their B2C UI before completing interview — **Chưa được đặc tả trong tài liệu.**

---

## Related

- B2B employer campaign lifecycle: [`campaign-management.md`](./campaign-management.md)
- Product scope: [`product-scope.md`](./product-scope.md) §4.5–4.7
- Pipeline statuses: [`employer-analytics.md`](./employer-analytics.md)
- Module reconcile: [`module-scope.md`](./module-scope.md) §5
