#!/usr/bin/env node
/**
 * Bo góc theo VAI TRÒ, không theo cảm hứng. Trước khi có lưới này, `src` dùng BẢY giá trị
 * khác nhau và ngay trong bộ primitive `Input` đã là 16px còn `Button` 12px — hai thứ luôn
 * đứng cạnh nhau lại khác bo góc.
 *
 * Phạm vi gác: CẢ `src`. (Bản đầu của file này ghi "bật cả src sẽ đỏ 900+ chỗ" — SAI: con số
 * đó đếm mọi `rounded-*` kể cả hợp lệ. Số VI PHẠM thật lúc mở scope là 68, đã dọn hết.)
 *
 * Ngoại lệ: đặt `radius-exempt: <lý do>` trong comment ngay trên dòng, hoặc cuối chính dòng
 * đó. Dùng cho những vật thể KHÔNG thuộc bốn vai trò — mark văn bản, ô data-viz — nơi ép lên
 * thang sẽ đổi luôn ý nghĩa hình (ô heatmap 11px + bán kính 12px bị kẹp thành HÌNH TRÒN).
 * Bắt buộc có lý do; `radius-exempt` trống không được chấp nhận.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCOPES = ['src'];
const ALLOWED = new Set(['rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full', 'rounded-none']);
const ROLES = 'control=rounded-lg · nested surface=rounded-xl · surface=rounded-2xl · pill=rounded-full';
const EXEMPT = /radius-exempt:\s*\S/;

// Đang có người sửa song song — vi phạm ở đây CẢNH BÁO chứ không chặn. Dọn danh sách này
// ngay khi nhánh kia merge; để lâu là lưới có lỗ mà không ai nhớ.
const PENDING = new Set([
  'src/layouts/DashboardLayout.tsx',
  'src/layouts/AdminDashboardLayout.tsx',
  'src/layouts/candidateDashboardNav.tsx',
]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

// Marker được phép nằm ở chính dòng đó hoặc trong 3 dòng ngay trên — lý do thường dài hơn
// một dòng, và cú pháp comment JSX nhiều dòng (`{/* … */}`) không có tiền tố nhận dạng được
// ở dòng giữa. Cửa sổ 3 dòng là đủ hẹp: chuỗi `radius-exempt:` không xuất hiện tình cờ.
function exemptedNear(lines, index) {
  for (let i = Math.max(0, index - 3); i <= index; i++) {
    if (EXEMPT.test(lines[i] ?? '')) return true;
  }
  return false;
}

const bad = [];
const pending = [];
for (const scope of SCOPES) {
  for (const file of walk(join(ROOT, scope))) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(/\brounded-(?:[a-z0-9]+|\[[^\]]+\])/g)) {
        // rounded-t-* / rounded-b-* … là bo một phía, không thuộc thang vai trò
        if (/^rounded-(t|b|l|r|tl|tr|bl|br)(-|$)/.test(match[0])) continue;
        if (ALLOWED.has(match[0])) continue;
        if (exemptedNear(lines, index)) continue;
        (PENDING.has(rel) ? pending : bad).push(`${rel}:${index + 1}  ${match[0]}`);
      }
    });
  }
}

if (pending.length) {
  console.warn(`Chưa gác (file đang có agent khác sửa) — ${pending.length} chỗ:`);
  for (const line of pending) console.warn('  ' + line);
  console.warn('');
}

if (bad.length) {
  console.error(`Bo góc ngoài thang vai trò (${ROLES}):\n`);
  for (const line of bad) console.error('  ' + line);
  console.error(`\n${bad.length} chỗ. Chọn đúng vai trò thay vì thêm giá trị mới.`);
  process.exit(1);
}
console.log(`Radius check passed (${ROLES}).`);
