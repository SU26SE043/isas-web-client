import type { EmployerCampaignStatus } from '../types/campaignManagement.types';

/**
 * "Mở ngay" (`POST /campaign/{id}/start-now`) — luật phía FE, thuần, không gọi API.
 *
 * Mọi blocker ở đây là NGĂN GỌI API (không gọi rồi bắt 4xx). Đối chiếu backend
 * (`CampaignService.StartEarlyAsync`, đọc 2026-09-13): 409 khi không Active · 409 khi đã hết
 * hạn · **409 khi campaign có ca thi** (`CampaignSlots.AnyAsync`) · start_at đã qua ⇒ no-op 200.
 * FE chặn trước cả ba ca đầu và không gửi start-now cho ca no-op — không tốn một lời gọi nào
 * để nhận về câu 409 mà ta đã biết trước.
 */
export type StartNowBlocker = 'hasSlots' | 'notFuture' | 'notActive';

/** D-6: hẹn mở ≤ 24h ⇒ mặc định bật "Mở ngay khi triển khai". */
export const START_NOW_DEFAULT_WINDOW_MS = 24 * 60 * 60 * 1000;

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

/**
 * D-6 — mặc định bật khi giờ mở còn ở tương lai và cách hiện tại ≤ 24h. Đã qua / không có /
 * xa hơn 24h ⇒ false. Ngưỡng ĐÚNG 24h vẫn tính là "≤" (bật); quá 1 phút ⇒ tắt.
 */
export function defaultStartNow(startsAt: string | null | undefined, now?: Date | number): boolean {
  const start = parseStartsAt(startsAt);
  if (start == null) return false;
  const delta = start - toEpoch(now);
  return delta > 0 && delta <= START_NOW_DEFAULT_WINDOW_MS;
}

export interface ResolveStartNowInput {
  /** Lựa chọn tường minh của HR ở bước Review; `null` = chưa đụng checkbox. */
  choice: boolean | null;
  /** Bước Review đã thấy blocker (có ca / đã tới giờ) ⇒ KHÔNG gửi start-now dù HR từng tick. */
  blocked: boolean;
  startsAt: string | null | undefined;
  now?: Date | number;
}

/** Giá trị `startNow` thật sự gửi cho `deployCampaign`: blocker thắng, rồi tới HR, rồi mặc định D-6. */
export function resolveStartNowOnDeploy({ choice, blocked, startsAt, now }: ResolveStartNowInput): boolean {
  if (blocked) return false;
  return choice ?? defaultStartNow(startsAt, now);
}

/**
 * Khoá định danh lựa chọn "Mở ngay" của MỘT lượt wizard: id nháp (hoặc `new` khi chưa có nháp)
 * + giờ mở. Ghép cả giờ mở để lựa chọn cũ không "thơm lây" sang campaign khác mở cùng scope
 * `new`, và để đổi giờ mở ở bước 1 thì mặc định D-6 được tính lại thay vì giữ tick cũ.
 */
export function startNowChoiceKey(draftId: string | null | undefined, startsAt: string | null | undefined): string {
  return `${draftId?.trim() || 'new'}|${startsAt ?? ''}`;
}
