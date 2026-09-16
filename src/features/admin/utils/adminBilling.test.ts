import { describe, expect, it } from 'vitest';
import {
  creditReasonKey, orderKindKey, orderStatusKey, packageTypeKey, payoutStatusKey, planAudienceKey,
  postpaidAlertKey, shortId, subscriptionSourceKey,
} from './adminBilling';

// Payment serialize enum thành SỐ; bảng tra là thứ duy nhất đứng giữa DTO và màn hình. Giá trị/thứ tự
// chép từ `Isas.PaymentService/Models/*.cs` — lệch một là admin đọc "Đã trả" cho đơn Thất bại.
describe('adminBilling — bảng tra enum số của Payment', () => {
  it('OrderStatus bắt đầu từ 1 (Pending) và 6 = Refunded; 0 không tồn tại', () => {
    expect(orderStatusKey(1)).toBe('admin.money.orderStatus.pending');
    expect(orderStatusKey(2)).toBe('admin.money.orderStatus.paid');
    expect(orderStatusKey(6)).toBe('admin.money.orderStatus.refunded');
    expect(orderStatusKey(0)).toBe('admin.money.unknown');
    expect(orderStatusKey(null)).toBe('admin.money.unknown');
  });

  it('OrderKind 0..3 theo thứ tự khai trong Order.cs', () => {
    expect(orderKindKey(0)).toBe('admin.money.orderKind.creditPack');
    expect(orderKindKey(1)).toBe('admin.money.orderKind.invoiceSettlement');
    expect(orderKindKey(3)).toBe('admin.money.orderKind.subscriptionRenewal');
  });

  it('CreditTransactionReason 0..4 — PromoGrant (cấp tay) là 4, FreeGrant (tặng thử) là 3, không lẫn nhau', () => {
    expect(creditReasonKey(3)).toBe('admin.money.reason.freeGrant');
    expect(creditReasonKey(4)).toBe('admin.money.reason.promoGrant');
    expect(creditReasonKey(1)).toBe('admin.money.reason.consume');
  });

  it('PackageType bắt đầu từ 1; PlanAudience/SubscriptionSource từ 0', () => {
    expect(packageTypeKey(1)).toBe('admin.money.packageType.oneTime');
    expect(packageTypeKey(2)).toBe('admin.money.packageType.subscription');
    expect(packageTypeKey(0)).toBe('admin.money.unknown');
    expect(planAudienceKey(1)).toBe('admin.money.audience.b2b');
    expect(subscriptionSourceKey(1)).toBe('admin.money.source.adminGrant');
  });

  it('PostpaidAlertLevel vắng (BE cũ không gửi) ⇒ None, không phải Không rõ; 4 = Quá hạn', () => {
    expect(postpaidAlertKey(undefined)).toBe('admin.money.alert.none');
    expect(postpaidAlertKey(4)).toBe('admin.money.alert.overdue');
  });

  it('payoutStatus là CHUỖI: null = chưa chuyển, Failed = lệnh chi hỏng', () => {
    expect(payoutStatusKey(null)).toBe('admin.money.payout.none');
    expect(payoutStatusKey('Failed')).toBe('admin.money.payout.failed');
    expect(payoutStatusKey('Succeeded')).toBe('admin.money.payout.succeeded');
    expect(payoutStatusKey('weird')).toBe('admin.money.payout.none');
  });

  it('shortId cắt GUID còn 8 ký tự + dấu …', () => {
    expect(shortId('0610da24-1111-2222-3333-444444444444')).toBe('0610da24…');
    expect(shortId('abc')).toBe('abc');
  });
});
