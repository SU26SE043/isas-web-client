import { describe, expect, it } from 'vitest';
import { mapCampaignResponseToEmployerCampaign, parseCampaignResponse } from './campaignMapper';

const base = { id: 'c-1', title: 'Backend', status: 'Draft', timeLimitMinutes: 30 };

function mapRaw(raw: Record<string, unknown>) {
  const parsed = parseCampaignResponse(raw);
  if (!parsed) throw new Error('parse failed');
  return mapCampaignResponseToEmployerCampaign(parsed);
}

/** ATT1-F1 [C5] — CampaignResponse thêm `maxAttempts`; Backend chưa có ATT1 không trả ⇒ hiểu là 1. */
describe('campaignMapper — maxAttempts', () => {
  it('response THIẾU maxAttempts ⇒ parse giữ null (vắng), EmployerCampaign hiện 1', () => {
    expect(parseCampaignResponse(base)?.maxAttempts).toBeNull();
    expect(mapRaw(base).maxAttempts).toBe(1);
  });

  it('response có maxAttempts 3 ⇒ 3 (không bị mặc định đè)', () => {
    expect(mapRaw({ ...base, maxAttempts: 3 }).maxAttempts).toBe(3);
  });

  it('PascalCase MaxAttempts 2 ⇒ 2 (cùng luật đọc khoá như các field khác)', () => {
    expect(mapRaw({ ...base, MaxAttempts: 2 }).maxAttempts).toBe(2);
  });

  it('timeLimitMinutes vẫn map về durationMinutes (nguồn của ô thời lượng ở bước 5)', () => {
    expect(mapRaw({ ...base, maxAttempts: 2 }).durationMinutes).toBe(30);
  });
});
