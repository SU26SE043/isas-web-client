import { describe, expect, it } from 'vitest';

/**
 * CMP3 — đổi cách nhập JD (tab "Nhập chữ" ↔ "Tải file") phải XOÁ dữ liệu của cách bị bỏ.
 *
 * Hộp thoại xác nhận nói rõ "dữ liệu sẽ mất", nhưng bản trước chỉ đổi `inputMethod`. Hệ quả đo
 * được: gõ JD bằng chữ → chuyển sang tab Tải file → tải PDF lên. `jdText` còn nguyên nên payload
 * mang cả hai; backend theo luật C11 ưu tiên text và đặt `JDFileUrl = null` ⇒ file vừa tải bị
 * VỨT IM LẶNG, trong khi giao diện vẫn báo "đã tải lên". Nặng hơn: bấm "Triển khai" ở bước 8
 * gửi PUT đầy đủ nên nó XOÁ luôn file JD của chiến dịch đã lưu trước đó.
 *
 * Lưới quét mã nguồn theo khuôn questionCapGuard: thứ hỏng là một lời gọi onChange thiếu vế xoá.
 */
const sources = import.meta.glob('/src/features/employer-campaigns/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const read = (suffix: string) => {
  const key = Object.keys(sources).find((path) => path.endsWith(suffix));
  if (!key) throw new Error(`Không tìm thấy ${suffix}`);
  return stripComments(sources[key]);
};

describe('CMP3 — đổi cách nhập JD', () => {
  it('xác nhận đổi tab phải xoá dữ liệu của cách nhập bị bỏ', () => {
    const source = read('/wizard/CampaignJdStep.tsx');
    const body = source.slice(source.indexOf('const confirmMethodChange'));
    const scope = body.slice(0, body.indexOf('setPendingMethod(null)'));
    expect(
      scope.includes("jdText: ''"),
      'chuyển sang tải file phải xoá jdText — nếu không backend ưu tiên text và vứt file.',
    ).toBe(true);
    expect(
      scope.includes('serverUploaded: false'),
      'chuyển sang nhập chữ phải xoá trạng thái file đã tải.',
    ).toBe(true);
  });

  it('luật số năm kinh nghiệm gắn ở bước có ô nhập (bước 7), không phải bước 2', () => {
    // Ô nhập đã dời sang "Cấu hình chi tiết" ở bước 7. Để lỗi ở bước 2 thì bấm Triển khai sẽ
    // đá người dùng về bước 2 — nơi không còn ô nào để sửa.
    const source = read('/utils/validateCampaignWizard.ts');
    const idx = source.indexOf('minYearsInvalid');
    const before = source.slice(0, idx);
    const guard = before.lastIndexOf('if (step ===');
    expect(before.slice(guard, guard + 16)).toContain('step === 6');
  });
});
