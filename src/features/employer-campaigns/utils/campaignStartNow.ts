import type { EmployerCampaignStatus } from '../types/campaignManagement.types';

/**
 * "Mở ngay" (`POST /campaign/{id}/start-now`) — luật phía FE, thuần, không gọi API. Chỉ còn
 * trang CHI TIẾT (campaign đã Active) dùng; ô "Mở ngay khi triển khai" ở wizard đã bỏ 21/09
 * (mặc định D-6 tự tick làm HR hẹn giờ rồi bị mở ngay — xem decisions.md D-6).
 *
 * Mọi blocker ở đây là NGĂN GỌI API (không gọi rồi bắt 4xx). Đối chiếu backend
 * (`CampaignService.StartEarlyAsync`, đọc 2026-09-13): 409 khi không Active · 409 khi đã hết
 * hạn · **409 khi campaign có ca thi** (`CampaignSlots.AnyAsync`) · start_at đã qua ⇒ no-op 200.
 * FE chặn trước cả ba ca đầu và không gửi start-now cho ca no-op — không tốn một lời gọi nào
 * để nhận về câu 409 mà ta đã biết trước.
 */
export type StartNowBlocker = 'hasSlots' | 'notFuture' | 'notActive';

export interface StartNowBlockerInput {
  status: EmployerCampaignStatus | null | undefined;
  startsAt: string | null | undefined;
  slotCount: number;
  now?: Date | number;
}

function toEpoch(now: Date | number | undefined): number {
  if (now == null) return Date.now();
  return typeof now === 'number' ? now : now.getTime();
}

function parseStartsAt(startsAt: string | null | undefined): number | null {
  if (!startsAt?.trim()) return null;
  const value = new Date(startsAt).getTime();
  return Number.isNaN(value) ? null : value;
}

/**
 * Vì sao `hasSlots` đứng TRƯỚC `notFuture` (D-3 "mở sớm phải nhìn ca"): campaign có ca thì giờ
 * mở chung KHÔNG có tác dụng — mỗi ứng viên vào theo ca đã phân — nên kể cả khi giờ mở còn ở
 * tương lai, lý do đúng để báo cho HR vẫn là "ca quyết định", không phải "đã tới giờ". Đảo thứ tự
 * thì campaign có ca + giờ mở đã qua sẽ báo "đã tới giờ, không cần" — câu đó SAI: ứng viên vẫn
 * đang bị ca chặn. `notActive` xếp trước `notFuture` vì campaign Closed/Draft có giờ mở đã qua
 * thì lý do không mở được là trạng thái, không phải mốc giờ.
 */
export function startNowBlocker({ status, startsAt, slotCount, now }: StartNowBlockerInput): StartNowBlocker | null {
  if (slotCount > 0) return 'hasSlots';
  if (status !== 'active') return 'notActive';
  const start = parseStartsAt(startsAt);
  if (start == null || start <= toEpoch(now)) return 'notFuture';
  return null;
}
