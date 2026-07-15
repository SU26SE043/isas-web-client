import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PipelineStatus } from '../types/employerAnalytics.types';

const statusClasses: Record<PipelineStatus, string> = {
  invited: 'bg-info-bg text-info border-info/30',
  invite_pending: 'bg-warning-bg text-warning border-warning/30',
  in_progress: 'bg-surface-overlay text-foreground border-subtle',
  paused_violation: 'bg-error-bg text-error border-error/30',
  auto_submitted: 'bg-warning-bg text-warning border-warning/30',
  completed: 'bg-success-bg text-success border-success/30',
};

export function PipelineStatusBadge({ status }: { status: PipelineStatus }) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={cn('w-fit', statusClasses[status])}>
      {t(`employerAnalytics.status.${status}`)}
    </Badge>
  );
}

export { PipelineStatusBadge as PipelineStageBadge };
