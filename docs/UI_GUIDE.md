# UI Guide — Premium Dark Monochrome Design System

**Bắt buộc đọc file này trước khi generate hoặc chỉnh sửa giao diện.**

> Không có `SPEC.md` riêng trong repo — file này là source of truth cho UI.

## Nguyên tắc

- **Dark mode only** — không light mode, không theme switcher
- **Monochrome** — White, Black, Gray + **satin silver** cho khung (structural chrome)
- **Bright black base** — nền page không dùng pure `#000`; dùng charcoal sáng (#141416)
- **Satin silver frames** — mọi table/card/panel/input dùng viền brushed aluminum (low contrast), **không** glossy chrome, **không** accent hue
- **Depth** qua surface layers + glass + satin edge highlight
- **Inspiration:** Linear, Vercel Dashboard, GitHub Dark, Stripe (spacing/hierarchy) + industrial satin metal edges
- **Semantic colors** chỉ cho trạng thái (success/error/warning/info)

## Surface elevation (bright black)

| Token / Class | Hex | Dùng cho |
|---------------|-----|----------|
| `surface-base` / `bg-surface-base` | `#141416` | Page background (bright black) |
| `surface-sunken` | `#101012` | Sidebar base |
| `surface-raised` | `#1c1c20` | Cards, panels |
| `surface-overlay` | `#222228` | Inputs, hover, nested |
| `surface-elevated` | `#2a2a30` | Modals, dropdowns, active nav |
| `surface-highlight` | `#34343c` | Strong hover |
| `glass-panel` | glass + satin edge | Elevated glass cards |
| `glass-sidebar` | sunken + blur | Dashboard sidebars |
| `glass-topbar` | base + blur | Sticky engagement / top chrome |

Không flat pure black cho page chrome. Auth frozen surfaces vẫn inherit token — **không** đổi layout auth (decision 0009).

## Satin silver borders (bắt buộc cho khung)

Viền mặc định toàn project: **thin satin silver**, soft brushed aluminum, subtle metallic reflection, elegant silver glow, **not glossy chrome**.

| Token / Class | Vai trò |
|---------------|---------|
| `--satin-border` / `border-satin` | Màu viền mặc định |
| `--satin-inset` | Highlight mép trên + depth dưới |
| `--satin-glow` | Quầng bạc rất nhẹ (1px), low contrast |
| `--satin-reflection` | Gradient kim loại cho `frame-satin-metallic` |
| `.frame-satin` | **Default** cho card, panel, table frame |
| `.frame-satin-soft` | Nested chips / icon wells |
| `.frame-satin-interactive` | Ô chọn / tile có hover |
| `.frame-satin-metallic` | Khung cần reflection wash rõ hơn |

### Quy tắc

1. Table, Card, SectionPanel, Dialog, Input, dropzone, wizard option → dùng `frame-satin` / `border-satin` (hoặc token `--satin-*`), **không** hardcode `border-white/10` mới.
2. Không dùng purple/blue/ice edge cho UI cấu trúc.
3. Semantic border (error/success) vẫn dùng màu semantic.

Tokens nằm ở `src/styles/colors.css`. Utilities ở `src/index.css`.

## Borders (legacy alias)

| Class | Maps to |
|-------|---------|
| `border-subtle` | soft silver alpha |
| `border-default` | default satin alpha |
| `--border-focus` | stronger silver focus |

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
| Header | `h-16`, glass-topbar + satin edge |
| Sidebar | `glass-sidebar`, active `bg-surface-elevated` |
| Card | `frame-satin` + `Card` primitive |
| Table | container `frame-satin rounded-2xl` |
| **SectionPanel** | Glass section shell — **default** for wizard/setup sections |
| **SelectionOption** | Satin selectable tile — **default** for choice grids |
| Modal | Dialog + `border-satin` |
| Input | `border-satin` + satin inset |
| Primary button | `btn-primary` (white bg, black text) |
| Secondary button | `btn-secondary` (satin outline) |
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
6. Mọi khung mới phải dùng **satin silver** (`frame-satin` / tokens), không invent border glow khác.

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

- Practice wizard, roadmap wizard, CV analysis sections, tables, cards, và mọi màn chọn/cấu hình mới
- **Không** áp dụng redesign layout cho auth frozen surfaces (decision 0009) — token nền/viền vẫn inherit
- **Không** thay chart / interview room chrome bằng `SelectionOption`

## Semantic colors (NGOẠI LỆ)

Giữ nguyên cho: toast, alert, validation, progress, charts, status badges, recording indicator, Google OAuth logo.

## Files

| File | Vai trò |
|------|---------|
| `src/styles/colors.css` | Surface + satin silver tokens |
| `src/index.css` | Tailwind theme + `frame-satin*` utilities |
| `src/components/ui/*` | shadcn primitives + shared templates |
| `src/components/ui/section-panel.tsx` | Glass section / wizard shell |
| `src/components/ui/selection-option.tsx` | Selectable option tile |

## Frozen UI surfaces (không redesign) — template auth dùng chung

| Surface | Baseline | Decision |
|---------|----------|----------|
| Login `/login`, Sign up `/register` | `AuthCard` + `LoginForm` / `RegisterForm` | [`0009`](./decisions/0009-auth-login-signup-ui-freeze.md) |
| Marketing auth modal | Split-panel `AuthModal` + `AuthOverlay` | [`0009`](./decisions/0009-auth-login-signup-ui-freeze.md) |

Đây là **template xác thực dùng chung toàn hệ thống**. Mọi module/luồng cần đăng nhập hoặc đăng ký phải **reuse** các surface này (redirect `/login`·`/register`, hoặc mở `AuthModal`) — **cấm** thiết kế UI login/sign-up riêng trong từng feature.

Giữ mặc định hiện tại. Chỉ sửa copy/i18n, validation, API, a11y/security — **không** đổi layout/chrome trừ khi product mở lại decision 0009. Chi tiết: `docs/product/auth-profile.md`.

## Agent rules

1. Đọc file này trước khi sửa UI
2. Dùng `src/components/ui` — không tạo button/input mới; lựa chọn/section dùng `SelectionOption` + `SectionPanel`
3. Dùng surface + satin tokens — không hardcode hex / `border-white/*` mới cho khung
4. Không thêm màu accent vào layout; khung dùng `frame-satin` / `border-satin`
5. `cn()` từ `src/lib/utils`
6. Form: `react-hook-form` + `zod`
7. Data: `@tanstack/react-query`
8. **Giới hạn 250 dòng / file UI** — pages và components; tách file khi vượt ngưỡng
9. **Không redesign login / sign-up / auth modal** — và **không fork** UI auth theo module; luôn reuse template dùng chung (Frozen UI surfaces / decision 0009)
10. **Không fork style ô chọn / section glass** — luôn import từ `selection-option` / `section-panel`
11. **Bright black + satin silver** — nền `#141416` family; viền brushed aluminum low-contrast

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
