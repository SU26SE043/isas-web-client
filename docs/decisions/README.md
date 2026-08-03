# Decisions

Decision records explain why important product, architecture, or harness choices
were made.

Use `docs/templates/decision.md` when adding a new decision.

After adding or updating a markdown decision file, also add or refresh the
durable decision row:

```bash
scripts/bin/harness-cli decision add \
  --id 0008-auth-boundary \
  --title "Auth Boundary" \
  --doc docs/decisions/0008-auth-boundary.md
```

Trace fields such as `--decisions` summarize task-level choices. They do not
count as the Harness decision log.

## Index

| ID | Title | Doc |
| --- | --- | --- |
| 0001 | Harness-first development | [0001-harness-first-development.md](./0001-harness-first-development.md) |
| 0002 | Post-spec product lifecycle | [0002-post-spec-product-lifecycle.md](./0002-post-spec-product-lifecycle.md) |
| 0003 | Generic spec intake harness | [0003-generic-spec-intake-harness.md](./0003-generic-spec-intake-harness.md) |
| 0004 | SQLite durable layer | [0004-sqlite-durable-layer.md](./0004-sqlite-durable-layer.md) |
| 0005 | Prebuilt Rust Harness CLI | [0005-prebuilt-rust-harness-cli.md](./0005-prebuilt-rust-harness-cli.md) |
| 0006 | Phase 4 benchmark triage | [0006-phase-4-benchmark-triage.md](./0006-phase-4-benchmark-triage.md) |
| 0007 | Improvement proposal rules | [0007-improvement-proposal-rules.md](./0007-improvement-proposal-rules.md) |
| 0008 | BRD + Harness foundation | [0008-brd-harness-foundation.md](./0008-brd-harness-foundation.md) |
| 0009 | Auth login / sign-up shared templates + UI freeze | [0009-auth-login-signup-ui-freeze.md](./0009-auth-login-signup-ui-freeze.md) |
| 0010 | Auth password recovery OTP contract | [0010-auth-password-recovery-otp-contract.md](./0010-auth-password-recovery-otp-contract.md) |
| 0011 | Payment redirect session contract | [0011-payment-redirect-session-contract.md](./0011-payment-redirect-session-contract.md) |
| 0012 | Google OAuth one-time code exchange | [0012-google-oauth-one-time-code.md](./0012-google-oauth-one-time-code.md) |
| 0013 | Organization member administration boundary | [0013-org-member-admin-boundary.md](./0013-org-member-admin-boundary.md) |
| 0018 | Campaign location provider boundary | [0018-campaign-location-provider-boundary.md](./0018-campaign-location-provider-boundary.md) |

Add a decision when:

- A locked technical choice changes.
- A product rule changes meaningfully.
- A validation requirement is added, removed, or weakened.
- A high-risk feature chooses one design over another.
- Auth, authorization, data ownership, audit/security, or API behavior changes.
- The source-of-truth hierarchy changes.
