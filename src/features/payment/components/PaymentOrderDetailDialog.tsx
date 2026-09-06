import {
  CreditCard,
  FileText,
  RefreshCw,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';
import {
  isLivePendingStatus,
  livePaymentStatusLabelKey,
  normalizeLivePaymentStatus,
} from '../utils/livePaymentStatus';
import { getOrderStatusVisual } from '../utils/orderStatusVisual';
import { PaymentOrderDetailSummary } from './PaymentOrderDetailSummary';
import { PaymentOrderDetailFields } from './PaymentOrderDetailFields';

interface PaymentOrderDetailDialogProps {
  open: boolean;
  order: PaymentOrderDetail | null;
  statusResult?: PaymentOrderStatusResult;
  isStatusLoading: boolean;
  isCanceling: boolean;
  isProceeding: boolean;
  cancelError?: string | null;
  proceedError?: string | null;
  onOpenChange: (open: boolean) => void;
  onRefreshStatus: () => void;
  onCancelOrder: () => void;
  onProceedPayment: () => void;
}

export function PaymentOrderDetailDialog({
  open,
  order,
  statusResult,
  isStatusLoading,
  isCanceling,
  isProceeding,
  cancelError,
  proceedError,
  onOpenChange,
  onRefreshStatus,
  onCancelOrder,
  onProceedPayment,
}: PaymentOrderDetailDialogProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi' : 'en';
  const status = normalizeLivePaymentStatus(
    statusResult?.status ?? order?.status ?? '',
  );
  const canPay = isLivePendingStatus(status) && Boolean(order?.packageId);
  const canCancel = isLivePendingStatus(status);
  const visual = getOrderStatusVisual(status);
  const StatusIcon = visual.icon as LucideIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 border-b border-subtle px-6 py-5 sm:px-8">
          <DialogTitle className="flex items-center gap-3 pr-8 text-xl sm:text-2xl">
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface-overlay text-foreground frame-satin-soft">
              <FileText className="size-5" aria-hidden />
            </span>
            {t('payment.orders.detailTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!order ? (
            <p className="px-6 py-10 text-sm text-muted-foreground sm:px-8">
              {t('payment.orders.selectHint')}
            </p>
          ) : (
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(280px,0.95fr)_1.25fr] lg:gap-8 sm:px-8 sm:py-8">
              <PaymentOrderDetailSummary
                order={order}
                statusLabel={t(livePaymentStatusLabelKey(status))}
                hint={t(visual.hintKey)}
                statusIcon={StatusIcon}
                statusIconWrap={visual.iconWrap}
                locale={locale}
                isStatusLoading={isStatusLoading && !status}
              />
              <PaymentOrderDetailFields
                order={order}
                status={status}
                statusResult={statusResult}
                isStatusLoading={isStatusLoading}
                locale={locale}
                language={language}
              />
            </div>
          )}

          {proceedError || cancelError ? (
            <p className="mx-6 mb-4 rounded-lg border border-error/20 bg-error-bg px-3 py-2 text-sm text-error sm:mx-8">
              {proceedError || cancelError}
            </p>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 flex-col gap-3 rounded-b-2xl border-t border-subtle bg-surface-raised/50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 sm:pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onRefreshStatus}
            disabled={isStatusLoading || isProceeding}
            className="h-10 rounded-md px-4"
          >
            <RefreshCw className={cn('size-4', isStatusLoading && 'animate-spin')} aria-hidden />
            {t('payment.orders.refresh')}
          </Button>
          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              loading={isCanceling}
              disabled={isProceeding}
              onClick={onCancelOrder}
              className="h-10 rounded-md px-4 border-error/40 text-error hover:bg-error-bg hover:text-error"
            >
              <Trash2 className="size-4" aria-hidden />
              {t('payment.orders.cancelOrder')}
            </Button>
          ) : null}
          {canPay ? (
            <Button
              type="button"
              loading={isProceeding}
              disabled={isCanceling}
              onClick={onProceedPayment}
              className="h-10 rounded-md px-4"
            >
              <CreditCard className="size-4" aria-hidden />
              {isProceeding
                ? t('payment.checkout.redirecting')
                : t('payment.orders.proceedPayment')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
