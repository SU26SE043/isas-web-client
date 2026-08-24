import type { RadarData } from '../types/result.types';

/**
 * Radar có lớp "lúc bắt đầu" hay không.
 *
 * Chỉ bật khi có ÍT NHẤT một tiêu chí thực sự mang mốc xuất phát. Bật mù sẽ vẽ
 * thêm một series rỗng cùng một mục chú thích không ứng với hình nào trên biểu đồ.
 *
 * `C == null` = tiêu chí mới có một buổi ⇒ KHÔNG có mốc để so, và phải để KHUYẾT
 * chứ không quy về 0 (xem ghi chú trên `RadarData.C`).
 */
export function hasStartLayer(data: readonly RadarData[]): boolean {
  return data.some((item) => item.C != null);
}

/**
 * Ngưỡng có được TÔ NỀN hay không.
 *
 * Hai lớp thì tô được. Ba lớp tô đặc chồng nhau thì không đọc nổi nan nào — mà
 * ngưỡng lại là hằng số theo cấp độ nên nó luôn là một đa giác đều nằm đè lên
 * giữa hình. Vì vậy khi có lớp thứ ba, ngưỡng rút về viền mảnh nét đứt không tô.
 */
export function shouldFillThreshold(data: readonly RadarData[]): boolean {
  return !hasStartLayer(data);
}

/** Số buổi dùng để tính giá trị "gần đây" của một nan; 0 = backend không gửi. */
export function sampleSizeOf(item: RadarData): number {
  return item.recentCount ?? 0;
}
