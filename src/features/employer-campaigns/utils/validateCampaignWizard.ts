import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import { validateCampaignPdf } from './campaignFiles';
import { CAMPAIGN_QUESTION_HARD_MAX } from './campaignQuestionLimits';

const LAST_STEP_INDEX = 7;
// Trần số câu MỘT BUỔI THI (`settings.maxQuestions`, gồm cả câu đào sâu) — khớp CHECK
// `ck_practice_sessions_max_questions_range` = `max_questions BETWEEN 0 AND 20`
// (`Isas.InterviewService/Configurations/PracticeSessionConfiguration.cs:44`).
//
// ⚠ Số 20 này KHÔNG liên quan `CAMPAIGN_QUESTION_HARD_MAX` (trần ngân hàng đề = 200) hay
// `CAMPAIGN_AI_GENERATE_MAX` (trần một lượt gọi AI = 20). Ba đại lượng, ba hằng. Gộp cái
// này vào trần AI vì "cùng bằng 20" là nối một ràng buộc DB vào một trần chi phí token:
// bên nào đổi trước cũng làm bên kia sai mà không gì báo, và sai ở đây thì INSERT session
// vỡ CHECK — tức SAU khi đã trừ credit (PAY-5).
const MAX_QUESTIONS_LIMIT = 20;
export const MAX_CAMPAIGN_TITLE_LENGTH = 255;
export const MAX_CRITERION_NAME_LENGTH = 255;
// Backend áp CÙNG MỘT trần cho cả jdText lẫn criteriaText —
// `Isas.Shared.Validation.TextInputLimits.JdTextMaxChars` (CAMP-5), gọi qua
// `NormalizeText` ở cả create lẫn update. Nên hai hằng dưới đây phải bằng nhau;
// tách rời từng số thì FE trôi khỏi hợp đồng mà không gì báo (đã xảy ra: trần
// tiêu chí từng là 2.000, tức nghiêm hơn backend 10 lần và chặn nhầm input hợp lệ).
export const MAX_JD_TEXT_LENGTH = 20_000;
export const MAX_CRITERIA_TEXT_LENGTH = MAX_JD_TEXT_LENGTH;
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
    if (!info.language) return 'employer.campaigns.wizard.languageRequired';
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

  // Luật lọc cứng nay nằm ở BƯỚC 7 ("Cấu hình chi tiết"), không còn ở bước 2 — CMP3-F3 đã dời
  // ô nhập đi. Để lỗi ở bước 2 thì bấm "Triển khai" sẽ đá người dùng về bước 2, nơi KHÔNG CÒN
  // ô nào để sửa, kèm thông điệp nói về số năm kinh nghiệm.
  // Trần ứng viên nay ở bước "Sức chứa & ca thi". Bỏ trống KHÔNG phải "không giới hạn":
  // backend rơi về `entitlement.MaxCandidatesCap` của gói (`MaxCandidatesRule`) ⇒ chiến dịch
  // luôn có trần, chỉ là HR không biết nó bằng bao nhiêu. Bắt khai tường minh.
  if (step === 5) {
    if (info.maxCandidates == null) return 'employer.campaigns.form.maxCandidatesRequired';
    if (info.maxCandidates <= 0) return 'employer.campaigns.form.maxCandidatesInvalid';
    if (!Number.isInteger(info.maxCandidates)) return 'employer.campaigns.form.integerRequired';
    return null;
  }

  if (step === 6) {
    if (!info.timeLimitMinutes || info.timeLimitMinutes < 1) {
      return 'employer.campaigns.wizard.timeLimitRequired';
    }
    if (!Number.isInteger(info.timeLimitMinutes)) {
      return 'employer.campaigns.form.integerRequired';
    }
    const minYears = state.hardFilters?.minYearsExperience;
    if (minYears != null && (!Number.isInteger(minYears) || minYears < 0 || minYears > 60)) {
      return 'employer.campaigns.wizard.hardFilters.minYearsInvalid';
    }
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
    // Ngưỡng Đạt/Không đạt của CHÍNH bảng điểm này ⇒ lỗi phải nổ ở bước có ô nhập nó.
    if (info.passScorePct != null && (info.passScorePct < 0 || info.passScorePct > 100)) {
      return 'employer.campaigns.form.passScoreInvalid';
    }
    if (info.passScorePct != null && !Number.isInteger(info.passScorePct)) {
      return 'employer.campaigns.form.integerRequired';
    }
    return null;
  }

  if (step === 3) {
    if (questions.length === 0) return 'employer.campaigns.wizard.questionsRequired';
    if (questions.some((q) => !q.prompt.trim())) return 'employer.campaigns.form.required';
    // Trần KÍCH THƯỚC ngân hàng đề (200) — không phải settings.maxQuestions.
    if (questions.length > CAMPAIGN_QUESTION_HARD_MAX) {
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

  // Steps 5 (Slots), 6 (Invites), and 7 (Review) have no blocking draft fields.
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
