import { describe, expect, it } from 'vitest';
import type { CampaignSlotResponse } from '../types/campaign.api.types';
import { inviteSlotShortfall, slotCapacityOverflow, slotsOutsideCampaignWindow } from './campaignCapacityChecks';

function slot(startsAt: string, endsAt: string, capacity = 5): CampaignSlotResponse {
  return { id: `${startsAt}-${endsAt}`, startsAt, endsAt, capacity, assignedCount: 0, startedCount: 0 };
}

describe('slotsOutsideCampaignWindow', () => {
  const from = '2099-01-10T00:00';
  const to = '2099-01-20T00:00';

  it('bỏ qua ca nằm trọn trong cửa sổ', () => {
    expect(slotsOutsideCampaignWindow([slot('2099-01-12T09:00Z', '2099-01-12T11:00Z')], from, to)).toHaveLength(0);
  });

  it('bắt ca bắt đầu TRƯỚC cửa sổ', () => {
    expect(slotsOutsideCampaignWindow([slot('2099-01-05T09:00Z', '2099-01-12T11:00Z')], from, to)).toHaveLength(1);
  });

  it('bắt ca kết thúc SAU cửa sổ', () => {
    expect(slotsOutsideCampaignWindow([slot('2099-01-12T09:00Z', '2099-01-25T11:00Z')], from, to)).toHaveLength(1);
  });

  it('cửa sổ chưa nhập thì không cảnh báo gì — cảnh báo lúc đó chỉ là nhiễu', () => {
    expect(slotsOutsideCampaignWindow([slot('2099-01-05T09:00Z', '2099-01-25T11:00Z')], '', '')).toHaveLength(0);
  });
});

describe('slotCapacityOverflow', () => {
  it('dư chỗ so với trần ứng viên', () => {
    expect(slotCapacityOverflow(12, 10)).toBe(2);
  });

  it('vừa khít hoặc thiếu ⇒ 0', () => {
    expect(slotCapacityOverflow(10, 10)).toBe(0);
    expect(slotCapacityOverflow(4, 10)).toBe(0);
  });

  it('chưa khai trần ⇒ 0, không đoán hộ', () => {
    expect(slotCapacityOverflow(12, null)).toBe(0);
  });
});

describe('inviteSlotShortfall', () => {
  const slotWith = (capacity: number, assignedCount: number): CampaignSlotResponse => ({
    id: `cap${capacity}-assigned${assignedCount}`,
    startsAt: '2099-01-10T09:00Z',
    endsAt: '2099-01-10T11:00Z',
    capacity,
    assignedCount,
    startedCount: 0,
  });

  it('KHÔNG có ca nào ⇒ 0 — mời không cần slot, không phải "thiếu vô hạn"', () => {
    expect(inviteSlotShortfall([], 5)).toBe(0);
  });

  it('1 ca 5/3 đã gán, mời thêm 3 người ⇒ thiếu đúng 1 chỗ', () => {
    expect(inviteSlotShortfall([slotWith(5, 3)], 3)).toBe(1);
  });

  it('đủ chỗ ⇒ 0', () => {
    expect(inviteSlotShortfall([slotWith(5, 1)], 3)).toBe(0);
  });
});
