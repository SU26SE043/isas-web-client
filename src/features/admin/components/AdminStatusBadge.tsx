import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { AdminStatus } from '../types/admin.types';

const classNameByStatus: Record<AdminStatus, string> = {
  active: 'border-success/30 bg-success/10 text-success',
  approved: 'border-success/30 bg-success/10 text-success',
  healthy: 'border-success/30 bg-success/10 text-success',
  pending: 'border-warning/30 bg-warning/10 text-warning',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  open: 'border-info/30 bg-info/10 text-info',
  suspended: 'border-error/30 bg-error/10 text-error',
  rejected: 'border-error/30 bg-error/10 text-error',
  critical: 'border-error/30 bg-error/10 text-error',
  resolved: 'border-subtle bg-surface-overlay text-muted-foreground',
};

export function AdminStatusBadge({ status }: { status: AdminStatus }) {
  const { t } = useLanguage();

  return (
    <Badge variant="outline" className={cn('capitalize', classNameByStatus[status])}>
      {t(`admin.status.${status}`)}
    </Badge>
  );
}
