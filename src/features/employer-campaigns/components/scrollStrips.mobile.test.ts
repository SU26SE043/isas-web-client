/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf8');

/**
 * Ở 375px dải tab chiến dịch và dải bước wizard cắt chữ ở mép phải mà không có dấu hiệu nào là còn cuộn được.
 * Dùng utility Tailwind 4.1+ `mask-r-from-*` (mép phải mờ dần) + đệm phải + scroll-snap; jsdom không layout ⇒ khoá cấu trúc.
 */
describe('dải cuộn ngang trên mobile có dấu hiệu "còn nữa"', () => {
  it.each([
    ['src/features/employer-campaigns/components/CampaignSubNavigation.tsx', /max-lg:mask-r-from-\d+% max-lg:pr-8/],
    ['src/features/employer-campaigns/components/wizard/CampaignWizardShell.tsx', /pr-8 mask-r-from-\d+% sm:hidden/],
  ])('%s: mask mép phải + đệm + snap', (file, maskPattern) => {
    const src = read(file);
    expect(src).toMatch(maskPattern);
    expect(src).toMatch(/\bsnap-x snap-proximity\b/);
    expect(src).toMatch(/\bsnap-start\b/);
  });

  it('wizard: bước đang chọn không truncate', () => {
    const src = read('src/features/employer-campaigns/components/wizard/CampaignWizardShell.tsx');
    expect(src).toMatch(/index === currentStep \? 'whitespace-nowrap' : 'max-w-\[7rem\] truncate'/);
  });
});
