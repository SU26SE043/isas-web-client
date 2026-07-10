# UI Guide — Premium Dark Monochrome Design System

**Bắt buộc đọc file này trước khi generate hoặc chỉnh sửa giao diện.**

> Không có `SPEC.md` riêng trong repo — file này là source of truth cho UI.

## Nguyên tắc

- **Dark mode only** — không light mode, không theme switcher
- **Monochrome** — White, Black, Gray cho UI cấu trúc
- **Depth qua surface layers** — không dùng màu accent, không flat pure black
- **Inspiration:** Linear, Vercel Dashboard, GitHub Dark, Stripe Dashboard (spacing/hierarchy only)
- **Semantic colors** chỉ cho trạng thái (success/error/warning/info)

## Surface elevation (depth)

| Token / Class | Hex | Dùng cho |
|---------------|-----|----------|
| `surface-base` / `bg-surface-base` | `#09090b` | Page background |
| `surface-sunken` | `#0c0c0e` | Sidebar, footer |
| `surface-raised` | `#141416` | Cards, panels |
| `surface-overlay` | `#1c1c1f` | Inputs, hover, nested |
| `surface-elevated` | `#232326` | Modals, dropdowns, active nav |
| `surface-highlight` | `#2a2a2e` | Strong hover |

## Borders (white alpha)

| Class | Opacity |
|-------|---------|
| `border-subtle` | 6% |
| `border-default` | 10% |
| `--border-focus` | 24% (focus ring) |

## Typography

| Class | Dùng cho |
|-------|----------|
| `heading-primary` | Page title (font-semibold, tracking-tight) |
| `heading-secondary` | Section title |
| `body-text` | Paragraph (muted) |
| `text-label` | Uppercase label (xs, tracking-wide) |
| `text-caption` | Helper text |

Base font size: **14px** (`text-sm`). Headings dùng negative letter-spacing.

## Layout utilities

| Class | Mô tả |
|-------|--------|
| `page-container` | max-w-7xl, responsive padding |
| `page-section` | Vertical section padding |
| `dashboard-content` | Dashboard main area padding |

## Components

| Component | Pattern |
|-----------|---------|
| Header | `h-16`, `bg-surface-base/80 backdrop-blur-xl border-subtle` |
| Sidebar | `bg-surface-sunken border-subtle`, active `bg-surface-elevated` |
| Card | `surface-raised rounded-xl` |
| Modal | `bg-surface-elevated border-default shadow-lg` |
| Input | `bg-surface-overlay border-default rounded-lg text-sm` |
| Primary button | `btn-primary` (white bg, black text) |
| Secondary button | `btn-secondary` (outline) |
| Ghost button | `btn-ghost` |

## Semantic colors (NGOẠI LỆ)

Giữ nguyên cho: toast, alert, validation, progress, charts, status badges, recording indicator, Google OAuth logo.

## Files

| File | Vai trò |
|------|---------|
| `src/styles/colors.css` | CSS variables |
| `src/index.css` | Tailwind theme + utilities |
| `src/components/ui/*` | shadcn primitives |

## Agent rules

1. Đọc file này trước khi sửa UI
2. Dùng `src/components/ui` — không tạo button/input mới
3. Dùng surface tokens — không hardcode hex
4. Không thêm màu accent vào layout
5. `cn()` từ `src/lib/utils`
6. Form: `react-hook-form` + `zod`
7. Data: `@tanstack/react-query`
8. **Giới hạn 250 dòng / file UI** — pages và components; tách file khi vượt ngưỡng

## File size (bắt buộc)

| Phạm vi | Giới hạn |
|---------|----------|
| `src/features/**/*.tsx` | ≤ 250 dòng |
| `src/layouts/**/*.tsx` | ≤ 250 dòng |
| `src/components/ui/**/*.tsx` | ≤ 250 dòng |

**Không áp dụng:** `*.test.tsx`, `*.types.ts`, `translations.ts`, hooks/services.

Khi page > 250 dòng: tách thành `components/<feature>/` + `hooks/` + page mỏng điều phối.

Kiểm tra: `npm run check:ui-size`

## Internationalization (bắt buộc)

Mọi page/component mới phải hỗ trợ **tiếng Việt và tiếng Anh**.

| Quy tắc | Chi tiết |
|---------|----------|
| Hook | `const { t, language } = useLanguage()` từ `src/shared/languages` |
| Text UI | Luôn dùng `t('feature.section.key')` — không hardcode chuỗi hiển thị |
| File dịch | `src/features/<feature>/languages/translations.ts` hoặc `src/layouts/languages/translations.ts` |
| Cấu trúc | Export `TranslationDictionary` với cả `vi` và `en` |
| Đăng ký | Feature mới: import vào `src/shared/languages/translations.ts` |
| Vai trò | Dùng `t(getRoleTranslationKey(role))` — không hardcode tên role |
| Ngày/giờ | `toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', ...)` |

Kiểm tra parity key vi/en: `npm run check:i18n`
