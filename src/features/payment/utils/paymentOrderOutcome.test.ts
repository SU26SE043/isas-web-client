/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  getOrderPaymentStatus,
  isPaymentSuccessStatus,
  resolvePaymentOutcome,
} from './paymentOrderOutcome';

describe('paymentOrderOutcome', () => {
  it('reads payment status from status only', () => {
    // paymentStatus is not part of the backend OrderResponse; status is the sole source of truth.
    expect(getOrderPaymentStatus({ paymentStatus: 'Pending', status: 'Paid' })).toBe('Paid');
  });

  it('resolves success statuses', () => {
    expect(resolvePaymentOutcome('Paid')).toBe('success');
    expect(resolvePaymentOutcome('2')).toBe('success');
    expect(resolvePaymentOutcome('COMPLETED')).toBe('success');
    expect(isPaymentSuccessStatus('SUCCESS')).toBe(true);
  });

  it('resolves failed and incomplete statuses', () => {
    expect(resolvePaymentOutcome('Cancelled')).toBe('failed');
    expect(resolvePaymentOutcome('FAILED')).toBe('failed');
    expect(resolvePaymentOutcome('PENDING')).toBe('incomplete');
    expect(resolvePaymentOutcome('UNPAID')).toBe('incomplete');
  });
});
