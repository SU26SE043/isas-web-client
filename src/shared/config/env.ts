import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ''),
  VITE_ENABLE_ENTERPRISE_SSO: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === 'true' || value === '1'),
  VITE_SENTRY_DSN: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ''),
  VITE_ENABLE_TIERING_UI: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === 'true' || value === '1'),
  VITE_ENABLE_CAMPAIGN_SLOTS_UI: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === 'true' || value === '1'),
  MODE: z.enum(['development', 'production', 'test']),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

function parseEnv() {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_ENABLE_ENTERPRISE_SSO: import.meta.env.VITE_ENABLE_ENTERPRISE_SSO,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_ENABLE_TIERING_UI: import.meta.env.VITE_ENABLE_TIERING_UI,
    VITE_ENABLE_CAMPAIGN_SLOTS_UI: import.meta.env.VITE_ENABLE_CAMPAIGN_SLOTS_UI,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return result.data;
}

export const env = parseEnv();

/**
 * Gateway origin only (no path). Endpoint modules already include `/api/v1/...`.
 * Strips accidental trailing `/api` or `/api/v1` so URLs never become `/api/api/v1/...`.
 */
export function normalizeApiBaseUrl(value: string | undefined | null): string {
  const raw = (value ?? '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  return raw.replace(/\/api(?:\/v1)?$/i, '');
}

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(env.VITE_API_BASE_URL);
}

export function isDevEnvironment(): boolean {
  return env.DEV;
}

/** Enterprise SAML/OIDC SSO — gated per tenant; enable via VITE_ENABLE_ENTERPRISE_SSO=true */
export function isEnterpriseSsoEnabled(): boolean {
  return env.VITE_ENABLE_ENTERPRISE_SSO;
}

/**
 * Tiering (tier/gói thuê bao/quota tháng) TẠM ẨN khỏi giao diện — chốt 2026-09-17: BE giữ nguyên
 * (`Tiering:Enabled=false` trên prod), FE không bán/không hiện gói thuê bao, tab Tier, form cấp thuê bao,
 * thẻ "Thuê bao hiện tại". Bật lại bằng VITE_ENABLE_TIERING_UI=true — không xoá code, không đổi hợp đồng.
 * Lý do ẩn thay vì để nguyên: catalog prod có 4 gói tier giá 2.000₫ (rác sandbox) và Plus/Pro prod lệch
 * seed (Credit ≠ Metered) — bày ra là bán thứ chưa chốt luật.
 */
export function isTieringUiEnabled(): boolean {
  return env.VITE_ENABLE_TIERING_UI;
}

/**
 * Bước "Khung giờ" (ca thi / sức chứa) trong wizard tạo chiến dịch — TẠM ẨN (chốt 2026-09-17): HR không
 * thấy bước này, Tiếp/Quay lại nhảy qua, Review không hiện bảng ca. BE giữ nguyên (campaign không ca =
 * không ràng buộc — vốn là mặc định). Index bước nội bộ 0–7 KHÔNG đổi (60 chỗ ghi cứng) — chỉ tầng hiển
 * thị bỏ qua. Bật lại bằng VITE_ENABLE_CAMPAIGN_SLOTS_UI=true.
 */
export function isCampaignSlotsUiEnabled(): boolean {
  return env.VITE_ENABLE_CAMPAIGN_SLOTS_UI;
}
