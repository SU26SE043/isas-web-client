import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { VerificationStatus } from '../types/employer.types';

const statusClass: Record<VerificationStatus, string> = {
  draft: 'border-subtle bg-surface-overlay text-muted-foreground',
  pending: 'border-warning/30 bg-warning-bg text-warning',
  verified: 'border-success/30 bg-success-bg text-success',
  rejected: 'border-error/30 bg-error-bg text-error',
};

export function EmployerStatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={cn('capitalize', statusClass[status])}>
      {t(`employer.status.${status}`)}
    </Badge>
  );
}
