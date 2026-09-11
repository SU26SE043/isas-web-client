/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { translations } from './translations';

/**
 * Rà 3 vai × 2 viewport (2026-09-12) thấy ~40 chuỗi UI lộ jargon nội bộ của tài liệu spec: "the documented rule"
 * (placeholder chưa thay), "Phase 10"/"Giai đoạn 8"/"DoD Phase 14" (mốc kế hoạch), mã màn hình "EMP-CAM-01",
 * "(mock)", tên file "campaign-assessment.md", "(reserve/settle)". Người dùng thật không biết chúng nghĩa gì.
 * Test này quét MỌI giá trị vi + en đã gộp để chuỗi như vậy không tái xuất hiện khi thêm khoá mới.
 */
const FORBIDDEN: Array<[string, RegExp]> = [
  ['placeholder "the documented rule"', /the documented rule/i],
  ['mốc kế hoạch "Phase N"', /\bPhase\s*\d/],
  ['mốc kế hoạch "Giai đoạn N"', /Giai đoạn\s*\d/],
  ['"DoD" (definition of done)', /\bDoD\b/],
  ['mã màn hình spec (EMP-CAM-01, F-NOTIF-003, PAY-BK24…)', /\b(EMP-CAM|F-NOTIF|PAY-BK)-?\d*/],
  ['"(mock)"', /\(mock\)/i],
  ['tên file tài liệu ".md"', /[\w-]+\.md\b/],
  ['jargon "(reserve/settle)"', /reserve\/settle/i],
];

describe('copy guard — giá trị i18n không lộ jargon spec/tài liệu nội bộ', () => {
  it.each(Object.keys(translations))('%s', (lang) => {
    const dict = translations[lang as keyof typeof translations] as Record<string, string>;
    const offenders: string[] = [];
    for (const [key, value] of Object.entries(dict)) {
      for (const [why, re] of FORBIDDEN) {
        if (re.test(value)) offenders.push(`${key} → ${why}: "${value}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

/** Eyebrow viết cứng trong TSX cũng từng là mã spec (`eyebrow="PAY-BK24"`, `eyebrow={config.screenId}`). */
describe('copy guard — eyebrow trong TSX không phải mã màn hình', () => {
  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (full.endsWith('.tsx') && !full.endsWith('.test.tsx')) out.push(full);
    }
    return out;
  }
  it('không có eyebrow="<MÃ-SPEC>" hay eyebrow={…screenId}', () => {
    const root = resolve(process.cwd(), 'src');
    const offenders: string[] = [];
    for (const file of walk(root)) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/eyebrow=(?:"([^"]*)"|\{([^}]*)\})/g)) {
        const literal = m[1];
        const expr = m[2] ?? '';
        if ((literal && /^[A-Z]{1,5}-[A-Z0-9-]+$/.test(literal)) || /screenId|screenByScope/.test(expr)) {
          offenders.push(`${file.replace(root, 'src')}: ${m[0]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
