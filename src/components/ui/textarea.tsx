import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Ô nhập nhiều dòng dùng chung. Trước đây bộ primitive KHÔNG có nó, nên mỗi màn cần một
 * textarea lại chép nguyên chuỗi class của `Input` rồi sửa vài chỗ — hệ quả nhìn thấy được:
 * textarea ở bảng tiêu chí dùng `rounded-lg` trong khi `Input` cạnh nó dùng `rounded-xl`,
 * hai ô cạnh nhau khác bo góc. Sửa `Input` không kéo theo các bản chép đó.
 *
 * Bo góc theo VAI TRÒ "control" (12px) — giống `Input`, `Button`. Xem `docs/UI_GUIDE.md`.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'w-full min-w-0 resize-y rounded-lg border border-satin bg-surface-overlay/80 px-3 py-2 text-base leading-relaxed shadow-[var(--satin-inset)] transition-[border-color,box-shadow,background-color] duration-200 ease-out outline-none placeholder:text-muted-foreground focus-visible:border-[var(--border-focus)] focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--isas-silver-100)_22%,transparent)] disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
