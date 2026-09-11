import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type StatTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

/** Tone chỉ tô GIÁ TRỊ + icon (UI monochrome: nền/viền thẻ không đổi theo trạng thái). Literal để Tailwind bắt class. */
const VALUE_TONE: Record<StatTone, string> = {
  neutral: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Dòng phụ dưới giá trị (đơn vị, ghi chú, so sánh). */
  hint?: ReactNode;
  /** Icon nhỏ (size-4) góc phải trên. */
  icon?: ReactNode;
  tone?: StatTone;
  /** `sm` cho lưới 5–6 ô (bảng kết quả), `md` cho dashboard. */
  size?: 'sm' | 'md';
  /** Có → thẻ là <Link> tới trang chi tiết, kèm mũi tên. */
  to?: string;
  /** Slot góc phải trên thay cho icon (vd. badge trạng thái). */
  aside?: ReactNode;
  /** Tooltip native cho nhãn (khi nhãn cần giải thích thêm). */
  title?: string;
  className?: string;
}

/**
 * Thẻ số liệu dùng chung cho mọi vai (candidate · employer · admin). Trước đây có 9 bản cài riêng
 * (EmployerMetricCard, AdminMetricCard, PracticeHistoryStatCard, MetricCard cục bộ…) với padding/cỡ chữ/tone
 * khác nhau ⇒ cùng một loại thông tin trông khác nhau giữa các trang. Pattern này KHÔNG gọi useLanguage —
 * nhận chuỗi đã dịch — để dùng được cả trong test mock `useLanguage` chỉ có `t`.
 */
export function StatCard({ label, value, hint, icon, tone = 'neutral', size = 'md', to, aside, title, className }: StatCardProps) {
  const rootClass = cn(
    'block min-w-0 rounded-xl bg-surface-raised',
    size === 'sm' ? 'p-3' : 'p-4',
    to ? 'frame-satin-interactive focus-ring group' : 'frame-satin',
    className,
  );
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs text-muted-foreground" title={title}>
          {label}
        </p>
        {aside ?? (
          <span className={cn('flex shrink-0 items-center gap-1 [&>svg]:size-4', VALUE_TONE[tone])}>
            {icon}
            {to ? (
              <ArrowUpRight
                className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            ) : null}
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-2 break-words font-semibold tabular-nums tracking-tight',
          size === 'sm' ? 'text-xl' : 'text-2xl',
          VALUE_TONE[tone],
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );
  return to ? (
    <Link to={to} className={rootClass}>
      {body}
    </Link>
  ) : (
    <div className={rootClass}>{body}</div>
  );
}

export type StatGridColumns = 2 | 3 | 4 | 5 | 6;

/** 2 cột từ 375px (ô ~165px đủ cho giá trị ngắn); mở rộng theo breakpoint. Literal để Tailwind bắt class. */
const COLS: Record<StatGridColumns, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
};

export function StatGrid({ columns = 4, className, children }: { columns?: StatGridColumns; className?: string; children: ReactNode }) {
  return <div className={cn('grid gap-3', COLS[columns], className)}>{children}</div>;
}

export function StatGridSkeleton({ columns = 4, count = columns, size = 'md' }: { columns?: StatGridColumns; count?: number; size?: 'sm' | 'md' }) {
  return (
    <StatGrid columns={columns}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn('animate-pulse rounded-xl border border-satin bg-surface-overlay', size === 'sm' ? 'h-[76px]' : 'h-[88px]')} />
      ))}
    </StatGrid>
  );
}
