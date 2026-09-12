/** Điểm % gọn: 44.4 / 66 / 100 — làm tròn 1 chữ số thập phân. Tách file để VerdictBlock và Result cùng dùng, không import vòng. */
export function formatPct(value: number): string {
  return `${Math.round(value * 10) / 10}`;
}
