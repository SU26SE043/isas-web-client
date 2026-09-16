/** Định dạng số dùng chung cho dashboard/báo cáo admin. */
export const compactAmount = (value: number): string => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(absolute >= 10_000_000_000 ? 0 : 1)}B`;
  if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(absolute >= 10_000_000 ? 0 : 1)}M`;
  if (absolute >= 1_000) return `${(value / 1_000).toFixed(absolute >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(value));
};

export const formatUsd = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);

/** Bảng hẹp: `$2.30` thay `2,30 US$` (vi-VN in hậu tố 4 ký tự làm cột bị cắt — đo trên dev 2026-09-17). */
export const formatUsdShort = (value: number): string => `$${value.toFixed(value < 1 ? 3 : 2)}`;

/** Token đếm hàng triệu ⇒ K/M cho dễ đọc; số nhỏ giữ nguyên có phân cách. */
export const formatTokens = (value: number, locale: string): string =>
  value >= 10_000 ? compactAmount(value) : new Intl.NumberFormat(locale).format(value);

/** Giây audio → "12,3 phút" (chép lời tính tiền theo phút). */
export const formatAudioMinutes = (seconds: number, locale: string): string =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(seconds / 60);

export const formatDurationMs = (value: number | null | undefined, locale: string): string =>
  value === null || value === undefined ? '—' : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} ms`;

export const formatPeriodLabel = (iso: string, groupBy: 'day' | 'month' | 'hour', locale: string): string =>
  new Intl.DateTimeFormat(locale, groupBy === 'month' ? { month: 'short', year: 'numeric' } : groupBy === 'hour' ? { hour: '2-digit', day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short' }).format(new Date(iso));
