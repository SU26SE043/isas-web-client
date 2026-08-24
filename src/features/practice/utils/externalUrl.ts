/**
 * Chỉ cho phép link ra ngoài bằng http(s).
 *
 * Tách ra dùng chung vì đây là guard AN TOÀN (chặn `javascript:`, `data:`…), mà
 * guard an toàn tồn tại hai bản sao thì sớm muộn chỉ một bản được vá — bản kia
 * hỏng trong im lặng. Trước file này, `LearningResourceList` giữ một bản riêng.
 */
export function isSafeExternalUrl(value: string | null | undefined): value is string {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
