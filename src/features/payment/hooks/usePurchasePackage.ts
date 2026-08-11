import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';

function resolvePurchaseErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'PAYMENT_FORBIDDEN':
        return t('payment.order.forbidden');
      case 'PAYMENT_PACKAGE_NOT_FOUND':
        return t('payment.order.packageNotFound');
      case 'PAYMENT_PACKAGE_INACTIVE':
        return t('payment.order.packageInactive');
      case 'PAYMENT_GATEWAY_ERROR':
        return t('payment.order.gatewayError');
      case 'CHECKOUT_URL_MISSING':
        return t('payment.order.missingCheckoutUrl');
      default:
        break;
    }
  }
  return getApiErrorMessage(error, t('payment.checkout.error'));
}

export function usePurchasePackage() {
  const { t } = useLanguage();
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const purchasePackage = useCallback(
    async (packageId: string) => {
      setActivePackageId(packageId);
      setError(null);
      try {
        const { order } = await paymentService.createOrder(packageId);
        if (!order.checkoutUrl) {
          throw new Error('CHECKOUT_URL_MISSING');
        }
        // PayOS returns to the shared callback URL without our internal order id.
        // Keep the id created by PaymentService so the callback can verify the
        // final payment state with the backend instead of treating it as invalid.
        sessionStorage.setItem('payment.return.orderId', order.orderId);
        sessionStorage.setItem('payment.return.packageId', order.packageId);
        window.location.assign(order.checkoutUrl);
      } catch (purchaseError) {
        setError(resolvePurchaseErrorMessage(purchaseError, t));
        setActivePackageId(null);
      }
    },
    [t],
  );

  return {
    purchasePackage,
    activePackageId,
    error,
    clearError: () => setError(null),
    isPurchasing: activePackageId != null,
  };
}
