# ISAS Frontend — Product Scope Document

**Status:** Approved v2 (Product Discovery)  
**Date:** 2026-07-12  
**Source:** Product Discovery Rounds 1–5; supersedes scattered BRD assumptions where noted below.

Living contract for **what the frontend product is**. Module and screen mapping: [`module-scope.md`](./module-scope.md).

---

## 1. Product definition

**ISAS** is an AI interview simulation and assessment platform. One shared **Interview Engine** serves two product lines:

| Line | `campaign_id` | Primary users | Core value |
| --- | --- | --- | --- |
| **B2C** | `null` | Candidate | Self-serve practice, learning roadmap, prepaid wallet (token settle) |
| **B2B** | set | HR, Organize | Campaigns from JD, AI screening, magic-link invites, ranking, analytics |

**Deliverable:** Production-ready for **limited real beta users** (not demo-only).

**Account rule:** One email = one role (no dual Candidate + HR).

**Deploy target:** Beta with real users (limited cohort).

---

## 2. Scope tiers

### Tier 1 — Required for production

| ID | Module / flow |
| --- | --- |
| T1-01 | B2C — Interview Practice |
| T1-02 | B2C — Learning Roadmap |
| T1-03 | B2B — Org onboarding + verify + billing setup |
| T1-04 | B2B — Campaign creation |
| T1-05 | B2B — Candidate selection (upload email/CV, AI screening, ranking, select) |
| T1-06 | B2B — Publish campaign (email config, magic link, send email) |
| T1-07 | B2B — Assessment & analytics (interview, report, ranking, export) |
| T1-08 | Payment B2C (prepaid wallet, PayOS — reserve + settle tokens) |
| T1-09 | Payment B2B (postpaid monthly by tokens) |
| T1-10 | Reports (candidate + employer views) |
| T1-11 | Admin full (user mgmt, tenant, audit, AI config) — **internal ops only** |
| T1-12 | Transactional email (invite, results, payment, invoice) |
| T1-13 | Usage & billing UI (token usage, history, invoices) |

### Tier 2 — Present; may be simplified

- Guest / marketing landing
- Leaderboard
- Certificate

### Tier 3 — Post-capstone backlog

- Learning Hub (standalone module — distinct from Roadmap)
- ATS webhook integration

### Explicitly out of scope

- **Public campaign browse** (open catalog at `/candidate/campaigns`) — **out of scope**
- **My invited campaigns** (`/candidate/campaigns`) — **in scope**; magic link email lands here after auth
- Standalone GitHub repository analysis and repository input inside CV analysis
- Native iOS/Android, offline mode, live human video interview
- See [`module-scope.md`](./module-scope.md) for route-level reconcile

---

## 3. Personas & role split

| Role | Frontend responsibility |
| --- | --- |
| **Guest** | Marketing (Tier 2), sign up / sign in |
| **Candidate** | B2C practice, roadmap, prepaid wallet, token usage, history |
| **HR** | Campaign lifecycle, screening, select candidates, publish, ranking/analytics |
| **Organize** | Org onboard, company verify, **billing/payment**, HR management |
| **Admin** | Platform ops — tenant, audit, AI config (internal) |

**Decisions:**

- **Payment = Organize**
- **Campaign = HR + Organize** (both participate in campaign lifecycle)
- **Verify gate:** Org **not verified** → **cannot create or publish campaigns**

---

## 4. End-to-end workflows

### 4.1 B2C — Interview Practice (Tier 1)

1. Register / sign in
2. Top up prepaid wallet if balance insufficient
3. **Create practice session** (reserve estimated tokens)
4. Choose domain
5. Upload CV (optional) → AI CV analysis
6. Configure interview (question count, difficulty, …)
7. AI generates questions
8. Start interview → answer each question → submit
9. AI evaluation → report
10. **Settle actual tokens** used
11. Save to history → view history

### 4.2 B2C — Learning Roadmap (Tier 1)

Sign in → menu **Roadmap** → **Creation Wizard** (not a roadmap list):

1. Choose domain (**Frontend / Backend / Business Analyst** only)  
2. Multi-select completed Interview Practice reports **for that domain** (UI shows up to 3; need ≥3 eligible; Select all / Unselect all)  
3. Choose target level (Intern / Fresher / Junior / Middle / Senior / Lead)  
4. Confirm  
5. Create Roadmap → AI generates path (strengths, gaps, milestones, lessons, practice) → **redirect to Learning**

Roadmap is **not** created from the Learning Hub. Contract: [`learning-roadmap.md`](./learning-roadmap.md).

### 4.3 B2B — Pre-campaign

Organize: onboard org → verify company → set up postpaid monthly billing

### 4.4 B2B — Campaign creation

Employer login → campaign list → create → domain → target level → upload JD → AI generates rubric → edit/upload rubric → configure questions → **save draft**

*Blocked if org not verified.*

### 4.5 B2B — Candidate selection

Open draft → upload email list or CVs → **system resolves each email against registered accounts** → AI screening → ranking → employer selects → **candidate list**

**Email resolution (immediate):**

| Email lookup result | Campaign candidate list | Next step |
| --- | --- | --- |
| **Already registered as Candidate** | **Appears immediately** — row linked to existing `candidate_id` | Status `invited`; magic link → sign in → **`/candidate/campaigns`** |
| Not registered | Appears as invite pending — row has email only | Status `invite_pending`; magic link → register → **`/candidate/campaigns`** |
| Registered as HR / Organize / Admin | **Reject** — show validation error on that email | Cannot invite; one email = one role |

Employer may still run AI screening and ranking on uploaded CVs; email resolution runs when emails are added (upload list or invite input).

### 4.6 B2B — Publish

Draft → invitation email config → preview → publish → magic links → send email → **active**

