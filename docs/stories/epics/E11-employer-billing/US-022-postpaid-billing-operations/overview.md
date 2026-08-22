# US-022 Postpaid Billing Operations — Overview

## Why this packet exists

Postpaid landed in `08139a9` ("feat(payment): add org postpaid billing controls")
as a direct patch on top of US-016, without a high-risk story packet. The work
touches Authorization, External systems (PayOS), Public contracts, and Existing
behavior — four hard-gate risk flags per `docs/FEATURE_INTAKE.md` — so it should
have gone through the high-risk lane. This packet retroactively covers that gap
and scopes the remaining work so it can be finished the same way every other
high-risk story in this repo is finished: one packet, one checklist, one proof
run.

Read `design.md` for the exact API contract (verified against
`Isas.PaymentService` source, not against the possibly-stale
`docs/services/payment.md` in the backend repo — see the note in `design.md`).

## Current Behavior

- `AdminBillingPage.tsx` (`/admin/billing`) lets a platform Admin call
  `POST /admin/credits/payment-mode` and `POST /admin/invoices/close`, but:
  - The organization is picked by pasting a raw GUID into a text input. There is
    no search, even though `AdminOrganizationsPage` already lists every org with
    name + tax code + a working `useAdminOrganizations` query.
  - The page never reads the org's *current* payment mode / credit limit /
    period usage before the admin submits a change, even though
    `adminPaymentService.getCreditAccount(ownerType, ownerId)` already exists
    and is unused here. The `allowStrandedCredits` checkbox is answered blind.
  - The admin type for the account response is `Record<string, unknown>`
    (`src/features/admin/types/adminApi.types.ts:35`) — untyped, even though
    the correct shape already exists as `PaymentAccountResponse` in
    `src/features/employer-billing/types/employerPayment.types.ts`.
  - There is no way to see an org's invoice history before closing a new
    period. This is a **backend gap**, not a frontend one — see `design.md`.
- `EmployerInvoicesPage.tsx` (`/employer/billing/invoices`) lists invoices and
  can pay them, but:
  - `usePayEmployerInvoice` has no error handling at the call site. A 403
    (HrMember raced past the UI guard), 404 (invoice gone), 409 (already
    Paid/Void), or 502 (PayOS reject) from `POST /invoices/{id}/pay` fails
    silently — the button just stops spinning.
  - The "Download" button (`setPdfReadyInvoiceId`) does not generate or link
    to any file. It shows a static success banner. There is no PDF endpoint on
    the backend to back it.
  - Every invoice status renders with the same neutral badge. `Overdue` — the
    one status that blocks the org from starting new interviews — looks
    exactly like `Issued`.
- `docs/product/module-scope.md` still lists "Payment B2B" as
  "Implemented (mock, Phase 15 E2E covered)". It has been live since US-016 and
  postpaid since `08139a9`.

## Target Behavior

- Platform Admin picks an organization by name/tax code (reusing the existing
  directory query), sees its current payment mode and balances before acting,
  and gets a typed response back.
- An OrgAdmin who tries to pay an invoice that is no longer payable, or hits a
  PayOS error, sees a message that explains what happened — not a silently
  stalled button.
- An Overdue invoice is visually distinct (danger styling) from Issued/Paid,
  matching the severity the backend already assigns it (it blocks new
  interview reservations).
- The fake "Download" affordance is gone until a real backend endpoint exists.
- Product docs describe the live state, not the Phase-15 mock.

## Affected Users

- Platform `Admin` (approves Postpaid, closes billing periods).
- `OrgAdmin` (pays invoices, sees account state).
- `HrMember` (read-only; must see the same 403 explanation as other billing
  actions, not a different one).

## Affected Product Docs

- `docs/product/employer-billing.md`
- `docs/product/module-scope.md`
- `docs/product/payment.md` (cross-reference only — no B2B-postpaid content to
  change there; it already defers to `employer-billing.md`)

## Non-Goals (tracked separately, not silently dropped)

- **Invoice PDF export** — no backend endpoint exists. Do not build a client-
  side PDF renderer as a workaround; that produces a document the backend
  cannot reconcile against. Tracked as a backend follow-up (see `design.md`
  §Backend Gaps).
- **Invoice due-date / paid-date display** — blocked on the backend DTO
  (`InvoiceResponse` never maps the `Invoice.DueAt` / `Invoice.PaidAt` columns
  that already exist and that the Overdue reconciler already reads). Tracked
  as a backend follow-up.
- **Admin-side invoice history for an org** — no backend endpoint
  (`GET /admin/orders` has no `ownerId` filter; there is no
  `GET /admin/.../invoices`). Tracked as a backend follow-up.
- Refund UI, subscription plan management — separate existing surfaces, out of
  scope here.
- Any backend code change. This packet is frontend-only; backend gaps are
  documented so they can be filed against `isas-server`, not fixed here.
