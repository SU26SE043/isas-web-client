import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WizardSectionProps {
  /** Bỏ trống khi phần thân đã tự mang tiêu đề (ví dụ một panel dùng chung). */
  title?: string;
  hint?: string;
  /** Vạch kẻ mảnh phía trên — dùng cho nhóm thứ 2 trở đi. */
  divided?: boolean;
  children: ReactNode;
}

/**
 * Một nhóm trường có TÊN và có LÝ DO. Là `@container` để lưới bên trong đo BỀ RỘNG CỦA
 * CHÍNH NÓ, không đo bề rộng màn hình: thẻ wizard = viewport − sidebar(256) − thanh
 * bước(220) − padding, nên `md:` (768px màn hình) rơi vào lúc thẻ mới rộng ~430px và ba
 * cột chỉ còn ~120px ⇒ nhãn xuống dòng, ba ô nhập nằm ba độ cao khác nhau.
 * Bản trước bước 1 là một form phẳng: hai tiêu đề
 * trần ("Thông tin chung" / "Lịch chiến dịch") không nói nhóm đó quyết định điều gì, và
 * hai trường vận hành quan trọng nhất bị nhét trong một khối `<details>` trông y hệt một
 * ô nhập đang bị khoá ⇒ gần như không ai mở ra.
 */
export function WizardSection({ title, hint, divided = false, children }: WizardSectionProps) {
  return (
    <section className={cn('@container space-y-3.5', divided && 'border-t border-satin pt-5')}>
      {title || hint ? (
        <div className="space-y-0.5">
          {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : null}
          {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