Candidates already linked by email (registered accounts) **remain visible** in the campaign list before and after publish; publish sends or refreshes magic-link email.

### 4.7 B2B — Assessment & analytics

Full candidate assessment flow: [`campaign-assessment.md`](./campaign-assessment.md).

Summary:

1. Magic link → validate → sign in or register → **`/candidate/campaigns`**
2. Card CTA → campaign briefing → device check → terms acceptance
3. Identity verification (baseline face photo)
4. Interview (camera on, sequential questions, proctoring)
5. Violations → pause → warning → continue or auto-submit at max violations
6. AI evaluation → complete → employer ranking, analytics, export

**Candidate channel:** Magic link email → campaigns hub (`/candidate/campaigns`). **No** public catalog browse.

---

## 5. Business rules — token-based monetization

**Principle:** Both B2C and B2B bill by **AI tokens consumed**. Users **see token usage** on the frontend. Legacy rule “1 credit = 1 session” is **retired**.

### B2C — Prepaid wallet + reserve/settle

| Rule | Description |
| --- | --- |
| BR-B2C-01 | Top up prepaid wallet via PayOS (balance maps to token budget) |
| BR-B2C-02 | Check sufficient balance before creating a session |
| BR-B2C-03 | **Reserve** estimated tokens on **create practice session** |
| BR-B2C-04 | **Settle** actual tokens after report is available |
| BR-B2C-05 | Tokens count all AI steps (CV analysis, question gen, evaluation, roadmap steps when applicable) |
| BR-B2C-06 | UI shows per-session token usage + usage history |

### B2B — Postpaid monthly by tokens

| Rule | Description |
| --- | --- |
| BR-B2B-01 | No prepaid deduction at publish — usage accrues through the month |
| BR-B2B-02 | **Accumulate tokens per session** (each AI interview/screening in a campaign) |
| BR-B2B-03 | Start of next month: **invoice** = total tokens from prior month |
| BR-B2B-04 | Organize UI: token usage by campaign / month / session |
| BR-B2B-05 | Tokens include AI CV screening, rubric gen, question gen, evaluation, analytics AI |

### B2B — Campaign invite & candidate list

| Rule | Description |
| --- | --- |
| BR-B2B-06 | On email add (selection upload or invite input), **lookup** email in user registry |
| BR-B2B-07 | Email matches existing **Candidate** → **link to campaign immediately** and show in employer candidate list (do not wait for magic-link click) |
| BR-B2B-08 | Linked candidate receives magic link → **sign in** → **`/candidate/campaigns`** → start assessment |
| BR-B2B-09 | Email matches **HR / Organize / Admin** → **reject** with clear error (one email = one role) |
| BR-B2B-10 | Unknown email → `invite_pending`; magic link → **register** → **`/candidate/campaigns`** → start assessment |
| BR-B2B-11 | Pipeline status for linked registered candidates starts at **`invited`** until interview is submitted |
| BR-B2B-12–23 | B2B assessment proctoring & integrity — see [`campaign-assessment.md`](./campaign-assessment.md) |

### Payment roles

| Rule | Description |
| --- | --- |
| BR-PAY-01 | Only **Organize** manages B2B billing and invoices |
| BR-PAY-02 | B2C Candidate tops up own prepaid wallet |

### BRD divergence (record for BRD update)

- BRD D4/D15 stated “show credits, hide tokens” — **reversed** by discovery: show token usage.

---

## 6. B2C vs B2B parity

Both lines are **equal-priority** deliverables for Tier 1.

---

## 7. Resolved contradictions

| Topic | Resolution |
| --- | --- |
| MVP vs extended features | Tiers 1 / 2 / 3 defined |
| B2C billing | Prepaid reserve → settle actual tokens after report |
| B2B billing | Accumulate tokens per session → invoice at month start |
| Credit vs token UX | Show tokens; flat per-session credit retired |
| Public browse vs my campaigns | Browse **out**; invite-only list **in**; magic link → campaigns hub |
| Dual-role accounts | Separate — one email, one role |
| Learning Hub vs Roadmap | Create at `/candidate/roadmap`; study at `/candidate/learning` (dashboard) — see `learning.md` |
| Org verify | No create/publish campaign until verified |
| Registered email on invite | Immediate campaign list row + link to Candidate account (BR-B2B-07) |
| B2B assessment proctoring | Documented in `campaign-assessment.md` (face match, tab/focus, auto-submit) |

---

## 8. Open items (product — not blocking module map)

1. Token → VND conversion rate (fixed vs dynamic)
2. Reserve estimate formula (questions, difficulty, CV analysis flag)
3. Abandon session (B2C): partial settle vs release reserve
4. Tier 2 acceptance criteria for marketing, leaderboard, certificate
5. HR vs Organize screen boundaries for billing vs campaign (detailed in module-scope)
6. Candidate consent before employer sees full profile for email-matched invites
7. Full pipeline status enum after `invited` / `invite_pending` (partially in `campaign-assessment.md`)
8. ~~B2C practice proctoring parity with B2B campaign assessment~~ — **Out of scope:** B2C has no anti-cheat; B2B proctoring per `campaign-assessment.md`.
9. Default values for face interval, similarity threshold, max violations

---

## 9. Related docs

| Doc | Purpose |
| --- | --- |
| [`module-scope.md`](./module-scope.md) | Modules, routes, screen inventory, gaps |
| [`overview.md`](./overview.md) | Short module status summary |
| [`payment.md`](./payment.md) | Payment UX contract (token billing) |
| [`campaign-assessment.md`](./campaign-assessment.md) | B2B magic-link interview, proctoring, violations |
| `BRD/` | Full business spec (update when discovery changes BRD intent) |
