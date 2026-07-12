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

See full flow: [`campaign-assessment.md`](./campaign-assessment.md).

1. Candidate opens `/invite/:token` → **validate magic link**.
2. **Sign in** or **register** (Candidate only).
3. **Campaign information** → **instructions**.
4. **Device check** (camera, microphone, internet).
5. **Accept terms & privacy**.
6. **Identity verification** — baseline face photo.
7. **Interview room** — camera on; sequential questions; proctoring (face interval, tab/focus).
8. **Violation pause** → warning → **Continue** or **auto-submit** at max violations.
9. **AI evaluation** → assessment complete.

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
- Campaign assessment (B2B proctoring): [`campaign-assessment.md`](./campaign-assessment.md)

---

## Related

- B2B employer campaign lifecycle: [`campaign-management.md`](./campaign-management.md)
- Product scope: [`product-scope.md`](./product-scope.md) §4.5–4.7
- Pipeline statuses: [`employer-analytics.md`](./employer-analytics.md)
- Assessment flow: [`campaign-assessment.md`](./campaign-assessment.md)
- Module reconcile: [`module-scope.md`](./module-scope.md) §5
