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

When generating UI in this frontend project:

- Prefer components from `src/components/ui` first.
- Reuse utility function `cn()` from `src/lib/utils`.
- Keep styling in Tailwind utility classes and existing design tokens.
- Prefer `react-hook-form` + `zod` for forms.
- Prefer `@tanstack/react-query` for async server state.

<!-- 💡 GHI CHÚ CHO BẠN: SAU NÀY NẾU CHỐT THÊM ĐƯỢC RULE MỚI KHI FIX GIAO DIỆN (Ví dụ: "Không được xài thẻ <div> bọc ngoài cùng mà phải xài Fragment", hay "Luôn phải handle state loading cho nút button"), BẠN HÃY GẠCH ĐẦU DÒNG VÀ CẬP NHẬT TRỰC TIẾP VÀO KHU VỰC NÀY ĐỂ AI NÓ NHỚ LUẬT MỚI -->