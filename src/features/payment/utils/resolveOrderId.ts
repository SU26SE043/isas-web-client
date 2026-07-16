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
