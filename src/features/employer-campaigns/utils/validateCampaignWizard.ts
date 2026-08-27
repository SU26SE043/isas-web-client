import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import { validateCampaignPdf } from './campaignFiles';

const LAST_STEP_INDEX = 6;
const MAX_QUESTIONS_LIMIT = 20;
export const MAX_CAMPAIGN_TITLE_LENGTH = 255;
export const MAX_CRITERION_NAME_LENGTH = 255;
export const MAX_JD_TEXT_LENGTH = 20_000;
export const MAX_CRITERIA_TEXT_LENGTH = 2_000;
export const MAX_FOLLOW_UPS_LIMIT = 20;

export type WizardValidationError = {
  step: number;
  messageKey: string;
};

export type WizardValidationResult = {
  isValid: boolean;
  errors: WizardValidationError[];
  firstInvalidStep: number | null;
};

function pushError(
  errors: WizardValidationError[],
  step: number,
  messageKey: string,
) {
  errors.push({ step, messageKey });
}

/** Validate a single wizard step. Returns i18n message key or null. */
export function validateCampaignWizardStep(
  state: CampaignWizardPersistedState,
  step: number,
  options?: { mode?: 'create' | 'edit' },
): string | null {
  const { info, jd, questions, rubric, settings } = state;
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);
  const mode = options?.mode ?? 'create';

  if (step === 0) {
    if (!info.title.trim()) return 'employer.campaigns.wizard.titleRequired';
    if (info.title.trim().length > MAX_CAMPAIGN_TITLE_LENGTH) {
      return 'employer.campaigns.wizard.titleTooLong';
    }
    if (!info.domain) return 'employer.campaigns.wizard.domainRequired';
    if (!info.timeLimitMinutes || info.timeLimitMinutes < 1) {
      return 'employer.campaigns.wizard.timeLimitRequired';
    }
    if (info.maxCandidates != null && info.maxCandidates <= 0) {
      return 'employer.campaigns.form.maxCandidatesInvalid';
    }
    if (info.maxCandidates != null && !Number.isInteger(info.maxCandidates)) {
      return 'employer.campaigns.form.integerRequired';
    }
    if (!Number.isInteger(info.timeLimitMinutes)) {
      return 'employer.campaigns.form.integerRequired';
    }
    if (info.passScorePct != null && (info.passScorePct < 0 || info.passScorePct > 100)) {
      return 'employer.campaigns.form.passScoreInvalid';
    }
    if (info.passScorePct != null && !Number.isInteger(info.passScorePct)) {
      return 'employer.campaigns.form.integerRequired';
    }
    if (!info.startsAt || !info.expiresAt) return 'employer.campaigns.form.required';
    if (info.expiresAt <= info.startsAt) return 'employer.campaigns.wizard.dateRangeInvalid';
    // Past startsAt only blocks create — edit may keep an already-saved schedule.
    if (mode === 'create') {
      const startsAtMs = new Date(info.startsAt).getTime();
      if (!Number.isNaN(startsAtMs) && startsAtMs < Date.now() - 30_000) {
        return 'employer.campaigns.wizard.startsAtInPast';
      }
    }
    return null;
  }

  if (step === 1) {
    if ((jd.criteriaText ?? '').trim().length > MAX_CRITERIA_TEXT_LENGTH) {
      return 'employer.campaigns.wizard.criteriaTextTooLong';
    }
    if (jd.inputMethod === 'file') {
      if (!jd.jdFile && !jd.fileName && !jd.serverUploaded) {
        return 'employer.campaigns.wizard.jdFileRequired';
      }
      if (jd.jdFile) {
        const code = validateCampaignPdf(jd.jdFile);
        if (code) return `employer.campaigns.wizard.jdFileError.${code}`;
      }
      if (jd.fileStatus === 'failed') return 'employer.campaigns.wizard.jdUploadFailed';
      if (jd.fileStatus === 'uploading' || jd.fileStatus === 'replacing') {
        return 'employer.campaigns.wizard.jdUploadingWait';
      }
      if (!jd.serverUploaded || jd.fileStatus !== 'uploaded') {
        return 'employer.campaigns.wizard.jdUploadRequired';
      }
      return null;
    }
    const text = jd.jdText.trim();
    if (!text) return 'employer.campaigns.wizard.jdTextRequired';
    if (text.length > MAX_JD_TEXT_LENGTH) return 'employer.campaigns.wizard.jdTextTooLong';
    return null;
  }

  if (step === 2) {
    if (rubric.length === 0) return 'employer.campaigns.wizard.criteriaRequired';
    if (rubric.some((item) => !item.name.trim())) {
      return 'employer.campaigns.wizard.rubric.nameRequired';
    }
    if (rubric.some((item) => item.name.trim().length > MAX_CRITERION_NAME_LENGTH)) {
      return 'employer.campaigns.wizard.rubric.nameTooLong';
    }
    const criterionNames = rubric.map((item) => item.name.trim().toLocaleLowerCase());
    if (new Set(criterionNames).size !== criterionNames.length) {
      return 'employer.campaigns.wizard.rubric.duplicateName';
    }
    if (rubric.some((item) => Number(item.weight) <= 0)) {
      return 'employer.campaigns.wizard.rubric.weightInvalid';
    }
    if (Math.round(totalWeight * 10) / 10 !== 100) {
      return 'employer.campaigns.wizard.rubric.mustEqual100';
    }
    if (rubric.some((item) => !Number.isFinite(item.maxScore) || item.maxScore < 1)) {
      return 'employer.campaigns.wizard.rubric.maxScoreInvalid';
    }
    if (rubric.some((item) => Number(item.maxScore) > 10)) {
      return 'employer.campaigns.wizard.rubric.maxScoreTooHigh';
    }
    return null;
  }

  if (step === 3) {
    if (questions.length === 0) return 'employer.campaigns.wizard.questionsRequired';
    if (questions.some((q) => !q.prompt.trim())) return 'employer.campaigns.form.required';
    if (settings.maxQuestions > 0 && questions.length > settings.maxQuestions) {
      return 'employer.campaigns.wizard.questionsExceedMax';
    }
    return null;
  }

  if (step === 4) {
    if (
      !Number.isFinite(settings.maxQuestions) ||
      settings.maxQuestions < 0 ||
      settings.maxQuestions > MAX_QUESTIONS_LIMIT
    ) {
      return 'employer.campaigns.wizard.maxQuestionsInvalid';
    }
    if (settings.adaptiveEnabled) {
      if (
        !Number.isFinite(settings.maxFollowUps) ||
        !Number.isInteger(settings.maxFollowUps) ||
        settings.maxFollowUps < 0 ||
        settings.maxFollowUps > MAX_FOLLOW_UPS_LIMIT
      ) {
        return 'employer.campaigns.wizard.maxFollowUpsInvalid';
      }
    }
    return null;
  }

  // Steps 5 (Slots) and 6 (Review) have no persisted wizard fields.
  return null;
}

/** Validate every step before POST create / PUT save. */
export function validateAllCampaignWizardSteps(
  state: CampaignWizardPersistedState,
  options?: { mode?: 'create' | 'edit' },
): WizardValidationResult {
  const errors: WizardValidationError[] = [];
  for (let step = 0; step <= LAST_STEP_INDEX; step += 1) {
    const messageKey = validateCampaignWizardStep(state, step, options);
    if (messageKey) pushError(errors, step, messageKey);
  }
  return {
    isValid: errors.length === 0,
    errors,
    firstInvalidStep: errors[0]?.step ?? null,
  };
}
