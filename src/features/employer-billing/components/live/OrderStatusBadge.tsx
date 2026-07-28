import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { OrderStatusText } from '../../types/employerPayment.types';
import { statusBadgeClass, statusLabelKey } from '../../utils/employerPaymentLabels';

export function OrderStatusBadge({ status }: { status: OrderStatusText }) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={statusBadgeClass(status)}>
      {t(statusLabelKey(status))}
    </Badge>
  );
}

