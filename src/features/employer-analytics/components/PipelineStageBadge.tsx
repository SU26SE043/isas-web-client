import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PipelineStage } from '../types/employerAnalytics.types';

const stageClasses: Record<PipelineStage, string> = {
  applied: 'bg-info-bg text-info border-info/30',
  interviewed: 'bg-warning-bg text-warning border-warning/30',
  reviewed: 'bg-surface-overlay text-muted-foreground border-subtle',
  shortlisted: 'bg-success-bg text-success border-success/30',
  rejected: 'bg-error-bg text-error border-error/30',
};

export function PipelineStageBadge({ stage }: { stage: PipelineStage }) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={cn('w-fit', stageClasses[stage])}>
      {t(`employerAnalytics.stage.${stage}`)}
    </Badge>
  );
}
