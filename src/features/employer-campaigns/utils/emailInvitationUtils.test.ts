import { describe, expect, it } from 'vitest';
import {
  isValidEmail,
  mergeUniqueEmails,
  normalizeEmail,
  parseEmailBatch,
  tokenizeEmailList,
  uniqueNormalizedEmails,
  emailAppearsInCv,
  hasValidUniqueEmailSet,
} from './emailInvitationUtils';

describe('emailInvitationUtils', () => {
  it('normalizes trim and lowercase', () => {
    expect(normalizeEmail('  Candidate@Example.COM ')).toBe('candidate@example.com');
  });

  it('validates basic email formats without being overly strict', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('dev+tag@company.io')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
  });

  it('tokenizes commas, semicolons, newlines, and whitespace', () => {
    expect(
      tokenizeEmailList('a@x.com\nb@x.com, c@x.com;d@x.com  e@x.com'),
    ).toEqual(['a@x.com', 'b@x.com', 'c@x.com', 'd@x.com', 'e@x.com']);
  });

  it('parses batch: trim, lowercase, dedupe, and classify invalid', () => {
    const parsed = parseEmailBatch(
      'A@X.com, a@x.com\nbad\n  c@y.com ;',
    );
    expect(parsed.validEmails).toEqual(['a@x.com', 'c@y.com']);
    expect(parsed.duplicateEmails).toEqual(['a@x.com']);
    expect(parsed.invalidEmails).toEqual([{ value: 'bad', reason: 'InvalidFormat' }]);
  });

  it('treats emails already in the form as duplicates', () => {
    const parsed = parseEmailBatch('new@x.com, old@x.com', new Set(['old@x.com']));
    expect(parsed.validEmails).toEqual(['new@x.com']);
    expect(parsed.duplicateEmails).toEqual(['old@x.com']);
  });

  it('does not add empty tokens', () => {
    expect(parseEmailBatch(',,\n  \n;').validEmails).toEqual([]);
  });

  it('merges unique emails', () => {
    expect(mergeUniqueEmails(['a@x.com'], ['A@X.com', 'b@x.com'])).toEqual([
      'a@x.com',
      'b@x.com',
    ]);
  });

  it('dedupes payload emails', () => {
    expect(uniqueNormalizedEmails(['A@x.com', 'a@x.com', 'b@x.com'])).toEqual([
      'a@x.com',
      'b@x.com',
    ]);
  });

  it('detects an exact normalized email in CV text', () => {
    expect(emailAppearsInCv('Candidate@Example.COM', 'Email: candidate@example.com')).toBe(true);
  });

  it('does not flag an email absent from CV text', () => {
    expect(emailAppearsInCv('candidate@example.com', 'Email: other@example.com')).toBe(false);
  });

  it('does not flag when CV text is unavailable', () => {
    expect(emailAppearsInCv('candidate@example.com', null)).toBe(false);
  });

  it('accepts a complete unique email set', () => {
    expect(hasValidUniqueEmailSet(['a@example.com', 'b@example.com'])).toBe(true);
  });

  it('rejects an empty email set', () => {
    expect(hasValidUniqueEmailSet([])).toBe(false);
  });

  it('rejects a missing email row', () => {
    expect(hasValidUniqueEmailSet(['a@example.com', ''])).toBe(false);
  });

  it('rejects malformed email rows', () => {
    expect(hasValidUniqueEmailSet(['a@example.com', 'not-an-email'])).toBe(false);
  });

  it('rejects duplicate email rows case-insensitively', () => {
    expect(hasValidUniqueEmailSet(['a@example.com', 'A@EXAMPLE.COM'])).toBe(false);
  });
});
