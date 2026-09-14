/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf8');

/**
 * Đo trên dev: trang chiến dịch in "Backend" ba lần trong 120px đầu (phụ đề dưới h1 · dòng meta · thanh tóm tắt
 * tab CV). Lĩnh vực chỉ còn ở dòng meta của header; SummaryBar chỉ còn thời lượng · số câu · điểm đạt.
 */
describe('campaign header — lĩnh vực in một lần', () => {
  it('CampaignContextHeader render campaign.domain đúng 1 lần', () => {
    const src = read('src/features/employer-campaigns/components/CampaignContextHeader.tsx');
    expect(src.match(/\{campaign\.domain\}/g) ?? []).toHaveLength(1);
  });
  it('CampaignSummaryBar không render campaign.domain', () => {
    const src = read('src/features/employer-campaigns/components/CampaignSummaryBar.tsx');
    expect(src).not.toMatch(/campaign\.domain/);
  });
});
