import type { ReactNode } from 'react';

interface EngagementPageShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function EngagementPageShell({ eyebrow, title, description, actions, children }: EngagementPageShellProps) {
  return (
    <div className="min-h-full bg-surface-page">
      <div className="app-page space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {eyebrow ? <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p> : null}
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
