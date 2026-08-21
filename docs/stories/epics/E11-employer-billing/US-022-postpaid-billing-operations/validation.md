# US-022 Postpaid Billing Operations — Validation

## Proof Strategy

Prove: the admin org-picker cannot submit a money-mutation without a resolved
`ownerId`; the current-state preview reflects the real
`GET /admin/credits/{ownerType}/{ownerId}` response (not a stale cache); every
documented `POST /invoices/{id}/pay` error status renders a distinct,
non-generic message; `Overdue` is visually distinguishable from `Issued`/`Paid`
in both light-contrast dark-mode states; bilingual copy exists for every new
key; no regression in the existing US-016 flows (package purchase, order
cancel, HrMember read-only gate).

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | `getEmployerPaymentErrorKey` returns a distinct key for each of 403/404/409/502 under the new `invoicePay` action; admin `CreditAccount` type accepts the real `PaymentAccountResponse` shape without `as unknown as` casts |
| Integration | `AdminBillingPage` preview fetch fires exactly once per org selection and is invalidated after a successful mode change; `EmployerInvoicesPage` renders the mapped error copy for each mocked HTTP status; `Overdue` row renders `variant="destructive"` badge, `Issued`/`Paid`/`Void` do not |
| E2E | Admin: search an org, see current mode/limit/usage, submit a mode change, see it reflected without a manual refresh. Employer: attempt to pay an invoice that the mock server returns `409` for, see an explanatory message (not a stalled button). HrMember: billing pages still read-only, same 403 explanation as other billing actions |
| Platform | `npm run check:i18n`, `npm run check:ui-size`, `npm run typecheck`, production `npm run build` |
| Regression | Existing US-016 focused tests still pass unmodified; full `npm test -- --run` has no new failures beyond any pre-existing unrelated ones already on `main` |
| Logs/Audit | No `checkoutUrl`, raw stack trace, or PayOS provider detail rendered or persisted anywhere new |

## Fixtures

- Two organizations with distinct names/tax codes for the picker (confirms
  selection cannot be ambiguous).
- `CreditAccountResponse` fixtures for: no wallet yet (`walletExists=false`),
  Prepaid with balance, Postpaid within limit, Postpaid at limit.
- `POST /invoices/{id}/pay` mocked for each documented outcome: `200`
  (Created), `404`, `409` (not payable), `502` (gateway).
- `POST /admin/credits/payment-mode` mocked for each documented outcome,
  including the `409 StrandedCredits` body that carries
  `remainingCredits`/`reservedCredits` — confirm those numbers actually
  render, not just the message.
- `OrgAdmin`, `HrMember`, and platform `Admin` authenticated users.

## Commands

```text
npm run check:i18n
npm run check:ui-size
npm run typecheck
npm test -- --run
npm run build
npm run test:e2e
```

## Harness-CLI Limitation (record before closing this packet)

`scripts/bin/` only ships `harness-cli.exe` (Windows) in this checkout — there
is no macOS/Linux binary, so `scripts/bin/harness-cli story update --id
US-022 ...` cannot run on this machine. Record proof status by hand in
`docs/stories/backlog.md` (row for `US-022`) until a cross-platform binary is
available, and note in the harness delta below that this is a process gap,
not a skipped step.

## Acceptance Evidence

Add results after verification — do not mark this packet `implemented` in
`docs/stories/backlog.md` until every command above has been run and its
output (or a summary of it) is pasted here, following the same evidence style
as `US-016`'s `validation.md`.
