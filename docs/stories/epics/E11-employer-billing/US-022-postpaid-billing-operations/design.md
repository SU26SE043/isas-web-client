# US-022 Postpaid Billing Operations — Design

> **Source of truth used here:** `Isas.PaymentService` controller/DTO source in
> the `isas-server` repo (`src/services/Isas.PaymentService/Controllers/`,
> `.../DTOs/`), read directly, on 2026-08-15. `isas-server`'s own
> `docs/services/payment.md` line 162 still describes an old, never-shipped
> route (`POST /payment/admin/orgs/{orgId}/postpaid`) as `🔜`. **Ignore that
> line** — the real, live route is `POST /payment/admin/credits/payment-mode`
> and it is what this packet (and the existing `adminPayment.service.ts`)
> already calls.

## Domain Model

```
CreditAccount.paymentMode: 0=Prepaid | 1=Postpaid   (User owner is always 0)
Invoice.status:            0=Issued | 1=Paid | 2=Overdue | 3=Void
Order.kind:                0=CreditPack | 1=InvoiceSettlement | 2=SubscriptionPurchase | 3=SubscriptionRenewal
```

State machine — payment mode (Org only; User owners cannot change):

```
Prepaid --(Admin approves, creditLimit>0, org eligible, note required)--> Postpaid
Postpaid --(Admin, no unpaid Issued/Overdue invoice, periodUsage=0)--> Prepaid
```

State machine — invoice (postpaid only):

```
(period close) --> Issued --(background reconciler, DueAt passed)--> Overdue
Issued  --(POST .../pay, webhook Paid)--> Paid
Overdue --(POST .../pay, webhook Paid)--> Paid
```

