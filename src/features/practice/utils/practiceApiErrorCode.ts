import axios from 'axios';

/**
 * Đọc `code` trong body lỗi của Interview API (vd. ATT1 `SESSION_ENDED`, `SESSION_NOT_BEGUN`,
 * `SESSION_TIME_UP`). Một số gateway bọc thêm `{ data: { code, error } }` ⇒ đọc cả lớp lồng.
 */
export function getPracticeApiErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const body = data as Record<string, unknown>;
  if (typeof body.code === 'string' && body.code.trim()) return body.code.trim();
  const nested = body.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const code = (nested as Record<string, unknown>).code;
    if (typeof code === 'string' && code.trim()) return code.trim();
  }
  return null;
}
