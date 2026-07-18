import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import { validateCampaignJdPdf } from '../components/wizard/jd/JobDescriptionFilePanel';

const MIN_JD_TEXT_LENGTH = 50;
const LAST_STEP_INDEX = 3;

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
  const { info, jd, questions, rubric } = state;
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);
  const mode = options?.mode ?? 'create';

  if (step === 0) {
    if (!info.title.trim()) return 'employer.campaigns.wizard.titleRequired';
    if (!info.domain) return 'employer.campaigns.wizard.domainRequired';
    if (!info.timeLimitMinutes || info.timeLimitMinutes < 1) {
      return 'employer.campaigns.wizard.timeLimitRequired';
    }
    if (info.maxCandidates != null && info.maxCandidates <= 0) {
      return 'employer.campaigns.form.maxCandidatesInvalid';
    }
    if (info.passScorePct != null && (info.passScorePct < 0 || info.passScorePct > 100)) {
      return 'employer.campaigns.form.passScoreInvalid';
    }
    if (!info.startsAt || !info.expiresAt) return 'employer.campaigns.form.required';
    if (info.expiresAt <= info.startsAt) return 'employer.campaigns.wizard.dateRangeInvalid';
    // Past startsAt only blocks create — edit may keep an already-saved schedule.
    if (mode === 'create') {
      const startsAtMs = new Date(info.startsAt).getTime();
      if (!Number.isNaN(startsAtMs) && startsAtMs < Date.now() - 60_000) {
        return 'employer.campaigns.wizard.startsAtInPast';
      }
    }
    return null;
  }

  if (step === 1) {
    // File JD is UI-only for create; text JD must be non-empty.
    if (jd.inputMethod === 'file') {
      if (jd.jdFile) {
        const code = validateCampaignJdPdf(jd.jdFile);
        if (code) return `employer.campaigns.wizard.jdFileError.${code}`;
      }
      return null;
    }
    const text = jd.jdText.trim();
    if (!text) return 'employer.campaigns.wizard.jdTextRequired';
    if (text.length < MIN_JD_TEXT_LENGTH) return 'employer.campaigns.wizard.jdTextTooShort';
    return null;
  }

  if (step === 2) {
    if (rubric.length === 0) return 'employer.campaigns.wizard.criteriaRequired';
    if (rubric.some((item) => !item.name.trim())) {
      return 'employer.campaigns.wizard.rubric.nameRequired';
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
    return null;
  }

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
