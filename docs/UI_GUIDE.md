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
| `glass-table-container` / `GlassTableContainer` | specular edge glow + diagonal shine | **Preferred** wrapper for data tables |
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

## Typography & text tokens

| Class / Token | Dùng cho |
|-------|----------|
| `heading-primary` | Page title (font-semibold, tracking-tight) |
| `heading-secondary` | Section title |
| `body-text` | Paragraph (muted) |
| `text-label` | Uppercase label (xs, tracking-wide) |
| `text-caption` | Helper text |
| `--text-primary` / `text-text-primary` | Tiêu đề & nội dung chính (`#fafafa`) |
| `--text-secondary` / `text-text-secondary` | Phụ đề, mô tả, placeholder (`#a1a1aa`) |
| `--text-disabled` / `text-text-disabled` | Disabled control copy (`#52525b`) |

Base font size: **14px** (`text-sm`). Headings dùng negative letter-spacing.

## Action colors (Monochrome+ — không brand hue)

Primary CTA vẫn trắng trên đen. Dùng scale light / main / dark cho hover & pressed.

| Token / Class | Hex | Dùng |
|---------------|-----|------|
| `--primary-main` / `bg-primary-main` | `#ffffff` | Default CTA fill |
| `--primary-light` / `bg-primary-light` | `#f4f4f5` | Hover (soft near-white) |
| `--primary-dark` / `bg-primary-dark` | `#e4e4e7` | Active / pressed |
| `--secondary-main` / `text-secondary-main` | silver `#cfd6df` | Accent phụ / outline soft |

`btn-primary` map: default → main · hover → light · active → dark · disabled → `text-disabled` on overlay.

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
| Table | `Table` + `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` from `@/components/ui/table` (wraps `GlassTableContainer`) |
| **SectionPanel** | Glass section shell — **default** for wizard/setup sections |
| **SelectionOption** | Satin selectable tile — **default** for choice grids |
| Modal | `AppModal` (open/onClose + sizes) or `Dialog` / `ConfirmDialog` + `border-satin` |
| Input | `border-satin` + satin inset |
| Primary button | `btn-primary` (white bg, black text) |
| Secondary button | `btn-secondary` (satin outline) |
| Ghost button | `btn-ghost` |

## Data table template (bắt buộc)

**Khung chuẩn = Employer Pipeline table** (glass rounded shell, header chữ hoa trắng, divider mỏng, badge semantic, nút outline + primary trong cột thao tác).

Mọi **data table** dùng `@/components/ui/table` — **không** tự dựng `<table>` + `border-subtle` / Card frame ad-hoc.

| Template | File | Khi dùng |
|----------|------|----------|
| `Table` (+ Header/Body/Row/Head/Cell) | `src/components/ui/table.tsx` | Ranking, lịch sử, admin, billing, invitations… |
| `GlassTableContainer` | `src/components/ui/glass-table-container.tsx` | Đã nằm trong `Table`; chỉ dùng riêng khi layout đặc biệt |

### Quy tắc dùng table

1. Import `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` từ `@/components/ui/table`.
2. **Không** bọc thêm `Card` / `rounded-xl border` bên ngoài `Table` (tránh double frame).
3. Nested detail table → `<Table framed={false}>`.
4. Mobile: card/list riêng; desktop `hidden md:block` / `lg:block` khi cần.
5. Primary cell text: `className="font-medium text-foreground"` (hoặc `font-semibold`); secondary line: `text-xs text-muted-foreground`.
6. Status chỉ dùng badge semantic; không đổi chrome của khung glass.

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Hạng</TableHead>
      <TableHead>Ứng viên</TableHead>
      <TableHead className="text-right">Thao tác</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-semibold text-foreground">#1</TableCell>
      <TableCell>
        <p className="font-medium text-foreground">CND-1042</p>
        <p className="text-xs text-muted-foreground">Frontend · React</p>
      </TableCell>
      <TableCell className="text-right">…</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

> Không nhầm với `SelectionOption` (ô chọn domain/wizard). Selection list ≠ data table.
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

Mỗi semantic có **main** + **light** (hover) + **dark** (pressed) + **bg** (tint trên nền tối):

| Role | main | light | dark | bg |
|------|------|-------|------|-----|
| Success | `#22c55e` | `#4ade80` | `#16a34a` | 12% tint |
| Error | `#ef4444` | `#f87171` | `#dc2626` | 12% tint |
| Warning | `#f97316` | `#fb923c` | `#ea580c` | 12% tint |
| Info | `#3b82f6` | `#60a5fa` | `#2563eb` | 12% tint |

