# B2B Campaign Assessment (Magic Link Interview)

**Parent:** [`product-scope.md`](./product-scope.md) §4.7  
**Entry:** [`campaign-discovery.md`](./campaign-discovery.md)  
**Shared engine:** [`practice-interview.md`](./practice-interview.md) (interview room routes)

Frontend contract for the **candidate assessment session** after opening a campaign magic link. Includes identity verification, proctoring, and violation handling.

**Scope:** B2B campaigns (`campaign_id` set). B2C practice has **no anti-cheat**; both lines require **camera on** for the full interview room session.

---

## End-to-end flow

1. Candidate opens **magic link** (`/invite/:token`).
2. **Validate magic link** (token valid, not expired, campaign active).
3. **Authenticate** — sign in if Candidate exists; register if not ([`product-scope.md`](./product-scope.md) BR-B2B-08–10).
4. **Redirect** to **`/candidate/campaigns`** (optional `?highlight={token}` from email).
5. **Campaign card** → **briefing** (`/candidate/campaigns/:token/briefing`) — role, company, duration, instructions, proctoring notice.
6. **Device check** — camera, microphone, internet connectivity.
7. **Accept terms & privacy** — required before continuing.
8. **Identity verification** — capture **baseline face photo**.
9. **Start interview** — enter interview room; **camera stays on** for the entire session.
10. **Answer questions sequentially** (one question at a time).
11. **Periodic face capture** — system captures face on a **configured interval**.
12. **AI face match** — compare periodic capture to baseline; if similarity **below configured threshold** → **pause** session.
13. **Focus / tab monitoring** — if **tab switch** or **window focus loss** detected → **pause** session.
14. **Violation warning screen** — show:
    - Violation reason
    - Current violation count
    - Maximum allowed violations
    - **Continue** button
15. Candidate taps **Continue** → resume interview (if under max violations).
16. If violation count reaches **configured maximum** → system **auto-submits** assessment.
17. **AI evaluation** → assessment **complete** → employer pipeline/report updated.

---

## Screen flow (candidate)

| Step | Route / surface | Notes |
| --- | --- | --- |
| Magic link gate | `/invite/:token` | Validate; auth; redirect to campaigns |
| My campaigns | `/candidate/campaigns` | Invite-only list; empty state |
| Campaign briefing | `/candidate/campaigns/:token/briefing` | Info + instructions + Start assessment |
| Device check | `/interview/:sessionId/device-check` | Camera, mic, network |
| Terms acceptance | Prepare step or dedicated gate | Before identity capture |
| Identity verification | `/interview/:sessionId/identity` | Baseline face photo |
| Waiting / start | `/interview/:sessionId/waiting` | Optional buffer before room |
| Interview room | `/interview/:sessionId/room` | Camera on; sequential Q&A |
| Violation pause | **Overlay / modal** on room (or `/interview/:sessionId/pause`) | Warning UI + Continue |
| Completion | `/interview/:sessionId/complete` | Post-submit confirmation |
| Result (candidate view) | **Chưa được đặc tả route** | Employer report separate |

---

## Business rules — proctoring & integrity

| Rule | Description |
| --- | --- |
| BR-B2B-12 | Camera **must remain on** for entire B2B campaign interview |
| BR-B2B-13 | Candidate answers **one question at a time** (sequential) |
| BR-B2B-14 | **Baseline face photo** captured at identity verification before room |
| BR-B2B-15 | **Periodic face capture** on interval **configured per campaign** |
| BR-B2B-16 | AI face similarity **below threshold** (campaign config) → **pause** session + violation |
| BR-B2B-17 | **Tab switch** or **loss of window focus** → **pause** session + violation |
| BR-B2B-18 | Violation UI shows: **reason**, **current count**, **max count**, **Continue** CTA |
| BR-B2B-19 | Candidate may **continue** after violation if count **below max** |
| BR-B2B-20 | Violation count **≥ max** (campaign config) → **auto-submit**; no further answers |
| BR-B2B-21 | **Terms & privacy** acceptance required before identity verification |
| BR-B2B-22 | **Device check** (camera, microphone, internet) must pass before start |
| BR-B2B-23 | Magic link must be **valid** before showing campaign briefing |

### Campaign-configurable parameters

Set in campaign settings (employer wizard) — **defaults Chưa được đặc tả trong tài liệu:**

| Parameter | Purpose |
| --- | --- |
| `face_capture_interval_sec` | Periodic snapshot interval during interview |
| `face_similarity_threshold` | Minimum match score vs baseline |
| `max_violations` | Auto-submit when reached |
| Magic link expiry | Referenced in `FRONTEND_MASTER_PLAN.md` as BRL-022 (14d) — confirm in campaign contract |

---

## Assessment session states

| State | Description |
| --- | --- |
| `validating_link` | Token check in progress |
| `auth_required` | Sign in or register |
| `briefing` | Campaign info + instructions |
| `device_check` | Camera / mic / network test |
| `terms_pending` | Awaiting terms acceptance |
| `identity_capture` | Baseline face photo |
| `in_progress` | Active interview; camera on |
| `paused_violation` | Paused; violation warning visible |
| `auto_submitted` | Max violations reached; forced submit |
| `submitted` | Answers submitted; awaiting AI evaluation |
| `evaluating` | AI scoring in progress |
| `completed` | Assessment finished |

Employer pipeline should reflect transition from `invited` → `in_progress` → `completed` (or `auto_submitted`) — see [`employer-analytics.md`](./employer-analytics.md).

---

## Violation types (product)

| Type | Trigger |
| --- | --- |
| `face_mismatch` | Similarity below threshold |
| `tab_switch` | Candidate left interview tab |
| `focus_loss` | Window lost focus |

**Chưa được đặc tả:** whether multiple violation types share one counter or separate counters.

---

## Data / API (inferred contract)

Frontend will need (via Gateway — **endpoints Chưa được đặc tả trong tài liệu**):

- `POST validateMagicLink(token)`
- `GET campaignBriefing(campaignId)` for invite context
- `POST acceptTerms(sessionId)`
- `POST identityBaseline(sessionId, image)`
- `POST reportViolation(sessionId, type, metadata)`
- `POST continueSession(sessionId)` after pause
- `POST submitAssessment(sessionId)` — manual or auto
- WebSocket or poll for evaluation status

---

## Status

**Product definition only** — interview routes exist partially (`device-check`, `identity`, `room`); campaign briefing, terms gate, proctoring pause overlay, periodic face capture, and auto-submit **not implemented** in current client contract.

## Related

- [`campaign-management.md`](./campaign-management.md) — campaign settings for proctoring config
- [`module-scope.md`](./module-scope.md) — route inventory
