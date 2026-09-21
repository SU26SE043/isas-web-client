import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Bảng sàng CV phải tự cập nhật KỂ CẢ khi tab đang bị che. Đo 21/09 (dev, Chrome thật): HR bấm Phân
 * tích rồi chuyển cửa sổ → `visibilityState='hidden'` → với `refetchIntervalInBackground: false`
 * không lượt poll nào chạy → quay lại vẫn "Đang phân tích" dù DB đã Analyzed 30 s trước. Khoá bằng
 * đọc mã nguồn vì cờ này là tuỳ chọn cấu hình của TanStack, không có hành vi nào khác để assert
 * trong jsdom (jsdom luôn 'visible').
 */
describe('useCampaignCandidates — poll khi tab ẩn', () => {
  it('refetchIntervalInBackground phải là true (không thì bảng treo ở "Đang phân tích" khi HR chuyển cửa sổ)', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, 'useCampaignCandidates.ts'), 'utf8');
    const block = source.slice(source.indexOf('export function useCampaignCandidates('), source.indexOf('export function useCampaignCandidateDetail('));
    expect(block).toContain('refetchIntervalInBackground: true');
    expect(block).not.toContain('refetchIntervalInBackground: false');
  });
});
