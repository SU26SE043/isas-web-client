import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShell({ header, sidebar, children, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen surface-base', className)}>
      {header}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {sidebar}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
