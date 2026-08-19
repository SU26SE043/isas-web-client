import {
  CV_ANALYSIS_MAX_REQUIREMENTS,
  CV_REQUIREMENT_MAX_CHARS,
} from './buildCreateCvAnalysisRequest';
import type { RequirementInput } from '../types/cvAnalysis.types';

export type RequirementGroup = 'must' | 'nice';
/** Internal metadata only — never surfaced as a label in the UI. */
export type RequirementOrigin = 'user' | 'ai';

export interface RequirementItem {
  /** Generated on the client; never sent to the API. */
  id: string;
  text: string;
  group: RequirementGroup;
  origin: RequirementOrigin;
  /** Verbatim JD sentence backing an AI suggestion (BE-2). */
  jdQuote?: string | null;
  /** Hash of the JD text the AI suggestion was extracted from. */
  sourceJdHash?: string;
}

/** One AI suggestion before it becomes an owned requirement. */
export interface RequirementSuggestion {
  text: string;
  group: RequirementGroup;
  jdQuote?: string | null;
}

/**
 * Jaccard band where two requirements are "similar but not the same".
 * Inside the band we keep both items instead of guessing which one the user meant.
 * At or above the upper bound the incoming AI item is treated as a duplicate.
 */
export const REQUIREMENT_NEAR_DUPLICATE_MIN = 0.6;
export const REQUIREMENT_NEAR_DUPLICATE_MAX = 0.85;

export { CV_ANALYSIS_MAX_REQUIREMENTS, CV_REQUIREMENT_MAX_CHARS };

/**
 * Dedupe key for a requirement.
 *
 * I6 — the backend already dedupes with
 * `Normalize(FormKC).ToUpperInvariant()` + whitespace collapse
 * (`CvAnalysisService.NormalizeRequirements`). This key must collapse *at least*
 * every pair the backend collapses, otherwise the user sees 12 requirements
 * while the report only scores 10 — a silent mismatch nobody notices.
 *
 * NFKC + case folding mirror the backend; diacritic folding, separator folding
 * and trailing punctuation make the client strictly stricter.
 */
