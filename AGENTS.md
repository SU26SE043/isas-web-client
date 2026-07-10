# Agent Instructions

## Project Skills

Use `.codex/skills/harness-intake-griller/SKILL.md` when a request needs
discussion, feature intake, docs, or story shaping before Symphony execution.
The skill is project-scoped; do not use a global copy as the source of truth.

- **Build Web App Skill**: Bắt buộc tham khảo các quy chuẩn UI/UX, hướng dẫn chất lượng và cách nghiệm thu giao diện tại `.agents/skills/build-webapp-skill/SKILL.md` và thư mục `.agents/skills/build-webapp-skill/references/`.
- **UX/UI Expert Skill**: Bắt buộc tuân thủ các quy chuẩn thiết kế UI/UX chuyên sâu tại `.agents/skills/ux-ui-agent-skills/README.md`.
- **Frontend Framework Rules**: Đọc kỹ quy tắc code React + Tailwind tại `.agents/skills/ux-ui-agent-skills/frameworks/react-tailwind.md`.
- **Component Guidelines**: Khi tạo component mới, phải check luật Atomic Design tại `.agents/skills/ux-ui-agent-skills/components/`.
<!-- 💡 GHI CHÚ CHO BẠN: SAU MỖI LẦN FIX HOẶC CÀI THÊM SKILL MỚI LIÊN QUAN ĐẾN PROJECT (VÍ DỤ NHƯ SKILL TEST, SKILL BACKEND), BẠN CỨ GẠCH ĐẦU DÒNG VÀ GHI TIẾP VÀO KHU VỰC NÀY NHA -->

<!-- HARNESS:BEGIN -->
## Harness

This repo uses Harness. Before work, read:

- `README.md`
- `BRD/README.md` (full product spec — business source of truth)
- `docs/product/README.md` (frontend living contracts)
- `docs/stories/backlog.md` (active epics and stories)
- `docs/UI_GUIDE.md` (bắt buộc trước khi generate/sửa giao diện)
- `docs/HARNESS.md`
- `docs/FEATURE_INTAKE.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTEXT_RULES.md`
- `docs/TOOL_REGISTRY.md`
- `scripts/bin/harness-cli query matrix` on macOS/Linux, or `.\scripts\bin\harness-cli.exe query matrix` on Windows

Use the Rust Harness CLI at `scripts/bin/harness-cli` on macOS/Linux or
`scripts/bin/harness-cli.exe` on Windows as the main operational tool. Before a
step that could use an external tool, run `scripts/bin/harness-cli query tools
--capability <name> --status present` to see what is equipped; an absent
capability is a clean skip.
<!-- HARNESS:END -->

## UI Generation Guardrails

**Đọc `docs/UI_GUIDE.md` trước khi generate hoặc sửa giao diện.**

### Monochrome Design System (bắt buộc)

Giao diện **luôn dark mode**, chỉ dùng **White, Black, Gray** cho UI cấu trúc. Không có light mode / theme toggle.

| Phạm vi | Quy tắc |
|---------|---------|
| Background, Sidebar, Header, Card, Modal, Button, Input, Table, Tabs, Typography, Border, Shadow, Icon, Hover/Focus/Active | Chỉ monochrome |
| Success / Error / Warning / Info | Giữ semantic colors (green/red/orange/blue) |
| Toast, Alert, validation errors, progress, charts, status badges | Giữ semantic colors |

Tokens: `src/styles/colors.css`, `src/index.css`. Surface layers: `surface-base` → `surface-elevated`. Primitives: `src/components/ui`.

### Code conventions

- Prefer components from `src/components/ui` first.
- Reuse utility function `cn()` from `src/lib/utils`.
- Use `.btn-primary`, `.btn-secondary`, `.btn-ghost` utility classes when appropriate.
- Keep styling in Tailwind gray scale and CSS variables — no hardcoded brand hex.
- Prefer `react-hook-form` + `zod` for forms.
- Prefer `@tanstack/react-query` for async server state.
- **Max 250 lines per UI file** (`*.tsx` under `src/features/`, `src/layouts/`, `src/components/ui/`). Split into subcomponents when larger. Verify: `npm run check:ui-size`.
- **Bilingual vi/en (bắt buộc)** — mọi text hiển thị cho user phải qua `useLanguage().t('key')`; mỗi key phải có cả `vi` và `en` trong `src/features/<feature>/languages/translations.ts` (hoặc `src/layouts/languages/translations.ts`). Verify: `npm run check:i18n`.

<!-- 💡 GHI CHÚ CHO BẠN: SAU NÀY NẾU CHỐT THÊM ĐƯỢC RULE MỚI KHI FIX GIAO DIỆN (Ví dụ: "Không được xài thẻ <div> bọc ngoài cùng mà phải xài Fragment", hay "Luôn phải handle state loading cho nút button"), BẠN HÃY GẠCH ĐẦU DÒNG VÀ CẬP NHẬT TRỰC TIẾP VÀO KHU VỰC NÀY ĐỂ AI NÓ NHỚ LUẬT MỚI -->