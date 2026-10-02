import axios from 'axios';
import type { CampaignUpdateRequest } from '../types/campaign.api.types';
import type { EmployerCampaignStatus } from '../types/campaignManagement.types';
import { CAMPAIGN_MAX_ATTEMPT_OPTIONS } from './campaignAttemptRules';

/**
 * ATT1-F2 — HR tăng "số lần làm tối đa" ở trang chi tiết khi chiến dịch đã triển khai.
 * Wizard /edit từ chối chiến dịch không ở Draft ⇒ đường sửa khi Active nằm ở đây, không ở wizard.
 */

/** [C2] Active chỉ được TĂNG ⇒ chỉ liệt kê giá trị LỚN HƠN giá trị đang lưu. */
export function increaseMaxAttemptsOptions(current: number): number[] {
  return CAMPAIGN_MAX_ATTEMPT_OPTIONS.filter((option) => option > current);
}

/** Nút "Tăng số lần" chỉ có khi Active và còn chỗ để tăng (đang < 3). Closed/Archived/Paused chỉ hiển thị. */
export function canIncreaseMaxAttempts(status: EmployerCampaignStatus, current: number): boolean {
  return status === 'active' && increaseMaxAttemptsOptions(current).length > 0;
}

/**
 * Body PUT /api/v1/campaign/{id} ĐÚNG hai khoá:
 * - `title` BẮT BUỘC — Backend coi title là trường bắt buộc, thiếu ⇒ 400 [C2].
 * - KHÔNG gửi field nào khác: PUT là partial, gửi thừa (vd. timeLimitMinutes) dễ dính 409 của khoá khác [C3].
 */
export function buildIncreaseMaxAttemptsRequest(title: string, maxAttempts: number): CampaignUpdateRequest {
  return { title, maxAttempts };
}

/** 409 mang `code` này ⇒ hiện NGUYÊN lời server (`error`) trong hộp thoại. */
const SERVER_MESSAGE_CODES: ReadonlySet<string> = new Set(['MAX_ATTEMPTS_DECREASE', 'TIME_LIMIT_LOCKED']);

function errorBody(error: unknown): Record<string, unknown> | null {
  if (!axios.isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const body = data as Record<string, unknown>;
  // Một số gateway bọc thêm `{ data: { code, error } }` (cùng cách `getDeployErrorData` đọc).
  const nested = body.data;
  if (typeof body.code !== 'string' && nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return body;
}

/**
 * Lời server cần hiện nguyên văn, hoặc `null` ⇒ caller dùng câu i18n chung.
 * - `code` = MAX_ATTEMPTS_DECREASE / TIME_LIMIT_LOCKED ⇒ `error` của server.
 * - 409 khác có `error` (vd. Closed/Archived đổi giá trị [C2] — không có `code`) ⇒ cũng là lời server,
 *   vì hộp thoại không có câu riêng nào đúng hơn cho nó.
 * - Còn lại (5xx, mạng, 409 không có `error`) ⇒ `null`.
 */
export function getMaxAttemptsUpdateServerMessage(error: unknown): string | null {
  const body = errorBody(error);
  const message = typeof body?.error === 'string' && body.error.trim() ? body.error : null;
  if (!message) return null;
  const code = typeof body?.code === 'string' ? body.code : '';
  if (SERVER_MESSAGE_CODES.has(code)) return message;
  return axios.isAxiosError(error) && error.response?.status === 409 ? message : null;
}
