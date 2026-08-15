import { AlertTriangle, CheckCircle2, Clock3, Loader2, RotateCcw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { OrderStatusBadge } from '../../components/live/OrderStatusBadge';
import { useEmployerPaymentCallback } from '../../hooks/useEmployerPaymentCallback';
import { PaymentOrderKind, PaymentPackageType, type OrderStatusText } from '../../types/employerPayment.types';
import {
  PENDING_PACKAGE_TYPE_KEY,
  formatDateTime,
  formatVnd,
  resolveCallbackOrderId,
} from '../../utils/employerPayment';

function outcomeCopy(status: OrderStatusText, subscription: boolean, invoiceSettlement: boolean, isCancelRoute: boolean) {
  if (status === 'Pending' && isCancelRoute) {
    return ['employerBilling.callback.leftCheckout', 'employerBilling.callback.leftCheckoutHint'] as const;
  }
  if (status === 'Paid' && subscription) {
    return ['employerBilling.callback.successSubscription', 'employerBilling.callback.successSubscriptionHint'] as const;
  }
  if (status === 'Paid' && invoiceSettlement) {
    return ['employerBilling.callback.successInvoice', 'employerBilling.callback.successInvoiceHint'] as const;
  }
  if (status === 'Paid') return ['employerBilling.callback.successCredit', 'employerBilling.callback.successCreditHint'] as const;
  if (status === 'Expired') return ['employerBilling.callback.expired', 'employerBilling.callback.expiredHint'] as const;
  if (status === 'Cancelled') return ['employerBilling.callback.cancelled', 'employerBilling.callback.cancelledHint'] as const;
  if (status === 'Refunded') return ['employerBilling.callback.refunded', 'employerBilling.callback.refundedHint'] as const;
  return ['employerBilling.callback.failed', 'employerBilling.callback.failedHint'] as const;
}

export function EmployerPaymentCallbackPage({ mode }: { mode: 'success' | 'cancel' }) {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const orderId = resolveCallbackOrderId(searchParams);
  const storedType = sessionStorage.getItem(PENDING_PACKAGE_TYPE_KEY);
  const state = useEmployerPaymentCallback(orderId, { pollPending: mode === 'success' });
  const status = state.status?.status;
  const isSubscription =
    storedType === String(PaymentPackageType.Subscription) ||
    state.order?.kind === PaymentOrderKind.SubscriptionPurchase ||
    state.order?.kind === PaymentOrderKind.SubscriptionRenewal;
  const isInvoiceSettlement = state.order?.kind === PaymentOrderKind.InvoiceSettlement;

  if (!orderId) {
    return <CallbackShell icon={AlertTriangle} title={t('employerBilling.callback.missing')} />;
  }
  if (state.isLoading || (status === 'Pending' && mode === 'success' && !state.isTimedOut)) {
    return (
      <CallbackShell
        icon={Loader2}
        spin
        title={t('employerBilling.callback.verifying')}
        description={t('employerBilling.callback.verifyingHint')}
        order={state.order}
        locale={locale}
      />
    );
  }
  if (state.isTimedOut || state.error || !status) {
    return (
      <CallbackShell
        icon={Clock3}
        title={t('employerBilling.callback.timeout')}
        order={state.order}
        locale={locale}
      />
    );
  }

  const [titleKey, descriptionKey] = outcomeCopy(status, isSubscription, isInvoiceSettlement, mode === 'cancel');
  return (
    <CallbackShell
      icon={status === 'Paid' ? CheckCircle2 : status === 'Pending' ? RotateCcw : AlertTriangle}
      title={t(titleKey)}
      description={t(descriptionKey)}
      order={state.order}
      status={status}
      locale={locale}
    />
  );
}

function CallbackShell({
  icon: Icon,
  title,
  description,
  order,
  status,
  spin,
  locale = 'vi-VN',
}: {
  icon: typeof AlertTriangle;
  title: string;
  description?: string;
  order?: ReturnType<typeof useEmployerPaymentCallback>['order'];
  status?: OrderStatusText;
  spin?: boolean;
  locale?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-surface-base px-4 py-12">
      <main className="frame-satin mx-auto max-w-2xl rounded-2xl bg-surface-raised p-6 sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-overlay frame-satin-soft">
          <Icon className={spin ? 'size-7 animate-spin' : 'size-7'} aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
        {status ? <div className="mt-5"><OrderStatusBadge status={status} /></div> : null}
        {order ? (
          <dl className="mt-6 grid gap-4 rounded-xl bg-surface-overlay p-4 sm:grid-cols-2">
            <div><dt className="text-xs text-muted-foreground">{t('employerBilling.orders.code')}</dt><dd className="mt-1 text-foreground">{order.payosOrderCode}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('employerBilling.orders.amount')}</dt><dd className="mt-1 text-foreground">{formatVnd(order.amountVnd, locale)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('employerBilling.orders.paidAt')}</dt><dd className="mt-1 text-foreground">{formatDateTime(order.paidAt, locale)}</dd></div>
          </dl>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link to="/employer/billing/orders" />} nativeButton={false}>
            {t('employerBilling.callback.viewOrders')}
          </Button>
          <Button variant="outline" render={<Link to="/employer/billing/packages" />} nativeButton={false}>
            {t('employerBilling.callback.choosePackage')}
          </Button>
          <Button variant="ghost" render={<Link to="/employer/billing" />} nativeButton={false}>
            {t('employerBilling.callback.backToBilling')}
          </Button>
        </div>
      </main>
    </div>
  );
}

