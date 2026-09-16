import { useMemo, useState } from 'react';

export const GRANT_CREDITS_MIN = 1;
export const GRANT_CREDITS_MAX = 10_000;
export const GRANT_NOTE_MIN = 3;
export const GRANT_NOTE_MAX = 500;
export const SUBSCRIPTION_DAYS_MAX = 3660;

/**
 * Khoá idempotency neo vào VÂN TAY FORM, không neo vào lần bấm. BE khớp khoá theo `(owner, key)` mà KHÔNG
 * xét `credits`/`planId`/`durationDays` (Q14 · `AdminCreditService.FindOriginalGrantAsync`,
 * `SubscriptionService.GrantAsync`): dùng lại khoá cũ sau khi sửa số là BE trả lại khoản CŨ và bỏ im lặng
 * số mới. Nên: đổi bất kỳ field ⇒ khoá mới; cấp xong ⇒ `rotate()` để lần cấp kế cùng nội dung vẫn là
 * khoản mới (double-click / reload-rồi-gửi-lại trong lúc form chưa đổi ⇒ cùng khoá ⇒ không cấp 2 lần).
 */
export function useIdempotencyKey(fingerprint: string) {
  const [nonce, setNonce] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- nonce cố ý nằm trong deps để xoay khoá sau khi cấp xong
  const key = useMemo(() => crypto.randomUUID(), [fingerprint, nonce]);
  return { key, rotate: () => setNonce((n) => n + 1) };
}

/** `datetime-local` (giờ máy admin) → ISO UTC cho BE; rỗng ⇒ undefined (BE mặc định bây giờ). */
export function localToIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
