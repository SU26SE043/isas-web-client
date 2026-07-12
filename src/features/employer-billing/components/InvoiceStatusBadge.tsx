import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { InvoiceStatus } from '../types/employerBilling.types';

const statusClassName: Record<InvoiceStatus, string> = {
  paid: 'border-success/30 bg-success/10 text-success',
  open: 'border-info/30 bg-info/10 text-info',
  past_due: 'border-error/30 bg-error/10 text-error',
  void: 'border-subtle bg-surface-overlay text-muted-foreground',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useLanguage();

  return (
    <Badge variant="outline" className={cn('capitalize', statusClassName[status])}>
      {t(`employerBilling.invoice.status.${status}`)}
    </Badge>
  );
}
