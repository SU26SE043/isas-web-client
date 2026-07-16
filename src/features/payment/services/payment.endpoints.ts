/**
 * PaymentService — public gateway paths.
 *
 * Final URL = `${VITE_API_BASE_URL}` + path below.
 * `VITE_API_BASE_URL` must be origin only (never `.../api`).
 *
 * Spec:
 * - GET /api/v1/payment/package — public catalog → PackageResponse[]
 * - GET /api/v1/payment/package/{id} — public package detail
 * - POST /api/v1/payment/order — create order → OrderResponse (checkoutUrl on create)
 * - GET /api/v1/payment/order/{id} — order detail (checkoutUrl null)
 * - GET /api/v1/payment/order/{id}/status — poll payment status string
 */
const PAYMENT_API_PREFIX = '/api/v1/payment';

export const paymentEndpoints = {
  listPackages: `${PAYMENT_API_PREFIX}/package`,
  getPackage: (id: string) => `${PAYMENT_API_PREFIX}/package/${encodeURIComponent(id)}`,
  createOrder: `${PAYMENT_API_PREFIX}/order`,
  getOrder: (id: string) => `${PAYMENT_API_PREFIX}/order/${encodeURIComponent(id)}`,
  getOrderStatus: (id: string) =>
    `${PAYMENT_API_PREFIX}/order/${encodeURIComponent(id)}/status`,
} as const;
