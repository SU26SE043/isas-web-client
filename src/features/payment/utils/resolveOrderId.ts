import { usesMockData } from '@/shared/mock';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveOrderIdFromSearch(searchParams: URLSearchParams): string {
  return (
    searchParams.get('orderId') ??
    searchParams.get('id') ??
    searchParams.get('orderCode') ??
    ''
  ).trim();
}

export function isResolvableOrderId(orderId: string): boolean {
  if (!orderId) return false;
  if (usesMockData('payment') && orderId.startsWith('order-')) return true;
  return UUID_PATTERN.test(orderId);
}