export function normalizeRequirementKey(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    // strip Vietnamese tone/diacritic marks
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    // separators carry no meaning for identity
    .replace(/[/,\-\u2013\u2014]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // trailing sentence punctuation
    .replace(/[.,;:!?\u2026]+$/u, '')
    .trim();
}

function tokenize(key: string): string[] {
  return key.split(' ').filter(Boolean);
}

/** Token-boundary containment — `react` is inside `react hooks`, not inside `reactive`. */
function containsTokens(haystackKey: string, needleKey: string): boolean {
  if (!haystackKey || !needleKey) return false;
  if (haystackKey === needleKey) return false;
  return ` ${haystackKey} `.includes(` ${needleKey} `);
}

export function requirementSimilarity(left: string, right: string): number {
  const leftTokens = new Set(tokenize(normalizeRequirementKey(left)));
  const rightTokens = new Set(tokenize(normalizeRequirementKey(right)));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }
  const union = leftTokens.size + rightTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function createRequirementId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export interface RequirementMergeResult {
  items: RequirementItem[];
  /** New rows appended — what the result strip shows as "đã thêm N". */
  addedCount: number;
  /** Dropped because an equal / contained / near-identical requirement already exists. */
  skippedDuplicateCount: number;
  /** Dropped because the list already holds `maxItems`. */
  skippedOverLimitCount: number;
  /** Dropped because the text was blank or longer than the per-item cap (I3). */
  skippedInvalidCount: number;
  /** Existing AI rows whose text was upgraded to a longer superset. */
  replacedCount: number;
  addedIds: string[];
  replaced: Array<{ id: string; previous: RequirementItem }>;
}

const emptyResult = (items: RequirementItem[]): RequirementMergeResult => ({
  items,
  addedCount: 0,
  skippedDuplicateCount: 0,
  skippedOverLimitCount: 0,
  skippedInvalidCount: 0,
  replacedCount: 0,
  addedIds: [],
  replaced: [],
});

/**
 * Merge AI suggestions into the list the user owns.
 *
 * Rules (plan FE-1):
 * - exact match after normalize → drop the AI item, keep the existing group
 * - containment → keep the longer text, unless the shorter one is the user's
 * - Jaccard in [0.6, 0.85) → keep both, never guess
 * - must/nice conflict → the user's group always wins (never re-grouped here)
 * - over the cap → fill up to `maxItems`, mustHave first, report the rest
 */
export function mergeRequirementSuggestions(params: {
  existing: readonly RequirementItem[];
  incoming: readonly RequirementSuggestion[];
  sourceJdHash?: string;
  maxItems?: number;
  createId?: () => string;
}): RequirementMergeResult {
  const maxItems = params.maxItems ?? CV_ANALYSIS_MAX_REQUIREMENTS;
  const createId = params.createId ?? createRequirementId;
  const result = emptyResult([...params.existing]);
  if (params.incoming.length === 0) return result;

  const keys = result.items.map((item) => normalizeRequirementKey(item.text));

  // mustHave first so the cap keeps the requirements that matter most.
  const ordered = [
    ...params.incoming.filter((item) => item.group === 'must'),
    ...params.incoming.filter((item) => item.group !== 'must'),
  ];

  for (const suggestion of ordered) {
    const text = suggestion.text.trim();
    const key = normalizeRequirementKey(text);
    if (!text || !key || text.length > CV_REQUIREMENT_MAX_CHARS) {
      result.skippedInvalidCount += 1;
      continue;
    }

    let handled = false;
    for (let index = 0; index < result.items.length; index += 1) {
      const existingKey = keys[index];
      if (existingKey === key) {
        // Exact duplicate — the existing row (and its group) is untouched.
        result.skippedDuplicateCount += 1;
        handled = true;
        break;
      }
      if (containsTokens(existingKey, key)) {
        // The existing row is the longer, more specific one.
        result.skippedDuplicateCount += 1;
        handled = true;
        break;
      }
      if (containsTokens(key, existingKey)) {
        if (result.items[index].origin === 'user') {
          // The user's shorter wording wins — AI never rewrites owned text.
          result.skippedDuplicateCount += 1;
          handled = true;
          break;
        }
        result.replaced.push({ id: result.items[index].id, previous: result.items[index] });
        result.items[index] = {
          ...result.items[index],
          text,
          group: suggestion.group,
          jdQuote: suggestion.jdQuote ?? null,
          ...(params.sourceJdHash ? { sourceJdHash: params.sourceJdHash } : {}),
        };
        keys[index] = key;
        result.replacedCount += 1;
        handled = true;
        break;
      }
    }
    if (handled) continue;

    const nearest = result.items.reduce(
      (best, item) => Math.max(best, requirementSimilarity(item.text, text)),
      0,
    );
    if (nearest >= REQUIREMENT_NEAR_DUPLICATE_MAX) {
      result.skippedDuplicateCount += 1;
      continue;
    }

    if (result.items.length >= maxItems) {
      result.skippedOverLimitCount += 1;
      continue;
    }

    const item: RequirementItem = {
      id: createId(),
      text,
      group: suggestion.group,
      origin: 'ai',
      jdQuote: suggestion.jdQuote ?? null,
      ...(params.sourceJdHash ? { sourceJdHash: params.sourceJdHash } : {}),
    };
    result.items.push(item);
    keys.push(key);
    result.addedIds.push(item.id);
    result.addedCount += 1;
  }

  return result;
}

/** Exact (normalized) duplicate lookup used by the manual composer. */
export function findDuplicateRequirement(
  items: readonly RequirementItem[],
  text: string,
  ignoreId?: string,
): RequirementItem | null {
  const key = normalizeRequirementKey(text);
  if (!key) return null;
  return (
    items.find((item) => item.id !== ignoreId && normalizeRequirementKey(item.text) === key) ?? null
  );
}

/**
 * Split the owned list into the API payload groups.
 *
 * Defensive dedupe: the backend walks mustHave before niceToHave and drops the
 * second occurrence, so the client must never emit the same key twice (I6).
 */
export function splitRequirementInputs(items: readonly RequirementItem[]): {
  mustHave: RequirementInput[];
  niceToHave: RequirementInput[];
} {
  const seen = new Set<string>();
  const mustHave: RequirementInput[] = [];
  const niceToHave: RequirementInput[] = [];

  for (const group of ['must', 'nice'] as const) {
    for (const item of items) {
      if (item.group !== group) continue;
      const text = item.text.trim();
      const key = normalizeRequirementKey(text);
      if (!text || !key || seen.has(key)) continue;
      seen.add(key);
      (group === 'must' ? mustHave : niceToHave).push({ text });
    }
  }

  return { mustHave, niceToHave };
}
