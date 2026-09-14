import { describe, expect, it } from 'vitest';
import {
  START_NOW_DEFAULT_WINDOW_MS,
  defaultStartNow,
  resolveStartNowOnDeploy,
  startNowBlocker,
  startNowChoiceKey,
} from './campaignStartNow';

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

describe('defaultStartNow (D-6 · ngưỡng 24h)', () => {
  it('23h59 ⇒ true', () => {
    expect(defaultStartNow(at(24 * HOUR - 60_000), NOW)).toBe(true);
  });

  it('ĐÚNG 24h ⇒ true (≤, không phải <)', () => {
    expect(defaultStartNow(at(START_NOW_DEFAULT_WINDOW_MS), NOW)).toBe(true);
  });

  it('24h01 ⇒ false', () => {
    expect(defaultStartNow(at(24 * HOUR + 60_000), NOW)).toBe(false);
  });

  it('đã qua / ngay bây giờ / không có ⇒ false', () => {
    expect(defaultStartNow(at(-1), NOW)).toBe(false);
    expect(defaultStartNow(at(0), NOW)).toBe(false);
    expect(defaultStartNow('', NOW)).toBe(false);
    expect(defaultStartNow(null, NOW)).toBe(false);
  });

  it('1 giây tới ⇒ true (biên dưới là > 0)', () => {
    expect(defaultStartNow(at(1_000), NOW)).toBe(true);
  });
});

describe('resolveStartNowOnDeploy — giá trị thật sự gửi cho deploy', () => {
  it('blocked thắng mọi thứ: HR đã tick vẫn KHÔNG gửi start-now', () => {
    expect(resolveStartNowOnDeploy({ choice: true, blocked: true, startsAt: at(HOUR), now: NOW })).toBe(false);
  });

  it('HR tick tường minh thắng mặc định D-6 (cả hai chiều)', () => {
    expect(resolveStartNowOnDeploy({ choice: true, blocked: false, startsAt: at(48 * HOUR), now: NOW })).toBe(true);
    expect(resolveStartNowOnDeploy({ choice: false, blocked: false, startsAt: at(HOUR), now: NOW })).toBe(false);
  });

  it('chưa đụng (null) ⇒ theo mặc định D-6', () => {
    expect(resolveStartNowOnDeploy({ choice: null, blocked: false, startsAt: at(HOUR), now: NOW })).toBe(true);
    expect(resolveStartNowOnDeploy({ choice: null, blocked: false, startsAt: at(48 * HOUR), now: NOW })).toBe(false);
  });
});

describe('startNowChoiceKey', () => {
  it('chưa có nháp ⇒ scope `new`; đổi giờ mở ⇒ key khác (mặc định D-6 tính lại)', () => {
    expect(startNowChoiceKey(undefined, '2026-09-14T10:00')).toBe('new|2026-09-14T10:00');
    expect(startNowChoiceKey('cmp-1', '2026-09-14T10:00')).not.toBe(startNowChoiceKey('cmp-1', '2026-09-15T10:00'));
    expect(startNowChoiceKey('cmp-1', 'x')).not.toBe(startNowChoiceKey('cmp-2', 'x'));
  });
});