An `Overdue` invoice blocks the org from reserving new interview credit
(`402`/`403` at session-start time, outside this packet's scope) but does not
interrupt an interview already in progress.

## Application Flow

**Admin approves/changes mode:**
1. Admin searches the organization directory (reuse `useAdminOrganizations`),
   picks a row.
2. Page fetches `GET /admin/credits/0/{orgId}` and renders the org's current
   mode, credit limit, period usage, remaining/reserved credits *before* any
   input is editable for the mutation.
3. Admin fills mode + (if Postpaid) credit limit + note, submits
   `POST /admin/credits/payment-mode`.
4. On success, re-fetch the same `GET /admin/credits/0/{orgId}` to show the new
   state — do not trust the response body alone as the final source of truth
   for a page the admin may keep open.

**Admin closes a billing period:**
1. Same org-picker as above (share the query, do not duplicate the search UI).
2. `POST /admin/invoices/close` with `{ orgId, periodStart?, periodEnd? }`.
3. Response is the created `Invoice` — show it inline; there is no admin-side
   invoice list to navigate to (see §Backend Gaps).

**OrgAdmin pays an invoice:**
1. `GET /me/invoices` → table.
2. `POST /invoices/{id}/pay` → `Order` with `checkoutUrl` → redirect (same
   pattern as `usePayEmployerInvoice` today — keep it).
3. On return, existing order-callback polling (`useEmployerPaymentCallback`)
   already invalidates `employerPaymentKeys.invoices()` — verify this still
   fires for `kind=InvoiceSettlement` orders, not just `CreditPack` (check
   `resolvePaymentOrderError.ts` / callback outcome mapping for a `kind`
   branch; if it silently assumes `CreditPack`, that is a bug to fix in this
   packet, not a new scope item).

## Interface Contract (verified against controller source)

| Method | Path | Auth | Request | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/v1/payment/me/invoices` | `Employer` (OrgAdmin + HrMember) | — | `200 InvoiceResponse[]` | `403` no owner claim |
| `GET` | `/api/v1/payment/me/invoices/{id}` | `Employer` | — | `200 InvoiceResponse` | `404` not found / not owner |
| `POST` | `/api/v1/payment/invoices/{id}/pay` | `Employer`, **not** HrMember (403 via `IsHrMember()`) | — | `200 OrderResponse` (`kind=InvoiceSettlement`, `checkoutUrl` set) | `404` not found/not owner · `409 {message}` already Paid/Void · `502 {message}` PayOS reject |
| `POST` | `/api/v1/payment/admin/invoices/close` | `Admin`, not HrMember | `{ orgId: guid, periodStart?: date, periodEnd?: date }` | `200 InvoiceResponse` | `404 {message}` no wallet for org · `409 {message}` org is Prepaid · `409 {message}` `Billing:UnitPrice` not configured |
| `POST` | `/api/v1/payment/admin/credits/payment-mode` | `Admin` | `{ ownerType: 0, ownerId: guid, paymentMode: 0\|1, creditLimit?: int (required & >0 iff Postpaid), note: string (3–500 chars, required), allowStrandedCredits?: bool }` | `200 SetPaymentModeResponse` (`ownerType, ownerId, paymentMode, creditLimit, remainingCredits, reservedCredits`) | `400 {message}` `ownerType != Org` · `400 {message}` credit-limit combo invalid · `403 {message}` org tier not Postpaid-eligible · `404 {message}` no wallet yet (endpoint never auto-creates one) · `409 {message}` stranded credits (also returns `remainingCredits`/`reservedCredits` in the body — surface these numbers, do not discard them) · `409 {message}` unpaid debt (Issued/Overdue invoice or `periodUsage>0`) · `409 {message}` concurrent change, retry |
| `GET` | `/api/v1/payment/admin/credits/{ownerType}/{ownerId}` | `Admin` | — | `200 CreditAccountResponse` (`paymentMode, status, remainingCredits, reservedCredits, freeCreditsGranted, walletExists, creditLimit, periodUsage, updatedAt`) — **`200` with zero values, never `404`, when no wallet exists yet** | — |
| `GET` | `/api/v1/payment/admin/credits/{ownerType}/{ownerId}/transactions` | `Admin` | `?reason=&cursor=&limit=` | `200 CreditTransaction[]` + `X-Next-Cursor` header | — |

Every field above was read directly from
`AdminCreditsController.cs`, `InvoiceController.cs`, `SetPaymentModeRequest.cs`,
`InvoiceRequest.cs`, `CreditAccountResponse.cs`. The existing
`src/features/employer-billing/types/employerPayment.types.ts` and
`src/features/admin/services/adminApi.endpoints.ts` already match this
contract — reuse them, do not redeclare.

## Backend Gaps (file against `isas-server`, do not work around in this repo)

1. **`InvoiceResponse.ToResponse` drops `DueAt` and `PaidAt`.** The `Invoice`
   entity has both columns (`Models/Invoice.cs:25-29`) and
   `InvoiceOverdueReconciler` already reads `DueAt` to flip
   `Issued → Overdue`. The DTO
   (`Isas.PaymentService/DTOs/InvoiceRequest.cs`, `InvoiceResponse` class /
   `ToResponse` method) simply never maps them. Until this ships, the
   frontend cannot show "due in N days" or "paid on ..." — do not
   client-side-guess a due date from `periodEnd`; the grace-period length
   (`Billing:InvoiceDueDays`) is a server config value the client does not
   have.
2. **No admin-facing invoice list per org.** `GET /admin/orders` supports
   `?status=&ownerType=&refundSettlement=` but **not** `?ownerId=`, and there
   is no `GET /admin/.../invoices` route at all. An admin closing a period or
   troubleshooting a Postpaid org has no way to see that org's invoice
   history without direct DB access.
3. **No invoice PDF/export endpoint.** Confirms the "Download" button in
   `EmployerInvoicesPage.tsx` has never had anything real to call.

These three are the reason `Non-Goals` in `overview.md` excludes due-date
display, admin invoice history, and PDF export. Fixing them is out of scope
for `isas-web-client`; this file exists so whoever picks up the backend side
does not have to re-derive the same findings.

## Data Model

No new client-side persistence. `adminApi.types.ts` needs one type fix (see
§UI / Platform Impact) — no schema, no migration.

## UI / Platform Impact

Files to touch:

- `src/features/admin/types/adminApi.types.ts` — replace
  `export type CreditAccount = Record<string, unknown>;` with the real shape
  (mirror `PaymentAccountResponse` from
  `employer-billing/types/employerPayment.types.ts`, or import it directly if
  cross-feature import is already an established pattern elsewhere in
  `src/features/admin`).
- `src/features/admin/pages/AdminBillingPage.tsx` — replace the raw org-id
  text input with a search-and-pick control backed by `useAdminOrganizations`
  (same hook `AdminOrganizationsPage.tsx` already uses); add the
  current-state preview call (`adminPaymentService.getCreditAccount`) once an
  org is selected, before the mutation form is editable; surface the
  `remainingCredits`/`reservedCredits` numbers from a `409 StrandedCredits`
  response next to the `allowStrandedCredits` checkbox.
- `src/features/employer-billing/utils/employerPaymentErrors.ts` — extend
  `PaymentAction` with an `'invoicePay'` case; map 403 → HrMember-blocked
  copy, 404 → invoice missing, 409 → not payable (already Paid/Void), 502 →
  gateway, reusing the existing `employerBilling.errors.*` key family (add
  `invoiceNotPayable` / `invoiceMissing` keys — see `validation.md` for the
  i18n-parity check that will catch a missing `en` or `vi` counterpart).
- `src/features/employer-billing/pages/EmployerInvoicesPage.tsx` — wire the
  new error key through `payInvoice` the same way
  `EmployerOrdersPage.tsx` wires `cancel.error` today; remove the
  `pdfReadyInvoiceId` Download affordance (or gate it behind a `false` feature
  flag with a one-line comment pointing at this packet, if the team prefers
  to keep the button visually reserved for later — pick one, do not leave it
  faking success).
- `EmployerInvoicesPage.tsx` status badge — give `InvoiceStatus.Overdue` a
  `variant="destructive"` `Badge` (the component already supports it) instead
  of the shared neutral `variant="outline"` used for every status today.
- Confirm (and fix if wrong) that `useEmployerPaymentCallback` invalidates
  `employerPaymentKeys.invoices()` for `kind=InvoiceSettlement` returns, not
  only `CreditPack` — trace from `resolvePaymentOrderError.ts` /
  `paymentOrderOutcome.ts`-equivalent employer logic.

No new routes. No layout change. Existing dark monochrome tokens and
`AdminPageShell` / `EmployerDashboardLayout` wrappers are reused as-is.

## Observability

No new logs/audit records needed on the frontend. Do not persist a
`checkoutUrl` beyond the existing `sessionStorage` pending-order pattern
already established for `CreditPack` orders in `design.md` of US-016 — the
`InvoiceSettlement` flow should follow the identical pending-order handoff,
not a parallel mechanism.

## Alternatives Considered

1. **Guess the invoice due date on the client from `periodEnd` + a hardcoded
   day count.** Rejected — the grace period is a server config
   (`Billing:InvoiceDueDays`) that can change without a frontend deploy; a
   guessed date would silently drift from the real Overdue reconciler and
   mislead an OrgAdmin about how much time is left.
2. **Build a client-side PDF from the invoice JSON as a stopgap for
   "Download."** Rejected — it produces a document with no backend-verifiable
   provenance for what is, ultimately, a tax/accounting artifact; the honest
   state is "not available yet," not a fake file.
3. **Let the admin type an org ID as free text but add inline validation
   only.** Rejected — validation cannot fix "the admin does not know the
   org's current state before mutating it," which is the actual risk (an
   uninformed `allowStrandedCredits=true` can strand real purchased credit).
