# Campaign Discovery — Status: OUT OF SCOPE (public browse)

> **Product decision (2026-07-12):** B2B candidates enter campaigns **only via magic link**. Public campaign browse/enroll is **not** part of the frontend product. See [`product-scope.md`](./product-scope.md) and [`module-scope.md`](./module-scope.md) §5.

---

## In scope — magic link only

| Path | Component | Status |
| --- | --- | --- |
| `/invite/:token` | `MagicLinkLandingPage` | **Keep** — canonical B2B candidate entry |

**Flow:**

1. Employer publishes campaign → system sends email with magic link.
2. Candidate opens `/invite/:token`.
3. Validate invite → register/sign in if needed → interview preparation → interview room.

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

## Historical reference (pre-discovery)

Previously documented flow (no longer valid):

1. ~~Candidate opens `/candidate/campaigns`.~~
2. ~~Search/filter public campaigns.~~
3. ~~Enroll via `/candidate/campaigns/:id/enroll`.~~

Enrollment profile gate (70% completeness) may still apply in the **magic-link** path if product requires it — confirm in a future story.

---

## Related

- B2B employer campaign lifecycle: [`campaign-management.md`](./campaign-management.md)
- Product scope: [`product-scope.md`](./product-scope.md) §4.7
- Module reconcile: [`module-scope.md`](./module-scope.md) §5
