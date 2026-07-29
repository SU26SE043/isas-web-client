import { ArrowLeft, Copy } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { CancelOrderDialog } from '../../components/live/CancelOrderDialog';
import { OrderStatusBadge } from '../../components/live/OrderStatusBadge';
import { QuerySection } from '../../components/live/QuerySection';
import { useCancelEmployerOrder } from '../../hooks/useEmployerPaymentMutations';
import { useEmployerOrder, useEmployerPackage } from '../../hooks/useEmployerPaymentQueries';
import { PaymentOrderStatus, PaymentOwnerType } from '../../types/employerPayment.types';
import { canManageEmployerPayment, formatDateTime, formatVnd, statusTextFromEnum } from '../../utils/employerPayment';
import { getEmployerPaymentErrorKey, getSafeBackendMessage } from '../../utils/employerPaymentErrors';
import { orderKindLabelKey } from '../../utils/employerPaymentLabels';

function DetailRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-b border-satin/60 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 text-sm font-medium text-foreground">
        {value}
        {copy ? (
          <Button variant="ghost" size="icon-xs" onClick={() => void navigator.clipboard.writeText(value)}>
            <Copy />
          </Button>
        ) : null}
      </dd>
    </div>
  );
}

export function EmployerOrderDetailPage() {
  const { orderId = '' } = useParams();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const canManage = canManageEmployerPayment(user?.role);
  const [cancelOpen, setCancelOpen] = useState(false);
  const order = useEmployerOrder(orderId || null);
  const pkg = useEmployerPackage(order.data?.packageId ?? null);
  const cancel = useCancelEmployerOrder();
  const cancelError = cancel.error
    ? getSafeBackendMessage(cancel.error) ?? t(getEmployerPaymentErrorKey(cancel.error, 'cancel'))
    : null;

  return (
    <div className="space-y-5">
      <Button variant="ghost" render={<Link to="/employer/billing/orders" />} nativeButton={false}>
        <ArrowLeft /> {t('employerBilling.orders.backToList')}
      </Button>
      <QuerySection isLoading={order.isLoading} isError={order.isError} onRetry={() => void order.refetch()}>
        {order.data ? (
          <>
            <section className="frame-satin rounded-2xl bg-surface-raised p-6">
              <div className="flex flex-col gap-4 border-b border-satin pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-label">{t('employerBilling.orders.detailTitle')}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    {order.data.payosOrderCode || order.data.id}
                  </h2>
                </div>
                <OrderStatusBadge status={statusTextFromEnum(order.data.status)} />
              </div>
              <dl className="mt-3">
                <DetailRow label={t('employerBilling.orders.amount')} value={formatVnd(order.data.amountVnd, locale)} />
                <DetailRow label={t('employerBilling.orders.kind')} value={t(orderKindLabelKey(order.data.kind))} />
                <DetailRow
                  label={t('employerBilling.orders.package')}
                  value={pkg.data?.name ?? (order.data.packageId ? t('employerBilling.orders.discontinuedPackage') : '—')}
                />
                <DetailRow label={t('employerBilling.orders.createdAt')} value={formatDateTime(order.data.createdAt, locale)} />
                <DetailRow label={t('employerBilling.orders.expiresAt')} value={formatDateTime(order.data.expiredAt, locale)} />
                <DetailRow label={t('employerBilling.orders.paidAt')} value={formatDateTime(order.data.paidAt, locale)} />
              </dl>
            </section>
            <section className="frame-satin rounded-2xl bg-surface-raised p-6">
              <h3 className="heading-secondary text-lg text-foreground">{t('employerBilling.orders.technicalInfo')}</h3>
              <dl className="mt-3">
                <DetailRow label={t('employerBilling.orders.code')} value={order.data.id} copy />
                <DetailRow label={t('employerBilling.orders.payosCode')} value={String(order.data.payosOrderCode)} copy />
                <DetailRow
                  label={t('employerBilling.orders.ownerType')}
                  value={order.data.ownerType === PaymentOwnerType.Organization ? 'Organization' : 'User'}
                />
                <DetailRow label={t('employerBilling.orders.ownerId')} value={order.data.ownerId} copy />
                {order.data.invoiceId ? <DetailRow label={t('employerBilling.orders.invoiceId')} value={order.data.invoiceId} copy /> : null}
              </dl>
            </section>
            {canManage && order.data.status === PaymentOrderStatus.Pending ? (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                {t('employerBilling.orders.cancel')}
              </Button>
            ) : null}
            <CancelOrderDialog
              open={cancelOpen}
              isLoading={cancel.isPending}
              error={cancelError}
              onOpenChange={(open) => {
                setCancelOpen(open);
                if (!open) cancel.reset();
              }}
              onConfirm={() => cancel.mutate(order.data.id, {
                onSuccess: () => {
                  toast.success(t('employerBilling.orders.cancelledToast'));
                  setCancelOpen(false);
                  void order.refetch();
                },
              })}
            />
          </>
        ) : null}
      </QuerySection>
    </div>
  );
}
