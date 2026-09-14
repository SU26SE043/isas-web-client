import type { ReactNode } from 'react';
import { PageHeader } from '@/components/patterns/PageHeader';

interface EngagementPageShellProps {
  /** Nhãn nhóm — không phải mã màn hình spec. */
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Wrapper mỏng: .app-page + PageHeader dùng chung; 5 trang engagement không phải tự dựng đầu trang. */
export function EngagementPageShell({ eyebrow, title, description, actions, children }: EngagementPageShellProps) {
  return (
    <div className="min-h-full bg-surface-page">
      <div className="app-page space-y-8">
        <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
        {children}
      </div>
    </div>
  );
}
