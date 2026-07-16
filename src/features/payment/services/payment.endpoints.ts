/**
 * PaymentService — public gateway paths.
 *
 * Final URL = `${VITE_API_BASE_URL}` + path below.
 * `VITE_API_BASE_URL` must be origin only (never `.../api`).
 *
 * Spec:
 * - GET /api/v1/payment/package — public catalog → PackageResponse[]
 * - GET /api/v1/payment/package/{id} — public package detail
 */
const PAYMENT_API_PREFIX = '/api/v1/payment';

export const paymentEndpoints = {
  listPackages: `${PAYMENT_API_PREFIX}/package`,
  getPackage: (id: string) => `${PAYMENT_API_PREFIX}/package/${encodeURIComponent(id)}`,
} as const;
