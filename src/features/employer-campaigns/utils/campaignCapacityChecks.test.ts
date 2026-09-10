import { describe, expect, it } from 'vitest';
import type { CampaignSlotResponse } from '../types/campaign.api.types';
import { slotCapacityOverflow, slotsOutsideCampaignWindow } from './campaignCapacityChecks';

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
