import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: ReactNode;
  /** Nhãn nhóm phía trên tiêu đề (tên khu vực) — KHÔNG BAO GIỜ là mã màn hình spec (EMP-CAM-01, F-NOTIF-003…). */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Nút hành động chính của trang; xếp phải ở ≥lg, xuống dưới ở mobile. */
  actions?: ReactNode;
  backLink?: { to: string; label: string };
  className?: string;
}

/**
 * Đầu trang dùng chung cho mọi trang trong app (candidate · employer · admin). Trước đây mỗi trang tự dựng
 * header với cỡ h1 (2xl…4xl), eyebrow (text-label / uppercase / dấu chấm), ô icon size-11 (billing) khác nhau.
 * Không gọi useLanguage — nhận chuỗi đã dịch — để dùng được trong test mock `useLanguage` chỉ có `t`.
 * Header THỰC THỂ (campaign, kết quả ứng viên, roadmap) giữ component riêng.
 */
export function PageHeader({ title, eyebrow, description, actions, backLink, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0 space-y-1.5">
        {backLink ? (
          <Link to={backLink.to} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-ring">
            <ArrowLeft className="size-4" aria-hidden />
            {backLink.label}
          </Link>
        ) : null}
        {eyebrow ? <p className="text-label text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="heading-primary text-2xl wrap-anywhere sm:text-3xl">{title}</h1>
        {description ? <p className="body-text max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
    </header>
  );
}
