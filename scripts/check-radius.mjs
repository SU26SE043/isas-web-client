#!/usr/bin/env node
/**
 * Bo góc theo VAI TRÒ, không theo cảm hứng. Trước khi có lưới này, `src` dùng BẢY giá trị
 * khác nhau (981 chỗ) và ngay trong bộ primitive `Input` đã là 16px còn `Button` 12px —
 * hai thứ luôn đứng cạnh nhau lại khác bo góc.
 *
 * Phạm vi đang gác (cố ý HẸP): bộ primitive + wizard chiến dịch. Mở rộng dần bằng cách
 * thêm đường dẫn vào SCOPES — đừng bật cả `src` một lượt, sẽ đỏ 900+ chỗ và bị tắt đi.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCOPES = ['src/components/ui', 'src/features/employer-campaigns/components/wizard'];
const ALLOWED = new Set(['rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full', 'rounded-none']);
const ROLES = 'control=rounded-lg · nested surface=rounded-xl · surface=rounded-2xl · pill=rounded-full';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const bad = [];
for (const scope of SCOPES) {
  for (const file of walk(join(ROOT, scope))) {
    const text = readFileSync(file, 'utf8');
    text.split('\n').forEach((line, index) => {
      for (const match of line.matchAll(/\brounded-(?:[a-z0-9]+|\[[^\]]+\])/g)) {
        // rounded-t-* / rounded-b-* … là bo một phía, không thuộc thang vai trò
        if (/^rounded-(t|b|l|r|tl|tr|bl|br)(-|$)/.test(match[0])) continue;
        if (!ALLOWED.has(match[0])) {
          bad.push(`${relative(ROOT, file)}:${index + 1}  ${match[0]}`);
        }
      }
    });
  }
}

if (bad.length) {
  console.error(`Bo góc ngoài thang vai trò (${ROLES}):\n`);
  for (const line of bad) console.error('  ' + line);
  console.error(`\n${bad.length} chỗ. Chọn đúng vai trò thay vì thêm giá trị mới.`);
  process.exit(1);
}
console.log(`Radius check passed (${ROLES}).`);
