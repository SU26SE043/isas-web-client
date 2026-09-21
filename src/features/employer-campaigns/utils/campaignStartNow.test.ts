import { describe, expect, it } from 'vitest';
import { startNowBlocker } from './campaignStartNow';

const NOW = Date.UTC(2026, 8, 13, 12, 0, 0); // 2026-09-13T12:00:00Z
const at = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();
const HOUR = 3_600_000;

describe('startNowBlocker (T13 R2 · D-3 "mở sớm phải nhìn ca")', () => {
  it('không ca · Active · giờ mở tương lai ⇒ null (được mở ngay)', () => {
    expect(startNowBlocker({ status: 'active', startsAt: at(2 * HOUR), slotCount: 0, now: NOW })).toBeNull();
  });

  it('có ca ⇒ hasSlots — THẮNG notFuture: giờ mở còn tương lai vẫn KHÔNG cho mở sớm', () => {
    expect(startNowBlocker({ status: 'active', startsAt: at(2 * HOUR), slotCount: 1, now: NOW })).toBe('hasSlots');
  });

  it('có ca + giờ mở đã qua ⇒ vẫn hasSlots (lý do đúng là ca, không phải "đã tới giờ")', () => {
    expect(startNowBlocker({ status: 'active', startsAt: at(-HOUR), slotCount: 3, now: NOW })).toBe('hasSlots');
  });

  it('giờ mở đã qua (không ca, Active) ⇒ notFuture', () => {
    expect(startNowBlocker({ status: 'active', startsAt: at(-1), slotCount: 0, now: NOW })).toBe('notFuture');
  });

  it('đúng bằng "bây giờ" ⇒ notFuture (backend no-op khi start_at <= now)', () => {
    expect(startNowBlocker({ status: 'active', startsAt: at(0), slotCount: 0, now: NOW })).toBe('notFuture');
  });

  it('không có giờ mở / chuỗi hỏng ⇒ notFuture', () => {
    expect(startNowBlocker({ status: 'active', startsAt: undefined, slotCount: 0, now: NOW })).toBe('notFuture');
    expect(startNowBlocker({ status: 'active', startsAt: 'không phải ngày', slotCount: 0, now: NOW })).toBe('notFuture');
  });

  it('không Active (draft/closed) ⇒ notActive — kể cả khi giờ mở đã qua', () => {
    expect(startNowBlocker({ status: 'draft', startsAt: at(2 * HOUR), slotCount: 0, now: NOW })).toBe('notActive');
    expect(startNowBlocker({ status: 'closed', startsAt: at(-HOUR), slotCount: 0, now: NOW })).toBe('notActive');
  });
});
