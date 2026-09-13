import { beforeEach, describe, expect, it } from 'vitest';
import { readCampaignDeployOptions, useCampaignDeployOptionsStore } from './campaignDeployOptionsStore';

describe('campaignDeployOptionsStore (T13 R2)', () => {
  beforeEach(() => useCampaignDeployOptionsStore.getState().reset());

  it('đọc ĐÚNG key mới thấy lựa chọn; key khác ⇒ như chưa đụng (không rò sang campaign khác)', () => {
    useCampaignDeployOptionsStore.getState().setChoice('cmp-1|2026-09-14T10:00', true);
    expect(readCampaignDeployOptions('cmp-1|2026-09-14T10:00')).toEqual({ choice: true, blocked: false });
    expect(readCampaignDeployOptions('cmp-2|2026-09-14T10:00')).toEqual({ choice: null, blocked: false });
    expect(readCampaignDeployOptions('cmp-1|2026-09-15T10:00')).toEqual({ choice: null, blocked: false });
  });

  it('setBlocked giữ choice cùng key, nhưng đổi key thì choice cũ bị bỏ', () => {
    const store = useCampaignDeployOptionsStore.getState();
    store.setChoice('k1', true);
    store.setBlocked('k1', true);
    expect(readCampaignDeployOptions('k1')).toEqual({ choice: true, blocked: true });
    store.setBlocked('k2', false);
    expect(readCampaignDeployOptions('k2')).toEqual({ choice: null, blocked: false });
    expect(readCampaignDeployOptions('k1')).toEqual({ choice: null, blocked: false });
  });

  it('reset ⇒ về trắng', () => {
    useCampaignDeployOptionsStore.getState().setChoice('k1', false);
    useCampaignDeployOptionsStore.getState().reset();
    expect(useCampaignDeployOptionsStore.getState().key).toBeNull();
    expect(readCampaignDeployOptions('k1')).toEqual({ choice: null, blocked: false });
  });
});
