const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveOrderIdFromSearch(searchParams: URLSearchParams): string {
  return (searchParams.get('orderId') ?? '').trim();
}

export function isValidOrderId(orderId: string): boolean {
  return Boolean(orderId) && UUID_PATTERN.test(orderId);
}

/** @deprecated Use isValidOrderId */
export function isResolvableOrderId(orderId: string): boolean {
  return isValidOrderId(orderId);
}

/**
 * PayOS chuyển hướng về `cancelUrl` kèm `cancel=true&status=CANCELLED` (doc payOS "Return URL").
 * Không đọc hai tham số này thì trang callback không phân biệt được "đã trả" với "đã huỷ" và cứ poll
 * `/status` 45 lần × 2s — mỗi lần là 1 call PayOS từ backend — rồi mới báo thất bại (đo prod:
 * 404/427 dòng bằng chứng đối soát là rác poll). `status` của PayOS là chữ HOA; so không phân biệt hoa/thường.
 */
export function isCancelReturn(searchParams: URLSearchParams): boolean {
  const cancel = (searchParams.get('cancel') ?? '').trim().toLowerCase();
  const status = (searchParams.get('status') ?? '').trim().toUpperCase();
  return cancel === 'true' || status === 'CANCELLED' || status === 'CANCELED';
}
