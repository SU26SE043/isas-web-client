import { describe, expect, it } from 'vitest';
import {
  parseAccount,
  parseOrder,
  parseOrderStatus,
  parsePackage,
  parseSubscription,
  parseTransaction,
  readNextCursor,
  unwrapList,
} from './employerPayment.parsers';
import {
  PaymentAccountStatus,
  PaymentMode,
  PaymentOrderKind,
  PaymentOrderStatus,
  PaymentOwnerType,
  PaymentPackageType,
} from '../types/employerPayment.types';

describe('employer payment parsers', () => {
  it('parses the exact order contract including numeric enums', () => {
    expect(parseOrder({
      id: 'order-1',
      ownerType: 0,
      ownerId: 'org-1',
      kind: 2,
      packageId: 'pkg-1',
      invoiceId: null,
      status: 1,
      amountVnd: 250000,
      payosOrderCode: 1234,
      expiredAt: '2026-07-28T10:00:00Z',
      paidAt: null,
      createdAt: '2026-07-28T09:00:00Z',
      checkoutUrl: 'https://pay.example/order',
    })).toMatchObject({
      ownerType: PaymentOwnerType.Organization,
      kind: PaymentOrderKind.SubscriptionPurchase,
      status: PaymentOrderStatus.Pending,
      checkoutUrl: 'https://pay.example/order',
    });
  });

  it('parses status text separately from numeric order status', () => {
    expect(parseOrderStatus({ orderCode: 12, status: 'Refunded', paidAt: null })).toEqual({
      orderCode: 12,
      status: 'Refunded',
      paidAt: null,
    });
    expect(() => parseOrderStatus({ orderCode: 12, status: 6, paidAt: null })).toThrow();
  });

  it('parses account, subscription, package and transaction empty values', () => {
    expect(parseAccount({
      ownerType: 0,
      ownerId: 'org',
      paymentMode: 0,
      status: 0,
      remainingCredits: 0,
      reservedCredits: 0,
      creditLimit: null,
      periodUsage: null,
      updatedAt: '2026-07-28T00:00:00Z',
    })).toMatchObject({
      paymentMode: PaymentMode.Prepaid,
      status: PaymentAccountStatus.Active,
      remainingCredits: 0,
    });
    expect(parseSubscription({
      ownerType: 0,
      ownerId: 'org',
      active: false,
      billingCycle: null,
      startedAt: null,
      expiresAt: null,
    }).active).toBe(false);
    expect(parsePackage({
      id: 'pkg',
      name: 'Starter',
      type: 1,
      priceVnd: 100000,
      interviewCredits: 10,
      durationDays: null,
      isActive: true,
      createdAt: '',
    }).type).toBe(PaymentPackageType.OneTime);
    expect(parseTransaction({
      id: 'tx',
      ownerType: 0,
      ownerId: 'org',
      delta: -1,
      reason: 2,
      sessionId: 'session',
      orderId: null,
      createdAt: '',
    }).delta).toBe(-1);
  });

  it('unwraps supported list envelopes and reads X-Next-Cursor', () => {
    expect(unwrapList({ data: { items: [1, 2] } })).toEqual([1, 2]);
    expect(readNextCursor({ 'x-next-cursor': 'next-1' })).toBe('next-1');
    expect(readNextCursor({ get: (key: string) => key === 'x-next-cursor' ? 'next-2' : null })).toBe('next-2');
  });
});

