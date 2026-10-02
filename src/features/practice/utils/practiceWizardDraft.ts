import type { PracticeJobCategory, PracticeSeniority, PracticeTimeLimitSec } from '../types/b2cPracticeSession.types';

const STORAGE_KEY = 'isas-practice-wizard-draft';
export const PRACTICE_WIZARD_DRAFT_TTL_MS = 2 * 60 * 60 * 1000;

export interface PracticeWizardDraft {
  jobCategory: PracticeJobCategory;
  cvId: string | null;
  jdId: string | null;
  jdText: string;
  jdTab: 'file' | 'text';
  timeLimitSec: PracticeTimeLimitSec;
  questionCount: number;
  seniority: PracticeSeniority | null;
  adaptiveEnabled: boolean;
  maxDeepPerQuestion: number | null;
  focusTrackingEnabled: boolean;
  language: 'vi' | 'en';
}

interface StoredDraft {
  userId: string;
  expiresAt: number;
  draft: PracticeWizardDraft;
}

function clearStoredDraft(): void {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be blocked. */ }
}

export function clearPracticeWizardDraft(): void {
  clearStoredDraft();
}

export function savePracticeWizardDraft(userId: string | null | undefined, draft: PracticeWizardDraft): boolean {
  if (!userId) return false;
  try {
    const stored: StoredDraft = { userId, expiresAt: Date.now() + PRACTICE_WIZARD_DRAFT_TTL_MS, draft };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}

export function takePracticeWizardDraft(userId: string | null | undefined): PracticeWizardDraft | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    clearStoredDraft();
    const stored = JSON.parse(value) as Partial<StoredDraft>;
    const draft = stored.draft;
    if (!userId || stored.userId !== userId || typeof stored.expiresAt !== 'number' || stored.expiresAt <= Date.now() || !draft) return null;
    if (!['FE', 'BE', 'BA'].includes(draft.jobCategory)
      || !['file', 'text'].includes(draft.jdTab)
      || ![60, 120, 240].includes(draft.timeLimitSec)
      || !Number.isInteger(draft.questionCount) || draft.questionCount < 1 || draft.questionCount > 20
      || ![null, 'Fresher', 'Junior', 'Middle', 'Senior'].includes(draft.seniority)
      || !['vi', 'en'].includes(draft.language)
      || typeof draft.jdText !== 'string' || typeof draft.adaptiveEnabled !== 'boolean'
      || typeof draft.focusTrackingEnabled !== 'boolean'
      || (draft.cvId !== null && typeof draft.cvId !== 'string')
      || (draft.jdId !== null && typeof draft.jdId !== 'string')
      || (draft.maxDeepPerQuestion !== null && (!Number.isInteger(draft.maxDeepPerQuestion) || draft.maxDeepPerQuestion < 0))) return null;
    return draft;
  } catch {
    clearStoredDraft();
    return null;
  }
}

/** Only candidate-owned paths may be used as a return destination. */
export function safeCandidateReturnTo(value: string | null): string | null {
  if (!value?.startsWith('/candidate/') || /[\\\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin && url.pathname.startsWith('/candidate/')
      ? `${url.pathname}${url.search}${url.hash}`
      : null;
  } catch {
    return null;
  }
}
