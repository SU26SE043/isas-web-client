/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  getOrderPaymentStatus,
  isPaymentSuccessStatus,
  resolvePaymentOutcome,
} from './paymentOrderOutcome';

describe('paymentOrderOutcome', () => {
  it('prefers paymentStatus over status', () => {
    expect(
      getOrderPaymentStatus({ paymentStatus: 'Paid', status: 'Pending' }),
    ).toBe('Paid');
  });

  it('resolves success statuses', () => {
    expect(resolvePaymentOutcome('Paid')).toBe('success');
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
