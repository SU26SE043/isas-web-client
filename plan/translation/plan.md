# Translation Plan

## Mục tiêu

Thiết kế hệ thống chuyển ngữ dễ mở rộng cho toàn project, nhưng nội dung dịch của từng feature phải nằm gần feature đó để dễ quản lý, review và giao việc cho AI/codegen.

Project hiện hỗ trợ:

- `vi`: Tiếng Việt
- `en`: English

## Kiến trúc hiện tại

Shared languages chỉ phụ trách logic dùng chung:

- `src/shared/languages/LanguageProvider.tsx`: quản lý state ngôn ngữ, lưu vào `localStorage`, set `document.documentElement.lang`.
- `src/shared/languages/useLanguage.ts`: hook dùng trong component để lấy `language`, `setLanguage`, `t`.
- `src/shared/languages/types.ts`: type chung `Language`, `TranslationDictionary`, `TranslationMap`.
- `src/shared/languages/mergeTranslations.ts`: helper merge nhiều dictionary và lấy text theo key.
- `src/shared/languages/translations.ts`: file tổng hợp dictionary từ layouts và các feature.
- `src/shared/languages/index.ts`: public exports cho toàn app.

Nội dung dịch nằm theo từng khu vực:

- `src/layouts/languages/translations.ts`: text của app shell như header, footer, nút đổi ngôn ngữ.
- `src/features/home/languages/translations.ts`: text của home page.
- `src/features/auth/languages/translations.ts`: text của auth modal.
- `src/features/cv-analysis/languages/translations.ts`: text của CV analysis/result flow.

## Quy ước khi thêm translation

1. Không thêm text feature trực tiếp vào `src/shared/languages`.
2. Feature nào sở hữu UI nào thì text của UI đó nằm trong `src/features/<feature>/languages/translations.ts`.
3. Text dùng chung cho layout/chrome app nằm trong `src/layouts/languages/translations.ts`.
4. Nếu tạo feature mới, tạo file:

```text
src/features/<feature-name>/languages/translations.ts
```

5. Export dictionary theo format:

```ts
import type { TranslationDictionary } from '../../../shared/languages';

export const featureNameTranslations: TranslationDictionary = {
  vi: {
    'featureName.someKey': 'Nội dung tiếng Việt',
  },
  en: {
    'featureName.someKey': 'English content',
  },
};
```

6. Sau khi tạo dictionary mới, đăng ký vào:

```text
src/shared/languages/translations.ts
```

Ví dụ:

```ts
import { featureNameTranslations } from '../../features/feature-name/languages/translations';

export const translations = mergeTranslations(
  layoutTranslations,
  homeTranslations,
  authTranslations,
  cvAnalysisTranslations,
  featureNameTranslations
);
```

## Quy ước đặt key

Key nên có prefix theo khu vực sở hữu:

- `nav.*`, `footer.*`, `language.*`: layout/app shell.
- `hero.*`, `features.*`, `employer.*`: home page hiện tại.
- `auth.*`: auth feature.
- `cv.*`, `result.*`: CV analysis feature.

Với feature mới, dùng prefix rõ ràng theo tên feature hoặc flow:

```text
jobSearch.title
jobSearch.emptyState
jobSearch.filter.remoteOnly
```

Không dùng key quá chung như:

```text
title
description
button
submit
```

## Cách dùng trong component

Import hook từ shared:

```ts
import { useLanguage } from '../../../shared/languages';
```

Sau đó dùng:

```tsx
const { t } = useLanguage();

return <h1>{t('auth.signInTitle')}</h1>;
```

Với component ở `layouts`, path thường là:

```ts
import { useLanguage } from '../shared/languages';
```

## Cách đổi ngôn ngữ

UI đổi ngôn ngữ hiện nằm ở:

```text
src/layouts/LanguageToggle.tsx
```

Component dùng:

```ts
const { language, setLanguage, t } = useLanguage();
```

Khi gọi `setLanguage('vi')` hoặc `setLanguage('en')`, provider sẽ:

- cập nhật UI ngay lập tức,
- lưu `language` vào `localStorage`,
- cập nhật `document.documentElement.lang`.

## Flow cho AI khi thêm translation vào một feature

Khi được yêu cầu thêm hoặc sửa flow có text hiển thị, AI cần làm theo thứ tự:

1. Xác định feature sở hữu UI.
2. Mở file dictionary của feature:

```text
src/features/<feature>/languages/translations.ts
```

3. Nếu feature chưa có dictionary, tạo folder/file `languages/translations.ts`.
4. Thêm đầy đủ key cho cả `vi` và `en`.
5. Nếu dictionary mới, import và merge vào `src/shared/languages/translations.ts`.
6. Trong component, thay hard-code text bằng `t('key.name')`.
7. Không để sót placeholder, aria-label, title, button text, empty state, validation message.
8. Chạy kiểm tra:

```bash
npm run build
rg -n "text cần kiểm tra|chuỗi hard-code" src
```

## Checklist review

Trước khi kết thúc task translation, kiểm tra:

- Component import `useLanguage` từ `shared/languages`, không import từ feature khác.
- Shared không chứa nội dung dịch chi tiết của feature.
- Mỗi key có đủ `vi` và `en`.
- Không còn text hard-code mới trong component.
- Không còn đường dẫn cũ `src/languages/LanguageContext`.
- `npm run build` pass.

## Ghi chú bảo trì

Hiện tại `t(key)` fallback về chính `key` nếu thiếu translation. Điều này giúp UI không crash, nhưng khi review cần tìm các key lộ ra màn hình để bổ sung dictionary.

Nếu sau này app lớn hơn, có thể nâng cấp thêm:

- type-safe translation keys,
- lazy load dictionary theo route,
- namespace theo feature,
- test tự động báo key thiếu giữa `vi` và `en`.
