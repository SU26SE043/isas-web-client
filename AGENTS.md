# Agent Instructions

## Project Skills

Use `.codex/skills/harness-intake-griller/SKILL.md` when a request needs
discussion, feature intake, docs, or story shaping before Symphony execution.
The skill is project-scoped; do not use a global copy as the source of truth.

- **Build Web App Skill**: Bắt buộc tham khảo các quy chuẩn UI/UX, hướng dẫn chất lượng và cách nghiệm thu giao diện tại `.agents/skills/build-webapp-skill/SKILL.md` và thư mục `.agents/skills/build-webapp-skill/references/`.
- **UX/UI Expert Skill**: Bắt buộc tuân thủ các quy chuẩn thiết kế UI/UX chuyên sâu tại `.agents/skills/ux-ui-agent-skills/README.md`.
- **Frontend Framework Rules**: Đọc kỹ quy tắc code React + Tailwind tại `.agents/skills/ux-ui-agent-skills/frameworks/react-tailwind.md`.
- **Component Guidelines**: Khi tạo component mới, phải check luật Atomic Design tại `.agents/skills/ux-ui-agent-skills/components/`.
- **E2E Auto-fix Loop**: Khi user yêu cầu fix E2E hoặc chạy auto-fix loop, đọc và tuân thủ `.agents/skills/e2e-autofix-loop/SKILL.md` (chỉ sửa application code, không sửa `e2e/specs/`, tối đa 5 vòng).
<!-- 💡 GHI CHÚ CHO BẠN: SAU MỖI LẦN FIX HOẶC CÀI THÊM SKILL MỚI LIÊN QUAN ĐẾN PROJECT (VÍ DỤ NHƯ SKILL TEST, SKILL BACKEND), BẠN CỨ GẠCH ĐẦU DÒNG VÀ GHI TIẾP VÀO KHU VỰC NÀY NHA -->

<!-- HARNESS:BEGIN -->
## Harness

This repo uses Harness. Before work, read (theo thứ bậc — xem `docs/product/README.md`):

- `README.md`
- `BRD/README.md` — full business specification (FR, flows, screens); **không thay** `docs/product/*` cho phạm vi frontend đã discovery
- `docs/product/product-scope.md` — product definition (authoritative cho scope frontend)
- `docs/product/module-scope.md` — modules, routes, gaps
- `docs/product/README.md` — index living contracts
- `docs/FRONTEND_MASTER_PLAN.md` — development phases, stories, E2E
- `docs/stories/backlog.md` (active epics and stories)
- `docs/UI_GUIDE.md` (bắt buộc trước khi generate/sửa giao diện)
- `docs/HARNESS.md`
- `docs/FEATURE_INTAKE.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTEXT_RULES.md` — đọc gì theo phase/lane (không cần đọc hết `/docs` mỗi lần)
- `docs/TOOL_REGISTRY.md`
- `scripts/bin/harness-cli query matrix` on macOS/Linux, or `.\scripts\bin\harness-cli.exe query matrix` on Windows

Use the Rust Harness CLI at `scripts/bin/harness-cli` on macOS/Linux or
`scripts/bin/harness-cli.exe` on Windows as the main operational tool. Before a
step that could use an external tool, run `scripts/bin/harness-cli query tools
--capability <name> --status present` to see what is equipped; an absent
capability is a clean skip.
<!-- HARNESS:END -->

## Development Workflow (Bắt buộc)

Trước khi bắt đầu bất kỳ task nào, Agent phải:

1. Đọc tài liệu **liên quan** trong `/docs` theo `docs/CONTEXT_RULES.md` (Intake + Planning) — gồm `docs/product/*`, story packet nếu có, và `docs/FRONTEND_MASTER_PLAN.md` khi làm theo phase.
2. Đối chiếu **Documentation** (`/docs`) · **Development Plan** (`FRONTEND_MASTER_PLAN.md`) · **Source code** hiện tại.
3. Nếu tài liệu, kế hoạch và code **chưa đồng bộ** → báo cáo trước khi triển khai; không tự ý bỏ qua.
4. Chỉ triển khai đúng **phạm vi Phase hoặc Task** người dùng yêu cầu (WIP=1); không tự mở rộng sang phase/task khác.
5. Sau khi xong: đối chiếu lại docs · plan · code; chỉ đánh dấu hoàn thành khi yêu cầu trong tài liệu/plan đã **triển khai và xác minh** (build/test/E2E theo story nếu có).

