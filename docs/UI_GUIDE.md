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
| `surface-base` / `bg-surface-base` | `#070709` | Page background |
| `surface-sunken` | `#0a0a0c` | Sidebar base |
| `surface-raised` | `#121214` | Cards, panels |
| `surface-overlay` | `#1a1a1d` | Inputs, hover, nested |
| `surface-elevated` | `#222226` | Modals, dropdowns, active nav |
| `surface-highlight` | `#2c2c31` | Strong hover |
| `glass-panel` | white-alpha + blur | Elevated glass cards |
| `glass-sidebar` | sunken + blur | Dashboard sidebars |
| `glass-topbar` | base + blur | Sticky engagement / top chrome |

Depth ưu tiên **surface layers + glass**, không dùng màu accent trên layout.

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
| Card | `surface-raised rounded-xl` / shadcn `Card` |
| **SectionPanel** | Glass section shell — **default** for wizard/setup sections |
| **SelectionOption** | Glass selectable tile — **default** for choice grids |
| Modal | `bg-surface-elevated border-default shadow-lg` |
| Input | `bg-surface-overlay border-default rounded-lg text-sm` |
| Primary button | `btn-primary` (white bg, black text) |
| Secondary button | `btn-secondary` (outline) |
| Ghost button | `btn-ghost` |

## Section & selection templates (bắt buộc khi gen UI lựa chọn)

Hai primitive dùng chung toàn project — **không** dựng lại border/glass/ô chọn ad-hoc trong feature.

| Template | File | Khi dùng |
|----------|------|----------|
| `SectionPanel` | `src/components/ui/section-panel.tsx` | Khung section/wizard: header (icon tùy chọn + title + description), body, footer nav, optional footer hint, loading state |
| `SelectionOption` | `src/components/ui/selection-option.tsx` | Ô chọn trong lưới: icon tròn + title + description + chevron; state `selected` / hover / disabled |

### Quy tắc dùng

1. Multi-step setup, form section, pick-list → bọc bằng `SectionPanel`.
2. Lựa chọn domain / level / file / gói / … trong grid → `SelectionOption` (thường `grid gap-3 sm:grid-cols-2`).
3. Icon trên `SectionPanel`/`SelectionOption` chỉ monochrome (`currentColor` / lucide), **không** accent purple/blue.
4. Nav Quay lại / Tiếp theo nằm trong `footer` của `SectionPanel` (hoặc slot tương đương) — không sticky ngoài khung trừ khi layout fullscreen phòng phỏng vấn.
5. Feature wrapper cũ (ví dụ `PracticeWizardStepCard`, `PracticeWizardOptionCard`, `CvFlowSectionCard`) chỉ được **re-export / thin wrap** sang 2 template trên — không fork style.

### Ví dụ tối thiểu

```tsx
import { SectionPanel } from '@/components/ui/section-panel';
import { SelectionOption } from '@/components/ui/selection-option';

<SectionPanel icon={<Icon />} title={title} description={description} footer={nav}>
  <div className="grid gap-3 sm:grid-cols-2">
    {items.map((item) => (
      <SelectionOption
        key={item.id}
        title={item.title}
        description={item.description}
        icon={item.icon}
        selected={item.id === selectedId}
        onClick={() => onSelect(item.id)}
      />
    ))}
  </div>
</SectionPanel>
```

### Phạm vi áp dụng

- Practice wizard, roadmap wizard, CV analysis sections, và mọi màn chọn/cấu hình mới
- **Không** áp dụng cho auth frozen surfaces (decision 0009)
- **Không** thay chart / data table / interview room chrome bằng `SelectionOption`

## Semantic colors (NGOẠI LỆ)

Giữ nguyên cho: toast, alert, validation, progress, charts, status badges, recording indicator, Google OAuth logo.

## Files

| File | Vai trò |
|------|---------|
| `src/styles/colors.css` | CSS variables |
| `src/index.css` | Tailwind theme + utilities |
| `src/components/ui/*` | shadcn primitives + shared templates |
| `src/components/ui/section-panel.tsx` | Glass section / wizard shell |
| `src/components/ui/selection-option.tsx` | Selectable option tile |

## Frozen UI surfaces (không redesign)

| Surface | Baseline | Decision |
|---------|----------|----------|
| Login `/login`, Sign up `/register` | `AuthCard` + `LoginForm` / `RegisterForm` | [`0009`](./decisions/0009-auth-login-signup-ui-freeze.md) |
| Marketing auth modal | Split-panel `AuthModal` + `AuthOverlay` | [`0009`](./decisions/0009-auth-login-signup-ui-freeze.md) |

Giữ mặc định hiện tại. Chỉ sửa copy/i18n, validation, API, a11y/security — **không** đổi layout/chrome trừ khi product mở lại decision 0009. Chi tiết: `docs/product/auth-profile.md`.

## Agent rules

1. Đọc file này trước khi sửa UI
2. Dùng `src/components/ui` — không tạo button/input mới; lựa chọn/section dùng `SelectionOption` + `SectionPanel`
3. Dùng surface tokens — không hardcode hex
4. Không thêm màu accent vào layout
5. `cn()` từ `src/lib/utils`
6. Form: `react-hook-form` + `zod`
7. Data: `@tanstack/react-query`
8. **Giới hạn 250 dòng / file UI** — pages và components; tách file khi vượt ngưỡng
9. **Không redesign login / sign-up / auth modal** — xem Frozen UI surfaces ở trên
10. **Không fork style ô chọn / section glass** — luôn import từ `selection-option` / `section-panel`

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
