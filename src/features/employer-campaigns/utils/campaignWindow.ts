/**
 * Cửa sổ thi của chiến dịch (`startsAt` → `expiresAt`) — luật thuần, dùng chung cho validate
 * bước 1 và mục chặn ở bước Kiểm tra, để hai chỗ không nói hai luật.
 *
 * Vì sao cần: nháp lưu rồi để đó vài ngày, hạn nộp trôi qua, HR quay lại bấm Triển khai ⇒
 * BE `PUT`/`publish` KHÔNG chặn hạn đã qua (chỉ `POST` chặn) ⇒ chiến dịch Active mà mọi lời
 * mời chết ngay lúc gửi. Chặn ở FE trước khi HR đi hết wizard.
 */
export function parseCampaignInstant(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/** Hạn nộp ĐÃ qua (`expiresAt <= now`). Chuỗi rỗng/hỏng ⇒ false — luật "bắt buộc" lo ca đó. */
export function isCampaignExpiryPast(expiresAt: string | null | undefined, now: number = Date.now()): boolean {
  const expires = parseCampaignInstant(expiresAt);
  return expires != null && expires <= now;
}
