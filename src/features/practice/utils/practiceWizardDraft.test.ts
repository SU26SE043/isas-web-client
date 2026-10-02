// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PRACTICE_WIZARD_DRAFT_TTL_MS,
  safeCandidateReturnTo,
  savePracticeWizardDraft,
  takePracticeWizardDraft,
  type PracticeWizardDraft,
} from './practiceWizardDraft';

const draft: PracticeWizardDraft = {
  jobCategory: 'BE', cvId: 'cv-42', jdId: 'jd-9', jdText: 'A detailed JD', jdTab: 'text',
  timeLimitSec: 240, questionCount: 8, seniority: 'Senior', adaptiveEnabled: false,
  maxDeepPerQuestion: 2, focusTrackingEnabled: true, language: 'en',
};

beforeEach(() => { sessionStorage.clear(); vi.spyOn(Date, 'now').mockReturnValue(1_780_358_400_000); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); sessionStorage.clear(); });

describe('practice wizard draft', () => {
  it('restores every user choice once for the same user without storing file contents', () => {
    expect(savePracticeWizardDraft('user-1', draft)).toBe(true);
    expect(sessionStorage.getItem('isas-practice-wizard-draft')).not.toContain('File(');
    expect(takePracticeWizardDraft('user-1')).toEqual(draft);
    expect(takePracticeWizardDraft('user-1')).toBeNull();
  });

  it('deletes an expired draft', () => {
    savePracticeWizardDraft('user-1', draft);
    vi.mocked(Date.now).mockReturnValue(1_780_358_400_000 + PRACTICE_WIZARD_DRAFT_TTL_MS + 1);
    expect(takePracticeWizardDraft('user-1')).toBeNull();
    expect(sessionStorage.getItem('isas-practice-wizard-draft')).toBeNull();
  });

  it('deletes a draft that belongs to another user', () => {
    savePracticeWizardDraft('user-1', draft);
    expect(takePracticeWizardDraft('user-2')).toBeNull();
    expect(sessionStorage.getItem('isas-practice-wizard-draft')).toBeNull();
  });

  it('keeps the wizard running when sessionStorage throws', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    });
    expect(savePracticeWizardDraft('user-1', draft)).toBe(false);
    expect(takePracticeWizardDraft('user-1')).toBeNull();
  });
});

describe('candidate return path', () => {
  it('accepts only candidate-owned local paths', () => {
    expect(safeCandidateReturnTo('/candidate/practice/setup')).toBe('/candidate/practice/setup');
    expect(safeCandidateReturnTo('https://example.com')).toBeNull();
    expect(safeCandidateReturnTo('//example.com/candidate/')).toBeNull();
    expect(safeCandidateReturnTo('/practice')).toBeNull();
    expect(safeCandidateReturnTo('/candidate/\\evil.example')).toBeNull();
  });
});