Tailwind: `text-success` / `text-success-light` / `bg-success-bg` (và tương tự error / warning / info).

## Chart / Data visualization colors

Charts được phép dùng hue (ngoại lệ monochrome). Token ở `src/styles/colors.css` · helper `src/shared/charts/chartColors.ts`.

### Categorical (7 màu · CVD-friendly)

Thứ tự tránh đỏ–xanh lá kề nhau cùng độ sáng: indigo → teal → amber → rose → cyan → violet → lime.

| Index | Token | HEX |
|-------|-------|-----|
| 0 | `--chart-cat-1` | `#818cf8` indigo |
| 1 | `--chart-cat-2` | `#2dd4bf` teal |
| 2 | `--chart-cat-3` | `#fbbf24` amber |
| 3 | `--chart-cat-4` | `#fb7185` rose |
| 4 | `--chart-cat-5` | `#22d3ee` cyan |
| 5 | `--chart-cat-6` | `#c084fc` violet |
| 6 | `--chart-cat-7` | `#a3e635` lime |

Dùng: `CHART_CATEGORICAL` / `chartCategoryColor(i)` / `CHART_CATEGORICAL_HEX` (canvas).

### Radar

| Token | Value |
|-------|--------|
| `--chart-radar-stroke` | indigo `#818cf8` (đậm, rõ) |
| `--chart-radar-fill` | `rgb(129 140 248 / 0.25)` (~25%) |
| `--chart-radar-target-stroke` | amber `#fbbf24` |
| `--chart-radar-target-fill` | `rgb(251 191 36 / 0.2)` (~20%) |

### Grid · Axis · Tooltip

| Token | HEX / value | Vai trò |
|-------|-------------|---------|
| `--chart-grid` | `#334155` | Gridlines (chìm) |
| `--chart-axis` | `#64748b` | Axis labels |
| `--chart-tooltip-bg` | `surface-elevated` | Tooltip nền |
| `--chart-tooltip-border` | `border-strong` | Viền tooltip |
| `--chart-tooltip-shadow` | `shadow-lg` | Đổ bóng nổi khối |

Recharts: `CHART_TOOLTIP_STYLE`, `CHART_GRID`, `CHART_RADAR`.

### Multi-step steppers (status)

Wizard / interview / CV flow steppers dùng `src/components/ui/flow-stepper.tsx`:

| Step status | Visual |
|-------------|--------|
| `complete` | Green marker + label (`text-success` / `bg-success-bg`) + check icon |
| `error` / failed | Red marker + label (`text-error` / `bg-error-bg`) + X icon |
| `processing` | Info blue + spinner (`text-info`) |
| `current` | Monochrome/info active step |
| `pending` | Muted satin / muted text |

Không invent brand hex — chỉ token semantic success/error/info.

## Files

| File | Vai trò |
|------|---------|
| `src/styles/colors.css` | Surface + satin silver + chart tokens |
| `src/shared/charts/chartColors.ts` | Categorical / radar / grid / tooltip helpers |
| `src/index.css` | Tailwind theme + `frame-satin*` utilities |
| `src/components/ui/glass-table-container.tsx` | Specular glass table wrapper |
| `src/components/ui/app-modal.tsx` | Shared modal facade (`open`/`onClose`, sizes incl. `auth`) |
| `src/components/ui/*` | shadcn primitives + shared templates |
| `src/components/ui/section-panel.tsx` | Glass section / wizard shell |
| `src/components/ui/selection-option.tsx` | Selectable option tile |

## Frozen UI surfaces (không redesign) — template auth dùng chung

| Surface | Baseline | Decision |
|---------|----------|----------|
| Login `/login`, Sign up `/register` | Redirect → homepage `AuthModal` (`SignInForm` / `SignUpForm`) | [`0009`](./decisions/0009-auth-login-signup-ui-freeze.md) |
| Marketing auth modal | Split-panel `AuthModal` + `AuthOverlay` trên `AppModal` size=`auth` | [`0009`](./decisions/0009-auth-login-signup-ui-freeze.md) |

**Modal chrome:** dùng `AppModal` (`src/components/ui/app-modal.tsx`) cho facade `open`/`onClose` + size (`sm`–`xl`, `auth`). Confirm / structured dialogs tiếp tục dùng `Dialog` + `ConfirmDialog`. Auth entry vẫn là `AuthModal` (freeze 0009) — không redesign panel slide.

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
