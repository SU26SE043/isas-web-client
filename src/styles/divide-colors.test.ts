/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd(), 'src');
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.tsx') && !full.endsWith('.test.tsx')) out.push(full);
  }
  return out;
}

/** Màu `border-color` khai trong rule có selector khớp `selector` (rule lá, không lồng). */
function borderColorOf(selector: RegExp): string | null {
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector.test(m[1])) continue;
    const decl = m[2].match(/border-color:\s*([^;]+);/);
    if (decl) return decl[1].trim();
  }
  return null;
}

// Bề rộng/kiểu của divide (không phải màu) và màu Tailwind tự sinh từ bảng mặc định.
const NOT_A_COLOR = /^(x|y)(-\d+|-reverse)?$|^(solid|dashed|dotted|double|none)$/;
const TAILWIND_PALETTE = /^((slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black|transparent|current|inherit)$/;
// Nợ biết trước, NGOÀI phạm vi commit sửa divide-satin: EmployerDashboardSections dùng `divide-subtle` chưa có rule.
// Sửa xong thì gỡ khỏi đây — danh sách này chỉ được co lại.
const KNOWN_UNDEFINED = new Set(['subtle']);

/**
 * `divide-satin` từng không tồn tại (index.css chỉ có `.border-satin`) ⇒ 4 danh sách kẻ vạch bằng currentColor,
 * đo trên dev ra rgb(24, 24, 27) — gần đen trên nền sáng. Tailwind KHÔNG báo lỗi class lạ, nên phải chặn ở đây.
 */
describe('divide-<màu> dùng trong src phải có định nghĩa thật', () => {
  it('mọi divide-<tên> tự đặt đều có rule trong index.css hoặc --color-<tên> trong @theme', () => {
    const missing = new Set<string>();
    for (const file of walk(ROOT)) {
      for (const m of readFileSync(file, 'utf8').matchAll(/(?<![\w-])divide-([a-z][a-z0-9-]*)(?:\/\d+)?(?![\w-])/g)) {
        const name = m[1];
        if (NOT_A_COLOR.test(name) || TAILWIND_PALETTE.test(name) || KNOWN_UNDEFINED.has(name)) continue;
        const defined = new RegExp(`--color-${name}\\s*:`).test(css) || borderColorOf(new RegExp(`\\.divide-${name}\\b`)) !== null;
        if (!defined) missing.add(`divide-${name} (${file.replace(ROOT, 'src')})`);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('divide-satin kẻ vạch đúng màu khung satin (cùng token với .border-satin), áp lên con trừ con cuối', () => {
    const frame = borderColorOf(/^\s*\.border-satin\s*$/);
    expect(frame).toBe('var(--satin-border)');
    expect(borderColorOf(/\.divide-satin\s*>\s*:not\(:last-child\)/)).toBe(frame);
  });
});
