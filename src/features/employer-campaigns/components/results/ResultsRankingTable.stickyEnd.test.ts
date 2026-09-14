/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Đọc thẳng file qua node:fs — `?raw` cho .css trả CHUỖI RỖNG dưới vitest (css bị tắt), còn tsconfig.app
// chỉ khai `types: ["vite/client"]` nên cần reference tường minh tới @types/node (đã có trong devDeps).
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf8');

/**
 * Cột "Thao tác" dính mép phải (ở 1440px bảng tràn và nút "Xem đánh giá chi tiết" bị cắt, không có
 * dấu hiệu còn cột). Hành vi thật đã đo bằng Playwright (bounding box trong viewport ở 1280…2560,
 * elementFromPoint cho menu "⋯"); test này chỉ khoá CẤU TRÚC để refactor không âm thầm gỡ mất:
 * class phải có ở CẢ th lẫn td, và CSS phải còn sticky/right + nâng z-index cho hàng đang mở menu
 * (sticky luôn tạo stacking context ⇒ thiếu vế đó là menu bị hàng dưới che).
 */
describe('ResultsRankingTable · cột thao tác dính mép phải', () => {
  const table = read('src/features/employer-campaigns/components/results/ResultsRankingTable.tsx');
  const css = read('src/index.css');

  it('gắn table-sticky-end cho cả TableHead lẫn TableCell của cột thao tác', () => {
    expect(table).toMatch(/<TableHead className="table-sticky-end">/);
    expect(table).toMatch(/<TableCell className="table-sticky-end">/);
  });

  it('CSS: th/td.table-sticky-end sticky right:0 trong khung glass', () => {
    const rule = css.match(/\.glass-table-container thead th\.table-sticky-end,\s*\.glass-table-container tbody td\.table-sticky-end \{([^}]*)\}/);
    expect(rule).not.toBeNull();
    expect(rule![1]).toMatch(/position:\s*sticky/);
    expect(rule![1]).toMatch(/right:\s*0/);
  });

  it('CSS: hàng đang mở menu được nâng z-index (sticky luôn tạo stacking context)', () => {
    expect(css).toMatch(/tr:has\(\[aria-expanded="true"\]\) td\.table-sticky-end \{\s*z-index:\s*2;/);
  });
});