### Khi người dùng yêu cầu "tiếp tục", "làm tiếp", "update Phase", "triển khai Phase"

Không giả định trạng thái dự án. Bắt buộc:

- Đọc lại `docs/product/product-scope.md`, contract domain liên quan, và `docs/FRONTEND_MASTER_PLAN.md` (phase được yêu cầu).
- Kiểm tra source code và story/backlog cho phase đó.
- Xác định task **đã xong** vs **còn thiếu**; chỉ làm phần còn thiếu hoặc cần cập nhật.
- Nếu thay đổi trong `/docs` ảnh hưởng phase đang làm → báo cáo và đề xuất cập nhật plan **trước** khi code tiếp.

## UI Generation Guardrails

**Đọc `docs/UI_GUIDE.md` trước khi generate hoặc sửa giao diện.**

### Monochrome Design System (bắt buộc)

Giao diện **luôn dark mode**, dùng **bright black** surfaces + **White / Gray / satin silver** cho UI cấu trúc. Không có light mode / theme toggle.

| Phạm vi | Quy tắc |
|---------|---------|
| Background, Sidebar, Header, Card, Modal, Button, Input, Table, Tabs, Typography, Border, Shadow, Icon, Hover/Focus/Active | Monochrome + satin silver frames (`frame-satin`); **data tables** = `Table` from `@/components/ui/table` (glass shell như Pipeline) |
| Success / Error / Warning / Info | Giữ semantic colors (green/red/orange/blue) |
| Toast, Alert, validation errors, progress, charts, status badges | Giữ semantic colors |

Tokens: `src/styles/colors.css`, `src/index.css`. Surface layers: `surface-base` → `surface-elevated`. Primitives: `src/components/ui`.

**UI freeze — login / sign-up (shared templates):** `/login`, `/register`, and marketing `AuthModal` are the **only** auth entry UIs for the whole product (`AuthCard` + forms; split-panel modal). Every module that needs sign-in/sign-up must reuse them (redirect or open modal) — never ship a feature-local login/register screen. Do not redesign unless decision [`docs/decisions/0009-auth-login-signup-ui-freeze.md`](docs/decisions/0009-auth-login-signup-ui-freeze.md) is superseded. See `docs/product/auth-profile.md`.

### Code conventions

- Prefer components from `src/components/ui` first.
- Reuse utility function `cn()` from `src/lib/utils`.
- Use `.btn-primary`, `.btn-secondary`, `.btn-ghost` utility classes when appropriate.
- Keep styling in Tailwind gray scale and CSS variables — no hardcoded brand hex.
- Prefer `react-hook-form` + `zod` for forms.
- Prefer `@tanstack/react-query` for async server state.
- **Max 250 lines per UI file** (`*.tsx` under `src/features/`, `src/layouts/`, `src/components/ui/`). Split into subcomponents when larger. Verify: `npm run check:ui-size`.
- **Bilingual vi/en (bắt buộc)** — mọi text hiển thị cho user phải qua `useLanguage().t('key')`; mỗi key phải có cả `vi` và `en` trong `src/features/<feature>/languages/translations.ts` (hoặc `src/layouts/languages/translations.ts`). Verify: `npm run check:i18n`.

### Visible UI verification (bắt buộc khi gen/sửa giao diện)

Khi generate hoặc sửa UI, agent **phải** cho user thấy thao tác trên màn hình — không chỉ sửa code rồi báo xong.

1. **Mở Cursor Browser** (pane docked trong Agents Window) trước khi verify; `npm run dev` nếu chưa chạy.
2. **Navigate + tương tác trực tiếp** trên trang đang làm: click, scroll, điền form, đổi viewport (375 / 768 / desktop).
3. **Screenshot sau mỗi milestone** (load trang, sau thay đổi layout, sau interaction chính) — đính kèm trong chat.
4. **Mô tả ngắn** từng bước đang làm (vd: "đang mở /login", "đang click nút Submit").
5. Không kết luận "UI xong" nếu chưa mở browser và verify flow chính.

Chi tiết: `.cursor/rules/ui-visible-browser.mdc`

