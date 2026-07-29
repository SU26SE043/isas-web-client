import axios from 'axios';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';

export type PaymentAction =
  | 'read'
  | 'package'
  | 'create'
  | 'cancel'
  | 'order';

export function getEmployerPaymentErrorKey(error: unknown, action: PaymentAction): string {
  const status = getApiStatusCode(error);
  if (status === 403) {
    return action === 'create' || action === 'cancel'
      ? 'employerBilling.errors.adminOnly'
      : 'employerBilling.errors.ownerMissing';
  }
  if (status === 404) {
    return action === 'package'
      ? 'employerBilling.errors.packageMissing'
      : 'employerBilling.errors.orderMissing';
  }
  if (status === 400 && action === 'cancel') return 'employerBilling.errors.orderNotPending';
  if (status === 400 && action === 'create') return 'employerBilling.errors.packageInactive';
  if (status === 502 && action === 'create') return 'employerBilling.errors.gateway';
  return 'employerBilling.errors.generic';
}

export function getSafeBackendMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error) || !error.response?.data) return null;
  const message = getApiErrorMessage(error, '').trim();
  if (!message || /stack|exception| at \w+/i.test(message)) return null;
  return message;
}
