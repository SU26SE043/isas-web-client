import { CvAnalysisError, type CvAnalysisErrorCode } from '../services/cvAnalysis.service';

/**
 * Which call failed. The same HTTP code means different things per step:
 * a 404 while extracting requirements is "we could not read the JD", not
 * "the analysis was not found" (J7).
 */
export type JdErrorContext = 'uploadCv' | 'uploadJd' | 'extractRequirements' | 'analyze';

export interface ResolvedJdError {
  /** Localized, safe to render. Never a raw transport string (P1). */
  message: string;
  code: CvAnalysisErrorCode;
  status?: number;
  /** Seconds to wait before retrying, from the `Retry-After` header on 429. */
  retryAfterSeconds: number | null;
  /** Whether offering a "Try again" affordance makes sense. */
  retryable: boolean;
  /** True when the copy came from the backend instead of a translation. */
  fromServer: boolean;
}

const RETRYABLE_CODES = new Set<CvAnalysisErrorCode>([
  'aiBusy',
  'rateLimited',
  'serverError',
  'timeout',
  'unknown',
]);

/**
 * Transport noise that must never reach a Vietnamese UI (P1) — real users
 * have seen `Request failed with status code 404` rendered as an error banner.
 */
const TECHNICAL_MESSAGE_PATTERNS: RegExp[] = [
  /^request failed with status code/i,
  /^network error/i,
  /^timeout of \d+\s*ms exceeded/i,
  /^socket hang up/i,
  /^(canceled|cancelled|aborted)$/i,
  /^err_[a-z_]+$/i,
  /^[A-Z][A-Z0-9_]{3,}$/,
  /^\s*[[{<]/,
  /^https?:\/\//i,
  /\n\s+at\s/,
];

/** A backend message is only shown when it reads like a sentence for a human. */
export function isHumanReadableMessage(message: unknown): message is string {
  if (typeof message !== 'string') return false;
  const trimmed = message.trim();
  if (trimmed.length < 8 || trimmed.length > 300) return false;
  if (!/\s/.test(trimmed)) return false;
  if (!/\p{L}/u.test(trimmed)) return false;
  return !TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function translate(t: (key: string) => string, key: string): string | null {
  const value = t(key);
  return value && value !== key ? value : null;
}

/**
 * Map any thrown value to copy the user can act on.
 *
 * Order: context + code translation → a human sentence from the backend →
 * the translated fallback for this context. The generic `cv.error.*` keys are
 * deliberately not consulted: they are worded for the analysis call and are
 * what made a JD extraction failure read "Không tìm thấy dữ liệu phân tích".
 */
export function resolveJdError(
  error: unknown,
  context: JdErrorContext,
  t: (key: string) => string,
): ResolvedJdError {
  const cvError = error instanceof CvAnalysisError ? error : null;
  const code: CvAnalysisErrorCode = cvError?.code ?? 'unknown';
  const serverMessage = cvError?.serverMessage ?? null;

  const translated = translate(t, `cv.jdError.${context}.${code}`);
  const humanServerMessage = isHumanReadableMessage(serverMessage) ? serverMessage.trim() : null;
  const message =
    translated ?? humanServerMessage ?? t(`cv.jdError.${context}.fallback`);

  return {
    message,
    code,
    status: cvError?.status,
    retryAfterSeconds: cvError?.retryAfterSeconds ?? null,
    retryable: RETRYABLE_CODES.has(code),
    fromServer: translated === null && humanServerMessage !== null,
  };
}

/** Convenience for call sites that only render the sentence. */
export function resolveJdErrorMessage(
  error: unknown,
  context: JdErrorContext,
  t: (key: string) => string,
): string {
  return resolveJdError(error, context, t).message;
}
