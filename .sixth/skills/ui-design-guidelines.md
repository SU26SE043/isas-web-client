# UI/UX Design Guidelines - ISAS Recruitment Platform

## 1. Typography System (Hệ thống Typography)

### Font Family
- **Tiêu đề (Headings)**: Be Vietnam Pro - Extra Bold (800)
- **Nội dung thường (Body Text)**: Be Vietnam Pro - Regular (400)

### Language Support
- **Luôn hỗ trợ 2 ngôn ngữ**: Tiếng Việt và Tiếng Anh
- **Cấu trúc**: Mỗi text element phải có cả 2 version
- **Ví dụ**: 
  ```
  VN: "Chỉnh sửa thông tin"
  EN: "Edit Profile"
  ```

## 2. Layout & Responsive Design

### Screen Resolution
- **Target Resolution**: 1026 x 237 (primary)
- **Responsive Breakpoints**: 
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px  
  - Desktop: 1024px+

### Layout Distribution
- **Phân bố đều màn hình**: Sử dụng CSS Grid/Flexbox
- **Spacing System**: 8px base unit (8, 16, 24, 32, 48, 64px)
- **Container Max Width**: 1200px với padding 24px

## 3. Color System - Minimalist Pine & Milk Theme

### Primary Colors
```css
:root {
  /* Main Colors */
  --color-pine: #02462E;        /* Pine Green - Nền/chữ nhấn mạnh */
  --color-milk: #FEC700;        /* Milk Yellow - Background/accent */
  
  /* Neutrals */
  --color-black: #000000;       /* Đen - Chữ chính */
  --color-white: #FFFFFF;       /* Trắng - Nền chính */
}
```

### Color Usage Rules

#### Background Applications
- **Body Background**: Trắng (#FFFFFF) - Tạo không gian sạch, tối giản.
- **Cards/Sections**: Đan xen giữa nền Trắng, nền Pine (#02462E), hoặc nền Milk (#FEC700).
- **Header**: Nền Milk (#FEC700).
- **Footer**: Nền Đen (#000000).

#### Text Color Combinations
- **Trên nền Trắng**: Chữ Đen (#000000) hoặc Pine (#02462E) cho tiêu đề.
- **Trên nền Pine**: Chữ Trắng (#FFFFFF) hoặc Milk (#FEC700).
- **Trên nền Milk**: Chữ Đen (#000000) hoặc Pine (#02462E).
- **Trên nền Đen**: Chữ Trắng (#FFFFFF) và Milk (#FEC700).

#### Button/CTA Colors
- **Primary Button**: Nền Pine + Chữ Trắng.
- **Secondary Button**: Nền Trắng + Border Trắng + Chữ Pine.
- **Accent Button**: Nền Milk + Chữ Pine.

## 4. Component Design Patterns

### Cards & Containers
```css
.card-pine {
  background: var(--color-pine);
  color: var(--color-white);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(2, 70, 46, 0.15);
}

.card-milk {
  background: var(--color-milk);
  color: var(--color-pine);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(254, 199, 0, 0.15);
}
```

### Typography Classes
```css
.heading-primary {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 800; /* Extra Bold */
  color: var(--color-pine);
}

.body-text {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400; /* Regular */
  color: var(--color-black);
  line-height: 1.6;
}
```

## 5. Accessibility Guidelines (WCAG Compliance)

### Color Contrast Requirements
- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Verified Combinations**:
  - Pine (#02462E) on White (#FFFFFF) ✅
  - Black (#000000) on Milk (#FEC700) ✅
  - White (#FFFFFF) on Pine (#02462E) ✅
  - Milk (#FEC700) on Black (#000000) ✅

### Interactive Elements
- **Focus States**: 2px solid Milk (#FEC700) outline
- **Hover States**: Sử dụng hover color mix 10% opacity, thay đổi bg/text.
- **Active States**: Transform `scale-95`.

## 6. Layout Structure Examples

### Header Navigation
```
Background: Milk (#FEC700)
Text: Black (#000000)
CTA Button: White background + Pine text
```

### Hero Section
```
Background: White (#FFFFFF) to subtle Pine gradient
Title: Pine (#02462E) - Extra Bold
Subtitle: Black/70% - Regular
```

### Features Section
```
Background: White (#FFFFFF)
Card Background: Pine (#02462E)
Accent Elements/Icons: Milk (#FEC700)
```

### Employer Section
```
Background: Pine (#02462E)
Title: White (#FFFFFF)
CTA Button: Milk background + Pine text
```

### Footer
```
Background: Black (#000000)
Headings: Milk (#FEC700)
Links: White (#FFFFFF)
```

## 7. Implementation Notes

### CSS Custom Properties
Always use CSS custom properties for colors to ensure consistency and easy theme switching.

### Component Naming
- Use Tailwind utility classes whenever possible.
- Cho các lớp sử dụng chung (như buttons), sử dụng `.btn-primary`, `.btn-secondary`, `.btn-accent` định nghĩa trong `index.css`.

### Responsive Images
- Use `object-fit: cover` for hero images
- Implement lazy loading for performance
- Provide alt text in both languages

### Animation Guidelines
- Use subtle transitions (300ms ease-in-out)
- Respect `prefers-reduced-motion` for accessibility
- Focus on micro-interactions for better UX

## 8. Brand Personality

### Visual Style
- **Minimalist**: Clean, high-contrast, modern
- **Recruitment Focus**: Professional, clear, engaging
- **Target Audience**: HR professionals, job seekers, employers

### Tone of Voice
- **Vietnamese**: Chuyên nghiệp, thân thiện, đáng tin cậy
- **English**: Professional, approachable, confident

This design system ensures a cohesive, accessible, and visually appealing interface that reflects the Minimalist Pine & Milk aesthetic while maintaining professional standards for a recruitment platform.