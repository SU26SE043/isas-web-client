import { describe, expect, it } from 'vitest';
import { ACTIVITY_LEVEL_CLASS } from './interviewHeatmapUtils';

/**
 * UX3-F4 — thang biểu đồ nhiệt phải ĐẬM DẦN theo mức hoạt động.
 *
 * Trước UX3, thang là `emerald-950/80 → emerald-700/80 → emerald-500`: đúng khi nền còn TỐI
 * (càng nhiều hoạt động càng sáng), nhưng sản phẩm đổi sang nền sáng ngày 03/09/2026 và không ai
 * kiểm lại. Trên nền trắng nó đọc NGƯỢC — ngày luyện ÍT trông đậm hơn ngày luyện NHIỀU.
 *
 * Đây không phải lỗi thẩm mỹ mà là lỗi làm SAI Ý NGHĨA DỮ LIỆU: người dùng nhìn biểu đồ và rút ra
 * kết luận ngược với sự thật.
 *
 * Mutation đã chạy trước khi viết lưới này: đảo ngược thang về như cũ → 1031/1031 VẪN XANH.
 *
 * Lưới đọc ĐỘ MỜ của token (`bg-success/NN`) thay vì so tên màu, nên đổi token màu vẫn qua được —
 * thứ bị khoá là CHIỀU của thang, không phải màu cụ thể.
 */
const opacityOf = (cls: string): number => {
  const m = cls.match(/\/(\d+)\b/);
  // Mức 0 không có hậu tố độ mờ (nền trung tính) ⇒ coi là 0.
  return m ? Number(m[1]) : 0;
};

describe('UX3-F4 — chiều thang biểu đồ nhiệt', () => {
  it('mức càng cao thì càng đậm', () => {
    const l1 = opacityOf(ACTIVITY_LEVEL_CLASS[1]);
    const l2 = opacityOf(ACTIVITY_LEVEL_CLASS[2]);
    const l3 = opacityOf(ACTIVITY_LEVEL_CLASS[3]);

    expect(
      l1 < l2 && l2 < l3,
      'Thang phải tăng dần: mức 1 < mức 2 < mức 3.\n' +
        `Đang là ${l1} / ${l2} / ${l3} (${ACTIVITY_LEVEL_CLASS[1]}, ${ACTIVITY_LEVEL_CLASS[2]}, ${ACTIVITY_LEVEL_CLASS[3]}).\n` +
        'Thang giảm dần làm người dùng đọc NGƯỢC: ngày luyện ít trông đậm hơn ngày luyện nhiều.',
    ).toBe(true);
  });

  it('mức 0 nhạt hơn mọi mức có hoạt động', () => {
    expect(opacityOf(ACTIVITY_LEVEL_CLASS[0])).toBeLessThan(opacityOf(ACTIVITY_LEVEL_CLASS[1]));
  });

  it('thang dùng token của hệ thống, không dùng pallet Tailwind thô', () => {
    const raw = Object.values(ACTIVITY_LEVEL_CLASS).filter((cls) =>
      /-(emerald|green|violet|blue|red|amber|orange|rose|sky|teal|lime|indigo|purple|cyan|pink|fuchsia)-\d+/.test(cls),
    );
    expect(
      raw,
      'ACTIVITY_LEVEL_CLASS phải dùng token (bg-success/NN). Bậc pallet thô là di sản nền tối —\n' +
        'chính nó làm thang đọc ngược khi sản phẩm đổi sang nền sáng.',
    ).toEqual([]);
  });
});
