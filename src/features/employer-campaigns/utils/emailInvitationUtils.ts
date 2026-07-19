/** Shared email invite validation / parsing (Option 2). */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InvalidEmailReason = 'InvalidFormat' | 'Empty' | 'Duplicate';

export type InvalidEmailItem = {
  value: string;
  reason: InvalidEmailReason;
};

export type ParsedEmailBatch = {
  validEmails: string[];
  invalidEmails: InvalidEmailItem[];
  duplicateEmails: string[];
};

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const normalized = normalizeEmail(value);
  if (!normalized) return false;
  return EMAIL_REGEX.test(normalized);
}

/** Split bulk text on commas, semicolons, newlines, or whitespace. */
export function tokenizeEmailList(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

/**
 * Parse a bulk paste into unique valid emails plus invalid/duplicate buckets.
 * Existing emails (already in the form) are treated as duplicates when re-added.
 */
export function parseEmailBatch(
  raw: string,
  existingNormalized: ReadonlySet<string> = new Set(),
): ParsedEmailBatch {
  const tokens = tokenizeEmailList(raw);
  const validEmails: string[] = [];
  const invalidEmails: InvalidEmailItem[] = [];
  const duplicateEmails: string[] = [];
  const seen = new Set<string>(existingNormalized);

  for (const token of tokens) {
    const normalized = normalizeEmail(token);
    if (!normalized) {
      invalidEmails.push({ value: token, reason: 'Empty' });
      continue;
    }
    if (seen.has(normalized)) {
      duplicateEmails.push(normalized);
      continue;
    }
    if (!isValidEmail(normalized)) {
      invalidEmails.push({ value: normalized, reason: 'InvalidFormat' });
      seen.add(normalized);
      continue;
    }
    seen.add(normalized);
    validEmails.push(normalized);
  }

  return { validEmails, invalidEmails, duplicateEmails };
}

export function mergeUniqueEmails(
  current: readonly string[],
  additions: readonly string[],
): string[] {
  const set = new Set(current.map(normalizeEmail));
  for (const email of additions) {
    const normalized = normalizeEmail(email);
    if (normalized && isValidEmail(normalized)) {
      set.add(normalized);
    }
  }
  return Array.from(set);
}

export function uniqueNormalizedEmails(emails: readonly string[]): string[] {
  return Array.from(new Set(emails.map(normalizeEmail).filter(Boolean)));
}
