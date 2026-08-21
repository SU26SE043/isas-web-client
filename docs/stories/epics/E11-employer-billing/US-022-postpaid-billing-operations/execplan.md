# US-022 Postpaid Billing Operations — Exec Plan

## Goal

Turn the postpaid controls shipped in `08139a9` from a working-but-blind admin
form and a silently-failing invoice-pay button into a safe, understandable
operational surface — without touching backend code and without inventing
frontend workarounds for the three backend gaps listed in `design.md`.

## Scope

In scope:

- Admin org search/pick for the billing page (reuse the existing organization
  directory, do not build a new one).
- Admin current-state preview before a payment-mode mutation.
- Typed `CreditAccount` admin type (delete the `Record<string, unknown>`).
- Error handling and copy for `POST /invoices/{id}/pay` on the employer side.
- Overdue-invoice visual severity (danger badge).
- Removing the fake invoice "Download" affordance.
- Fixing the postpaid-settlement callback invalidation if it turns out to be
  `CreditPack`-only (confirm first; only "fix" if the confirmation finds a
  real bug).
- `docs/product/employer-billing.md`, `docs/product/module-scope.md` updates
  to match live behavior.

Out of scope (see `overview.md` §Non-Goals for why):

- Invoice PDF export.
- Invoice due-date / paid-date display.
- Admin-side per-org invoice history.
- Any change inside `isas-server`.
- Refund UI, subscription-plan management.

## Risk Classification

Risk flags (per `docs/FEATURE_INTAKE.md`):

- Authorization — Admin vs OrgAdmin vs HrMember gates already exist; this
  packet must not weaken them while adding the org-picker or error copy.
- External systems — PayOS-backed invoice settlement flow.
- Public contracts — consuming (not changing) the live PaymentService
  contract; a wrong assumption here breaks real money flows silently.
- Existing behavior — `AdminBillingPage.tsx` and `EmployerInvoicesPage.tsx`
  are both already shipped and used.

Hard gates: Authorization, External provider behavior, Existing behavior
changes → **high-risk lane**, matching the folder this packet lives in.

## Work Phases

1. **Confirm current behavior against live code**, not against this packet's
   memory of it — the packet was written 2026-08-15; re-check `git log` on
   the four touched files before starting in case they moved again.
2. **Type the admin account response** (`adminApi.types.ts`) and wire
   `getCreditAccount` into `AdminBillingPage.tsx` behind the org-pick step.
3. **Add the org search/pick control**, backed by `useAdminOrganizations`.
   Keep the raw-GUID text field as a fallback/override, do not remove the
   ability to paste an ID directly (support tickets sometimes hand you a raw
   ID).
4. **Extend `PaymentAction`/`getEmployerPaymentErrorKey`** with the
   `invoicePay` case, add the two new i18n keys in both `vi` and `en`, wire
   the error into `EmployerInvoicesPage.tsx`.
5. **Give `Overdue` a `destructive` badge**; remove or flag-gate the fake
   Download button.
6. **Trace the `InvoiceSettlement` order-callback invalidation path.** If it
   already correctly invalidates `employerPaymentKeys.invoices()` regardless
   of `kind`, note that in `validation.md` and move on — do not "fix" code
   that already works.
7. **Update `docs/product/employer-billing.md`** (known-gaps section
   pointing at this packet) and **`docs/product/module-scope.md`** (Payment
   B2B row → live, not mock).
8. **Run validation** (`validation.md`), record proof status with
   `scripts/bin/harness-cli story update --id US-022 ...` once a harness-cli
   binary is available for this OS (see `validation.md` §Commands for the
   current limitation on macOS/Linux).
9. **Update `docs/stories/backlog.md`** status from `planned` to whatever the
   real end state is (`in_progress` if phases are split across sessions,
   `implemented` once validation passes).

## Stop Conditions

Pause for human confirmation if:

- Confirming Phase 6 finds the `InvoiceSettlement` callback path is actually
  broken today (money already collected but UI never reflects it) — this is
  a data-correctness bug, not a cosmetic one, and may need a hotfix path
  outside this packet's normal pace.
- The organization-directory query (`useAdminOrganizations`) does not expose
  enough fields to distinguish orgs safely (e.g., two orgs with the same
  display name) — do not ship an org-picker that can select the wrong
  organization for a money-mutation endpoint.
- Any change here would require touching `isas-server` — stop, document the
  exact gap (it likely already is in `design.md` §Backend Gaps), and hand off
  rather than reaching into the other repo from this packet.
