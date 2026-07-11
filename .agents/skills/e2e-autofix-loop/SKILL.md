---
name: e2e-autofix-loop
description: >-
  Agentic auto-fix loop for Playwright E2E tests. Run tests, diagnose failures,
  fix application code (never test files), and retest until green or 5 iterations.
  Use when the user asks to fix E2E failures, run the auto-fix loop, or points to
  a Playwright spec under e2e/specs/.
---

# E2E Auto-fix Loop

Autonomous loop: run Playwright → read output → fix **application code** → retest.

## When to use

- User says "auto-fix loop", "fix E2E", or points to `e2e/specs/**/*.spec.ts`
- CI or local `npm run test:e2e` is failing
- UI regressions caught by Playwright smoke or journey specs

## Test commands

| Scope | Command |
|-------|---------|
| Full suite | `npm run test:e2e` |
| Single spec | `npx playwright test e2e/specs/<path>.spec.ts` |
| Single test by title | `npx playwright test e2e/specs/<path>.spec.ts -g "test title"` |

Playwright starts `vite preview` on `http://127.0.0.1:4173` via `playwright.config.ts` — no separate dev server needed.

## Execution Loop Rules

1. **Run the Test** — Execute the test command (default `npm run test:e2e`, or the specific Playwright spec file the user points to).

2. **Analyze Output** — Read the terminal output.

3. **If exit code is 0 (Passed)** — Stop the loop, report success, and do not make any further changes.

4. **If exit code is non-zero (Failed)** — Proceed to diagnose and fix.

5. **Diagnose & Fix** — Carefully analyze the stack trace and error logs. Identify whether the issue is a UI bug in the component (`src/components/ui/*`, `src/features/*`, `src/layouts/*`) or a logic/routing error. Modify the **application code** to fix the root cause.

6. **Retest** — Automatically go back to Step 1 and run the **exact same** test command again.

7. **Iteration Limit** — Repeat until the test passes. If you fail to fix it after **5 iterations**, stop and ask the user for guidance.

## Strict Constraints

- **DO NOT** modify test files under `e2e/specs/` just to make tests pass (no deleting assertions, no loosening selectors to hide bugs).
- Fix the underlying application code to satisfy test requirements.
- UI fixes must follow the project's **monochrome dark mode** design system (`docs/UI_GUIDE.md`, `src/styles/colors.css`).
- Bilingual copy: all user-visible text via `useLanguage().t('key')` with vi/en parity.
- Max 250 lines per UI file under `src/features/`, `src/layouts/`, `src/components/ui/`.
- Prefer primitives from `src/components/ui` and `cn()` from `src/lib/utils`.

## Diagnosis guide

| Error signal | Likely fix location |
|--------------|---------------------|
| `getByRole` / `getByText` not found | Missing or wrong accessible name, heading level, `role`, or i18n key |
| `toHaveURL` mismatch | React Router path, redirect guard, or auth middleware |
| `toBeVisible` timeout | CSS visibility, z-index, loading state never resolving, or wrong `aria-hidden` |
| WebServer / preview failure | Run `npm run build` first; fix TypeScript or Vite build errors |
| Screenshot / layout | Monochrome tokens, responsive overflow, missing `main`/`banner` landmarks |

## Reporting

After each iteration, briefly log:

```
Iteration N/5 — <command> — PASS | FAIL
```

On **PASS**: summarize what was wrong (if anything was fixed) and confirm no test files were changed.

On **stop at 5**: list what was tried, the last error output, and specific questions for the user.

## Verification after fixes

When UI or routing changed, also run:

```bash
npm run check:i18n
npm run check:ui-size
```

Only when the user explicitly requests a commit.
