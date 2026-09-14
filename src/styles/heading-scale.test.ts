/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd(), 'src');
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

/**
 * Trước đây index.css có `@media (max-width: 768px) { .heading-primary { font-size: clamp(1.75rem, …) } }`
 * nằm NGOÀI mọi @layer ⇒ ở mobile mọi h1 đều 28px bất kể `text-lg`/`text-2xl` viết cạnh nó (đo 375px:
 * 74/74 h1 = 28px), và tiêu đề dài (bài học 7 dòng, campaign 4 dòng) không co lại được. Khối đó đã bị xoá;
 * đổi lại, cỡ chữ MOBILE của heading-primary phải do class quyết định và không được lớn hơn text-3xl (30px ≈
 * 28px hôm qua) — cỡ 4xl/5xl chỉ được bật từ breakpoint `sm:` trở lên.
 */
describe('heading-primary: cỡ chữ mobile do class quyết định, không có clamp() toàn cục', () => {
  it('index.css không còn ép font-size cho .heading-primary/.heading-secondary trong media query', () => {
    const css = read('src/index.css');
    expect(css).not.toMatch(/@media[^{]*\{[^}]*\.heading-(primary|secondary)\s*\{[^}]*font-size/s);
  });

  it('không heading-primary nào mang text-4xl/5xl/6xl KHÔNG tiền tố breakpoint', () => {
    const offenders: string[] = [];
    for (const file of walk(ROOT)) {
      if (file.endsWith('.test.tsx')) continue;
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
        const cls = m[1] ?? m[2] ?? '';
        if (!/\bheading-primary\b/.test(cls)) continue;
        if (/(?<![\w:-])text-(4xl|5xl|6xl|\[)/.test(cls)) offenders.push(`${file.replace(ROOT, 'src')}: ${cls}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
