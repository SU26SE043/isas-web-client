/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf8');

/**
 * `position: sticky` chỉ dính so với tổ tiên CUỘN GẦN NHẤT — mà một tổ tiên `overflow: hidden` cũng là
 * "scroll container" dù không bao giờ cuộn. Trước đây `<main>` của layout employer là `overflow-hidden`
 * và trang Đánh giá chi tiết còn bọc thêm `overflow-y-auto` ⇒ rail câu hỏi (desktop) lẫn dải chip (mobile)
 * trôi mất khi cuộn — đo bằng getBoundingClientRect: rail ở y = −675 sau khi nhảy tới câu 3. jsdom không
 * layout nên hành vi thật đo bằng Playwright; test này chỉ khoá CẤU TRÚC để refactor không đặt lại
 * `overflow-hidden`/`overflow-y-auto` lên đường đi của sticky.
 */
describe('sticky trong layout employer — không có tổ tiên overflow ≠ visible/clip', () => {
  it('layout: <main> dùng overflow-x-clip, không overflow-hidden', () => {
    const layout = read('src/layouts/EmployerDashboardLayout.tsx');
    const main = layout.match(/<main className="([^"]*)">/);
    expect(main).not.toBeNull();
    expect(main![1]).toMatch(/\boverflow-x-clip\b/);
    expect(main![1]).not.toMatch(/\boverflow-hidden\b/);
  });

  it('trang Đánh giá chi tiết: không bọc overflow-y-auto quanh rail câu hỏi', () => {
    const page = read('src/features/employer-campaigns/pages/CampaignResultDetailPage.tsx');
    expect(page).not.toMatch(/className="[^"]*overflow-y-auto/);
    const nav = read('src/features/employer-campaigns/components/results/detail/ResultQuestionNav.tsx');
    expect(nav).toMatch(/order-first sticky top-0/);
    expect(nav).toMatch(/lg:order-none lg:top-6/);
  });
});
