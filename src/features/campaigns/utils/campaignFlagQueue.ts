import { CampaignCandidateError, campaignCandidateService } from '../services/campaignCandidate.service';
import type { AllowedFrontendSignalType } from '../types/campaignCandidate.types';

/**
 * Hàng đợi BỀN cho cờ chống gian lận.
 *
 * Trước đây `sendFlag` là fire-and-forget: `void createCampaignFlag(...).catch(() => undefined)`.
 * Mạng chớp một nhịp, tab bị đóng giữa request, hay ứng viên chặn đúng một endpoint trong
 * DevTools — cờ biến mất vĩnh viễn và KHÔNG chỗ nào biết. Mà phía server không có phép đo
 * độc lập nào (CampaignService không có sweeper heartbeat), nên "không có cờ" và "không có
 * vi phạm" trông giống hệt nhau trên màn hình HR.
 *
 * Nên: GHI TRƯỚC, GỬI SAU — cùng bất biến với outbox phía backend. Cờ nằm trong
 * `localStorage` (KHÔNG phải `sessionStorage`: nó phải sống qua lần đóng tab, đó chính là ca
 * đang cần cứu) rồi mới thử gửi; gửi hụt thì thử lại có giãn cách, và lần mở trang sau sẽ
 * đẩy nốt phần còn tồn.
 *
 * ⚠ ĐÁNH ĐỔI ĐÃ BIẾT — hàng đợi này là **at-least-once, không phải exactly-once.** Nếu server
 * đã ghi cờ xong nhưng phản hồi rớt giữa đường, lần thử lại sẽ tạo thêm một dòng ⇒ số đếm của
 * HR nhích lên 1. Chấp nhận có chủ đích: đếm dư một lần thì HR vẫn thấy đúng loại vi phạm, còn
 * mất cờ thì mất hẳn bằng chứng. Muốn exactly-once phải thêm `client_event_id` + UNIQUE ở
 * `session_flags` (đổi backend + migration) — xem ghi chú task, cố ý không làm kèm ở đây.
 */

const STORAGE_KEY = 'isas-campaign-flag-queue';

/** Trần số cờ giữ lại. Buổi thi dài + mất mạng lâu vẫn không được làm phình localStorage. */
const MAX_QUEUE = 200;

/** Quá số lần này thì bỏ cuộc — vòng thử lại vô hạn là cách biến một sự cố thành vòng lặp nóng. */
const MAX_ATTEMPTS = 6;

const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 60_000;

export interface PendingCampaignFlag {
  id: string;
  campaignId: string;
  sessionId: string;
  signalType: AllowedFrontendSignalType;
  note: string;
  attempts: number;
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readQueue(): PendingCampaignFlag[] {
  // localStorage ném trong chế độ ẩn danh / bị chặn cookie ⇒ mọi lối đọc-ghi đều phải bọc.
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PendingCampaignFlag => {
      const f = item as Partial<PendingCampaignFlag> | null;
      return Boolean(
        f && typeof f.id === 'string' && typeof f.campaignId === 'string'
        && typeof f.sessionId === 'string' && typeof f.signalType === 'string',
      );
    });
  } catch {
    return [];
  }
}

function writeQueue(items: PendingCampaignFlag[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-MAX_QUEUE)));
  } catch {
    // Hết quota / bị chặn: không làm gì được, nhưng KHÔNG được ném — cờ là đường phụ,
    // không bao giờ được phép làm hỏng buổi thi của ứng viên.
  }
}

/**
 * Lỗi có đáng thử lại không.
 *
 * Không có `status` = request chưa tới server (mất mạng, bị chặn) ⇒ thử lại.
 * 4xx = server đã trả lời và từ chối (400 loại cờ không hợp lệ, 403 không phải chủ phiên) ⇒
 * thử lại bao nhiêu lần cũng vậy, bỏ. Ngoại lệ 408/429 là "thử lại sau", không phải từ chối.
 */
function shouldRetry(error: unknown): boolean {
  if (!(error instanceof CampaignCandidateError)) return true;
  const { status } = error;
  if (status === undefined) return true;
  if (status === 408 || status === 429) return true;
  return status >= 500;
}

function delayFor(attempts: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1), MAX_DELAY_MS);
}

function scheduleFlush(delayMs: number) {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushCampaignFlagQueue();
  }, delayMs);
}

function dropFlag(id: string) {
  writeQueue(readQueue().filter((f) => f.id !== id));
}

function bumpAttempts(id: string, attempts: number) {
  writeQueue(readQueue().map((f) => (f.id === id ? { ...f, attempts } : f)));
}

/**
 * Đẩy hết phần đang tồn. Gọi được nhiều lần — có khoá chống chạy chồng.
 *
 * 🔑 ĐỌC LẠI hàng đợi ở MỖI vòng, không giữ ảnh chụp. Giữ ảnh chụp rồi ghi đè lúc kết thúc
 * sẽ XOÁ MẤT những cờ được thêm vào trong lúc đang gửi — mà cờ hay đến theo chùm (rời tab rồi
 * dán ngay), nên đó là ca thường gặp chứ không phải hiếm. Test "một cờ hỏng không chặn những
 * cờ phía sau" bắt được đúng lỗi này.
 */
export async function flushCampaignFlagQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    for (;;) {
      const queue = readQueue();
      const head = queue[0];
      if (!head) break;

      try {
        await campaignCandidateService.createCampaignFlag(head.campaignId, head.sessionId, {
          signalType: head.signalType,
          note: head.note,
        });
        dropFlag(head.id);
      } catch (error) {
        const attempts = head.attempts + 1;
        if (!shouldRetry(error) || attempts >= MAX_ATTEMPTS) {
          // Bỏ hẳn cờ này, KHÔNG chặn những cờ phía sau: một cờ hỏng không được
          // khoá cả hàng đợi (đúng bài học poison-message của queue credit).
          dropFlag(head.id);
        } else {
          bumpAttempts(head.id, attempts);
          scheduleFlush(delayFor(attempts));
          break;
        }
      }
    }
  } finally {
    flushing = false;
  }
}

/**
 * Ghi cờ vào hàng đợi rồi thử gửi ngay.
 *
 * Ghi TRƯỚC khi gửi là điểm mấu chốt: tab bị đóng ngay sau đó thì cờ vẫn còn, lần mở sau đẩy nốt.
 */
export function enqueueCampaignFlag(
  campaignId: string,
  sessionId: string,
  signalType: AllowedFrontendSignalType,
  note: string,
): void {
  if (!campaignId || !sessionId) return;
  const queue = readQueue();
  queue.push({ id: newId(), campaignId, sessionId, signalType, note, attempts: 0 });
  writeQueue(queue);
  void flushCampaignFlagQueue();
}

/** Số cờ đang chờ gửi — dùng cho test và chẩn đoán. */
export function pendingCampaignFlagCount(): number {
  return readQueue().length;
}

export function __resetCampaignFlagQueueForTests(): void {
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  flushing = false;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // bỏ qua — xem writeQueue
  }
}
