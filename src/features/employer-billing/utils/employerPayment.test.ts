import { afterEach, describe, expect, it } from 'vitest';
import {
  PENDING_ORDER_ID_KEY,
  PENDING_PACKAGE_ID_KEY,
  PENDING_PACKAGE_TYPE_KEY,
  buildCreateOrderRequest,
  canManageEmployerPayment,
  clearPendingPayment,
  formatCreditDelta,
  formatDateTime,
  isTerminalStatus,
  persistPendingPayment,
  resolveCallbackOrderId,
  statusTextFromEnum,
} from './employerPayment';
import { PaymentOrderStatus } from '../types/employerPayment.types';
import { PaymentPackageType } from '../types/employerPayment.types';
import { UserRole } from '@/features/auth/types/auth.types';
import { transactionReasonLabelKey } from './employerPaymentLabels';

describe('employer payment utilities', () => {
  afterEach(() => sessionStorage.clear());

  it('formats signed credit deltas', () => {
    expect(formatCreditDelta(50)).toBe('+50');
    expect(formatCreditDelta(-1)).toBe('-1');
  });

  it('formats transaction dates safely and falls back for invalid values', () => {
    expect(formatDateTime('not-a-date')).toBe('--');
    expect(formatDateTime(null)).toBe('--');
    expect(formatDateTime('2026-07-28T05:00:00Z', 'en-US')).not.toBe('--');
  });

  it('uses the existing reason mapping and safely falls back for unknown reasons', () => {
    expect(transactionReasonLabelKey(5)).toBe('employerBilling.transactions.grant');
    expect(transactionReasonLabelKey(999)).toBe('employerBilling.transactions.generic');
  });

  it('maps every numeric order status and terminal state', () => {
    expect(statusTextFromEnum(PaymentOrderStatus.Pending)).toBe('Pending');
    expect(statusTextFromEnum(PaymentOrderStatus.Paid)).toBe('Paid');
    expect(statusTextFromEnum(PaymentOrderStatus.Refunded)).toBe('Refunded');
    expect(isTerminalStatus('Pending')).toBe(false);
    expect(isTerminalStatus('Expired')).toBe(true);
  });

  it('resolves callback ID by orderId, id, then session storage', () => {
    sessionStorage.setItem(PENDING_ORDER_ID_KEY, 'stored');
    expect(resolveCallbackOrderId(new URLSearchParams('orderId=primary&id=fallback'))).toBe('primary');
    expect(resolveCallbackOrderId(new URLSearchParams('id=fallback'))).toBe('fallback');
    expect(resolveCallbackOrderId(new URLSearchParams())).toBe('stored');
    clearPendingPayment();
    expect(resolveCallbackOrderId(new URLSearchParams())).toBeNull();
  });

  it('builds callback URLs from the supplied origin and persists only pending IDs/type', () => {
    expect(buildCreateOrderRequest('pkg-1', 'https://app.example')).toEqual({
      packageId: 'pkg-1',
      returnUrl: 'https://app.example/employer/payment/success',
      cancelUrl: 'https://app.example/employer/payment/cancel',
    });
    persistPendingPayment('order-1', 'pkg-1', PaymentPackageType.Subscription);
    expect(sessionStorage.getItem(PENDING_ORDER_ID_KEY)).toBe('order-1');
    expect(sessionStorage.getItem(PENDING_PACKAGE_ID_KEY)).toBe('pkg-1');
    expect(sessionStorage.getItem(PENDING_PACKAGE_TYPE_KEY)).toBe('2');
    expect(Object.keys(sessionStorage)).not.toContain('checkoutUrl');
  });

  it('allows OrgAdmin/Admin mutations and keeps HrMember read-only', () => {
    expect(canManageEmployerPayment(UserRole.ORG_ADMIN)).toBe(true);
    expect(canManageEmployerPayment(UserRole.ADMIN)).toBe(true);
    expect(canManageEmployerPayment(UserRole.HR_MEMBER)).toBe(false);
  });
});
