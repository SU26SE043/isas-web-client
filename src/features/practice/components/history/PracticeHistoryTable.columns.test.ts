/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Đo trên dev 1280px: cột Lĩnh vực chiếm ~1/3, các ô ngày/giờ/điểm bẻ thành 2 dòng. Cột tiêu đề là cột co
 * giãn duy nhất (min 14rem, max 24rem); mọi ô số/ngày/thao tác không bẻ dòng. jsdom không layout ⇒ khoá cấu trúc.
 */
describe('PracticeHistoryTable — cột số không bẻ dòng', () => {
  const src = readFileSync(resolve(process.cwd(), 'src/features/practice/components/history/PracticeHistoryTable.tsx'), 'utf8');
  it('các ô ngày/giờ/điểm/thao tác đều whitespace-nowrap', () => {
    const cells = [...src.matchAll(/<TableCell className="([^"]*)"/g)].map((m) => m[1]);
    const nowrap = cells.filter((c) => /\bwhitespace-nowrap\b/.test(c));
    expect(nowrap).toHaveLength(5);
  });
  it('cột tiêu đề có sàn/trần bề rộng; bảng không rộng hơn 860px', () => {
    expect(src).toMatch(/TableHead className="min-w-\[14rem\]"/);
    expect(src).toMatch(/TableCell className="max-w-\[24rem\]"/);
    expect(src).toMatch(/min-w-\[860px\]/);
    expect(src).not.toMatch(/min-w-\[900px\]/);
  });
});
