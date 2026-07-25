import { describe, expect, it } from 'vitest';
import {
  buildUpdateCandidatePayload,
  canEditCandidate,
  candidateCvDownloadName,
  isCandidateInvited,
  isValidCandidateEmail,
} from './campaignCandidateActions';

describe('campaignCandidateActions', () => {
  it('detects invited candidates', () => {
    expect(isCandidateInvited('Invited')).toBe(true);
    expect(isCandidateInvited('Filtered')).toBe(false);
    expect(canEditCandidate({ status: 'Invited' })).toBe(false);
    expect(canEditCandidate({ status: 'Filtered' })).toBe(true);
  });

  it('builds dirty-only patch payload', () => {
    expect(
      buildUpdateCandidatePayload(
        { fullName: 'A', email: 'a@example.com' },
        { fullName: 'A', email: 'a@example.com' },
      ),
    ).toEqual({});

    expect(
      buildUpdateCandidatePayload(
        { fullName: 'A', email: 'a@example.com' },
        { fullName: 'B', email: 'a@example.com' },
      ),
    ).toEqual({ fullName: 'B' });

    expect(
      buildUpdateCandidatePayload(
        { fullName: 'A', email: 'a@example.com' },
        { fullName: 'A', email: 'b@example.com' },
      ),
    ).toEqual({ email: 'b@example.com' });
  });

  it('validates email and sanitizes download name', () => {
    expect(isValidCandidateEmail('bad')).toBe(false);
    expect(isValidCandidateEmail('ok@example.com')).toBe(true);
    expect(candidateCvDownloadName('Nguyễn Văn A')).toBe('Nguyễn-Văn-A-cv.pdf');
    expect(candidateCvDownloadName('a/b:c')).toBe('abc-cv.pdf');
  });
});
