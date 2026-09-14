import type {
  CampaignCreateCriterionRequest,
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignUpdateRequest,
} from '../types/campaign.api.types';
import type { CampaignDomainOption } from '../components/wizard/campaignWizard.steps';
import type {
  CampaignInfoState,
  CampaignHardFiltersState,
  CampaignSettingsState,
  JobDescriptionState,
} from '../types/campaignWizard.types';
import { createEmptyHardFiltersState } from '../types/campaignWizard.types';
import type { CampaignQuestion, EmployerCampaign, RubricCriterion } from '../types/campaignManagement.types';
import { isServerEntityId } from './campaignQuestionLimits';

const DOMAIN_API_LABEL: Record<CampaignDomainOption, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  'business-analyst': 'Business Analyst',
};

export function toIsoDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('INVALID_DATE');
  }
  return date.toISOString();
}

export function mapDomainToApiLabel(domain: CampaignDomainOption): string {
  return DOMAIN_API_LABEL[domain];
}

export function resolveDomainOption(value?: string | null): CampaignDomainOption | '' {
  const normalized = (value ?? '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.includes('frontend') || normalized === 'frontend development' || normalized === 'fe') return 'frontend';
  if (normalized.includes('backend') || normalized === 'be') return 'backend';
  if (normalized.includes('business') || normalized.includes('analyst') || normalized === 'ba') return 'business-analyst';
  // Mã nghề `BE`/`FE`/`BA` là giá trị AIService/API dùng (`jobCategory`); campaign tạo qua API mang chúng —
  // không nhận thì wizard sửa bắt chọn lại lĩnh vực dù chiến dịch đã có.
  return '';
}

export function mapRubricToCreateCriteria(
  rubric: RubricCriterion[],
): CampaignCreateCriterionRequest[] {
  return rubric
    .filter((item) => item.name.trim())
    .map((item) => {
      const rawWeight = Number(item.weight);
      const weight = Number((rawWeight / 100).toFixed(4));
      return {
        // Chỉ echo id do SERVER cấp. Trước đây lọc bằng tiền tố `criterion-`, nhưng client
        // còn đúc `system-N`, `new-xxxxxxxx` và bộ mặc định dùng `technical-depth`… ⇒ chúng lọt
        // lên server và làm hỏng CẢ lượt tạo (400: không parse được `$.criteria[0].id` sang Guid).
        ...(isServerEntityId(item.id) ? { id: item.id.trim() } : {}),
        name: item.name.trim(),
        description: item.description.trim() || null,
        weight,
        maxScore: Number(item.maxScore) || 1,
        minPct: item.minPct ?? null,
        // CAMP-16 ba trạng thái: vắng = BE GIỮ mốc cũ (carry-over theo tên) · [] = XOÁ · [...] = thay.
        // Wizard luôn giữ trọn bộ mốc trong state (mapper hydrate cả levels) nên gửi TƯỜNG MINH:
        // không có mốc ⇒ [] — thiếu dòng này thì HR xoá hết mốc trong editor mà server vẫn giữ bộ cũ.
        levels: item.levels?.length ? item.levels : [],
        // SC2 — `item.scoringScope` là `undefined` chỉ khi object được đúc TAY, không qua mapper đọc
        // (mapper luôn hydrate 'Always'/'WhenTargeted' tường minh). Bỏ HẲN khoá khi `undefined` (thay
        // vì gán giá trị `undefined`) để cả JSON lẫn `toHaveProperty` đều thấy khoá VẮNG — server mặc
        // định 'Always' — khớp hệt hành vi hiện có với các test CHƯA biết field này.
        ...(item.scoringScope !== undefined ? { scoringScope: item.scoringScope } : {}),
      };
    });
}

/**
 * R1(c) — nhãn câu còn id TẠM (`new-…`/`system-N`/`criterion-N`) lúc dựng payload `PUT …/questions` = đường lưu
 * đã QUÊN ghép id server (`adoptServerRubric`) — trước đây bị omit im lặng ⇒ câu lưu `null`, chip tắt, không ai
 * biết. Ném để wizard hiện lỗi ở bước Câu hỏi thay vì "lưu thành công" mà mất nhãn.
 */
export class UnresolvedCriterionIdError extends Error {
  readonly ids: string[];
  constructor(ids: string[]) {
    super(`UNRESOLVED_CRITERION_IDS: ${ids.join(', ')}`);
    this.name = 'UnresolvedCriterionIdError';
    this.ids = ids;
  }
}

export interface MapQuestionsOptions {
  /**
   * `throw` (mặc định, cho PUT …/questions): id tạm còn sót ⇒ `UnresolvedCriterionIdError`.
   * `omit` (CHỈ cho POST create): tiêu chí chưa có id server nào nên nhãn KHÔNG THỂ resolve — bỏ khoá, rồi
   * `adoptServerRubric` ghép id từ `created.rubric` và nhãn được gửi lại ở PUT câu hỏi ngay sau (R1a).
   */
  unresolvedTargets?: 'throw' | 'omit';
}

/** The server owns question source; only preserve an id when editing an existing AI question. */
export function mapQuestionsToApiRequest(
  questions: CampaignQuestion[],
  options: MapQuestionsOptions = {},
): CampaignCreateQuestionRequest[] {
  return questions
    .filter((item) => item.prompt.trim())
    .map((item) => {
      const targetCriterionIds = normalizeTargetCriterionIdsForRequest(item.targetCriterionIds, options.unresolvedTargets ?? 'throw');
      const payload: CampaignCreateQuestionRequest = {
        questionText: item.prompt.trim(),
        isRequired: item.isRequired,
        ...(item.questionGroup?.trim() ? { questionGroup: item.questionGroup.trim() } : {}),
        // SC2 — BA nhánh (xem `normalizeTargetCriterionIdsForRequest`): `undefined`/`null` ⇒ khoá VẮNG (giữ
        // nguyên nhãn server đang có) · `[]` thật ⇒ gửi `[]` (HR đã chủ động "chỉ Always") · mảng có phần tử ⇒
        // gửi nguyên; id tạm còn sót ⇒ ném (PUT) hoặc omit (POST create — xem `MapQuestionsOptions`).
        // Bỏ HẲN khoá khi vắng (không gán `undefined`) — `toHaveProperty` thấy khoá dù giá trị undefined.
        ...(targetCriterionIds !== undefined ? { targetCriterionIds } : {}),
        // CAMP-16 kiểu 3 trạng thái CỦA RIÊNG field này: `undefined` domain (chưa từng đọc) ⇒ bỏ khoá;
        // `null` (đã đọc, server chưa có sample answer) ⇒ gửi `null` = GIỮ NGUYÊN; `''`/chuỗi ⇒ gửi nguyên.
        ...(item.sampleAnswer !== undefined ? { sampleAnswer: item.sampleAnswer } : {}),
      };
      if (isServerEntityId(item.id)) {
        payload.id = item.id.trim();
      }
      return payload;
    });
}

/**
 * Ba ca (T7-R1): `undefined`/`null` ⇒ omit key (JSON/`toEqual` coi `undefined` là vắng) · mảng GỐC rỗng thật
 * `[]` ⇒ gửi `[]` nguyên (HR đã chủ động "chỉ Always") · mảng có id TẠM (`criterion-N`/`new-…`/`system-N`):
 *  - `throw` (PUT …/questions): trước R1(c) ca này OMIT khoá (BE giữ nhãn cũ / `null`) — tức nhãn HR vừa gắn
 *    bốc hơi mà "lưu thành công". Sau R1, mọi đường lưu đều ghép id qua `adoptServerRubric` TRƯỚC khi tới đây,
 *    nên id tạm còn sót là LỖI ĐƯỜNG ĐI ⇒ ném `UnresolvedCriterionIdError` cho wizard hiện ở bước Câu hỏi.
 *  - `omit` (POST create): tiêu chí chưa có id server nào ⇒ bỏ khoá có chủ đích; nhãn được PUT lại sau khi
 *    ghép `created.rubric` (R1a). Gửi `[]` ở đây là bảo BE "XOÁ nhãn" — sai ý.
 * Id tạm lẫn với GUID trong CÙNG một nhãn cũng ném (`throw`) — chỉ gửi phần GUID là cắt nhãn im lặng.
 */
function normalizeTargetCriterionIdsForRequest(
  value: string[] | null | undefined,
  unresolvedTargets: 'throw' | 'omit',
): string[] | undefined {
  if (value == null) return undefined;
  if (value.length === 0) return [];
  const unresolved = value.filter((id) => !isServerEntityId(id));
  if (unresolved.length === 0) return value;
  if (unresolvedTargets === 'throw') throw new UnresolvedCriterionIdError(unresolved);
  const resolved = value.filter((id) => isServerEntityId(id));
  return resolved.length === 0 ? undefined : resolved;
}

function criteriaRequestToRubric(
  criteria: CampaignCreateCriterionRequest[] | null | undefined,
): RubricCriterion[] {
  return (criteria ?? []).map((item, index) => ({
    id: item.id?.trim() || `criterion-${index}`,
    name: item.name,
    description: item.description?.trim() || '',
    weight: item.weight,
    maxScore: item.maxScore,
    minPct: item.minPct ?? null,
    levels: item.levels ?? undefined,
    scoringScope: item.scoringScope,
  }));
}

function questionRequestToUi(
  questions: CampaignCreateQuestionRequest[],
): CampaignQuestion[] {
  return questions.map((item, index) => ({
    id: `question-${index}`,
    prompt: item.questionText,
    skill: '',
    difficulty: 'middle' as const,
    source: item.source === 'AiGenerated' ? ('ai' as const) : ('manual' as const),
    isRequired: item.isRequired,
    targetCriterionIds: item.targetCriterionIds ?? null,
    sampleAnswer: item.sampleAnswer,
  }));
}

/**
 * Some CampaignResponse payloads omit nested criteria/questions even after a successful write.
 * Prefer response collections when present; otherwise keep what we just submitted.
 */
export function mergeCampaignWriteResult(
  mapped: EmployerCampaign,
  input: {
    criteria?: CampaignCreateCriterionRequest[] | null;
    questions?: CampaignCreateQuestionRequest[] | null;
    jdText?: string | null;
    title?: string;
    domain?: string;
    maxCandidates?: number | null;
    timeLimitMinutes?: number;
    startsAt?: string;
    expiresAt?: string;
  },
): EmployerCampaign {
  const next: EmployerCampaign = { ...mapped };

  if (!next.rubric.length && input.criteria?.length) {
    next.rubric = criteriaRequestToRubric(input.criteria);
  }
  if (!next.questions.length && input.questions?.length) {
    next.questions = questionRequestToUi(input.questions);
  }
  if (!next.jobDescription.trim() && input.jdText?.trim()) {
    next.jobDescription = input.jdText.trim();
    next.summary = next.summary || input.jdText.trim().slice(0, 200);
  }
  if (input.title?.trim()) next.title = input.title.trim();
  if (input.domain?.trim()) {
    next.domain = input.domain.trim();
    next.company = input.domain.trim();
  }
  if (input.maxCandidates && input.maxCandidates > 0) next.capacity = input.maxCandidates;
  if (input.timeLimitMinutes && input.timeLimitMinutes > 0) {
    next.durationMinutes = input.timeLimitMinutes;
  }
  if (input.expiresAt) next.deadline = input.expiresAt;
  if (input.startsAt) next.startsAt = input.startsAt;

  return next;
}

function resolveJdTextForCreate(jd: JobDescriptionState): string | null {
  const text = jd.jdText.trim();
  return text || null;
}

function resolveJdTextForUpdate(jd: JobDescriptionState): string | undefined {
  const text = jd.jdText.trim();
  return text || undefined;
}

export type CampaignWizardSubmitSnapshot = {
  info: CampaignInfoState;
  jd: JobDescriptionState;
  hardFilters?: CampaignHardFiltersState;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  questionsPerSession?: number | null;
  settings: CampaignSettingsState;
};

function hardFiltersPayload(hardFilters?: CampaignHardFiltersState) {
  const values = hardFilters ?? createEmptyHardFiltersState();
  return {
    ...(values.requiredSkillsTouched ? { requiredSkills: values.requiredSkills } : {}),
    ...(values.keywordsAnyTouched ? { keywordsAny: values.keywordsAny } : {}),
    ...(values.minYearsExperienceTouched
      ? { minYearsExperience: values.minYearsExperience ?? 0 }
      : {}),
  };
}

/**
 * Build POST /api/v1/campaign body from the full wizard (all 6 steps).
 * Preserve any JD text already entered when the user switches to file mode. The
 * file is still uploaded separately after the draft is created.
 */
export function buildCampaignCreateRequest(
  snapshot: CampaignWizardSubmitSnapshot,
): CampaignCreateRequest {
  const { info, settings } = snapshot;
  if (!info.domain) {
    throw new Error('DOMAIN_REQUIRED');
  }
  if (!info.language) {
    throw new Error('LANGUAGE_REQUIRED');
  }

  // R1(a) — POST create: tiêu chí chưa có id server ⇒ nhãn id tạm bị bỏ có chủ đích, PUT lại sau khi ghép `created.rubric`.
  const questions = mapQuestionsToApiRequest(snapshot.questions, { unresolvedTargets: 'omit' });
  const depth = settings.adaptiveEnabled ? settings.maxDeepPerQuestion ?? 0 : 0;
  const baseQuestionCount = snapshot.questionsPerSession ?? settings.maxQuestions ?? 0;
  const derivedMaxQuestions = settings.adaptiveEnabled ? Math.min(20, Math.max(0, baseQuestionCount * (1 + depth))) : baseQuestionCount;

  return {
    title: info.title.trim(),
    domain: mapDomainToApiLabel(info.domain),
    language: info.language,
    maxCandidates:
      info.maxCandidates && info.maxCandidates > 0 ? info.maxCandidates : undefined,
    timeLimitMinutes: info.timeLimitMinutes,
    passScorePct: info.passScorePct ?? null,
    antiCheatEnabled: settings.antiCheatEnabled,
    faceVerifyEnabled: settings.faceVerifyEnabled,
    adaptiveEnabled: settings.adaptiveEnabled,
    groundingEnabled: false,
    maxFollowUps: settings.adaptiveEnabled ? settings.maxFollowUps : undefined,
    // 0 không phải giá trị hợp lệ (backend đòi 1..20); 0 nghĩa là "chưa chọn" ⇒ gửi null.
    questionsPerSession: snapshot.questionsPerSession && snapshot.questionsPerSession > 0
      ? snapshot.questionsPerSession
      : null,
    maxQuestions: derivedMaxQuestions > 0 ? derivedMaxQuestions : undefined,
    maxDeepPerQuestion: settings.adaptiveEnabled ? settings.maxDeepPerQuestion : 0,
    jdText: resolveJdTextForCreate(snapshot.jd),
    criteriaText: snapshot.jd.criteriaText.trim() || null,
    ...hardFiltersPayload(snapshot.hardFilters),
    // ⚠ Rubric rỗng ⇒ BỎ HẲN khoá `criteria`, đừng gửi mảng rỗng. Backend đọc
    // `if (request.Criteria is not null)` rồi ném "criteria[] phải có ≥1 tiêu chí" ⇒ 400.
    // Nháp được tạo ngay ở BƯỚC 2 (lúc tải JD) khi bước 3 chưa chạy nên rubric luôn rỗng
    // ⇒ mọi lần tải JD đều 400 và người dùng kẹt cứng ở bước 2. `undefined` bị JSON bỏ qua.
    criteria: snapshot.rubric.length ? mapRubricToCreateCriteria(snapshot.rubric) : undefined,
    startsAt: toIsoDateTime(info.startsAt),
    expiresAt: toIsoDateTime(info.expiresAt),
    questions,
  };
}

/**
 * Build PUT /api/v1/campaign/{id} body (no questions) with every updatable field set.
 * Prefer `buildDirtyUpdateRequest` when editing so only changed fields are sent.
 */
export function buildCampaignUpdateRequest(
  snapshot: CampaignWizardSubmitSnapshot,
): CampaignUpdateRequest {
  const { info, settings } = snapshot;
  if (!info.domain) {
    throw new Error('DOMAIN_REQUIRED');
  }
  if (!info.language) {
    throw new Error('LANGUAGE_REQUIRED');
  }
  const depth = settings.adaptiveEnabled ? settings.maxDeepPerQuestion ?? 0 : 0;
  const baseQuestionCount = snapshot.questionsPerSession ?? settings.maxQuestions ?? 0;
  const derivedMaxQuestions = settings.adaptiveEnabled ? Math.min(20, Math.max(0, baseQuestionCount * (1 + depth))) : baseQuestionCount;

  return {
    title: info.title.trim(),
    domain: mapDomainToApiLabel(info.domain),
    language: info.language,
    maxCandidates:
      info.maxCandidates && info.maxCandidates > 0 ? info.maxCandidates : undefined,
    timeLimitMinutes: info.timeLimitMinutes,
    antiCheatEnabled: settings.antiCheatEnabled,
    faceVerifyEnabled: settings.faceVerifyEnabled,
    adaptiveEnabled: settings.adaptiveEnabled,
    groundingEnabled: false,
    // v10 treats null for these limits as "keep existing" on PUT; omit when UI has no limit.
    maxFollowUps: settings.adaptiveEnabled ? settings.maxFollowUps : undefined,
    // 0 không phải giá trị hợp lệ (backend đòi 1..20); 0 nghĩa là "chưa chọn" ⇒ gửi null.
    questionsPerSession: snapshot.questionsPerSession && snapshot.questionsPerSession > 0
      ? snapshot.questionsPerSession
      : null,
    maxQuestions: derivedMaxQuestions > 0 ? derivedMaxQuestions : undefined,
    maxDeepPerQuestion: settings.adaptiveEnabled ? settings.maxDeepPerQuestion : 0,
    passScorePct: info.passScorePct ?? null,
    jdText: resolveJdTextForUpdate(snapshot.jd),
    criteriaText: snapshot.jd.criteriaText.trim() || undefined,
    ...hardFiltersPayload(snapshot.hardFilters),
    // ⚠ Rubric rỗng ⇒ BỎ HẲN khoá `criteria`, đừng gửi mảng rỗng. Backend đọc
    // `if (request.Criteria is not null)` rồi ném "criteria[] phải có ≥1 tiêu chí" ⇒ 400.
    // Nháp được tạo ngay ở BƯỚC 2 (lúc tải JD) khi bước 3 chưa chạy nên rubric luôn rỗng
    // ⇒ mọi lần tải JD đều 400 và người dùng kẹt cứng ở bước 2. `undefined` bị JSON bỏ qua.
    criteria: snapshot.rubric.length ? mapRubricToCreateCriteria(snapshot.rubric) : undefined,
    startsAt: toIsoDateTime(info.startsAt),
    expiresAt: toIsoDateTime(info.expiresAt),
  };
}

/**
 * Diff two full update payloads and keep only the fields that changed.
 * Used on edit-mode save so PUT /api/v1/campaign/{id} only sends dirty fields.
 */
export function buildDirtyUpdateRequest(
  baseline: CampaignWizardSubmitSnapshot,
  current: CampaignWizardSubmitSnapshot,
): CampaignUpdateRequest {
  const baselinePayload = buildCampaignUpdateRequest(baseline);
  const currentPayload = buildCampaignUpdateRequest(current);
  const dirty: CampaignUpdateRequest = {};

  (Object.keys(currentPayload) as Array<keyof CampaignUpdateRequest>).forEach((key) => {
    const before = baselinePayload[key];
    const after = currentPayload[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      (dirty as Record<string, unknown>)[key] = after;
    }
  });

  // The live v10 update endpoint validates the campaign identity fields even
  // when the rest of the request is a partial update. Keep the business
  // payload dirty-only, but echo those required fields so a change such as
  // passScorePct does not fail with "Title field is required".
  if (currentPayload.title) dirty.title = currentPayload.title;
  if (currentPayload.domain) dirty.domain = currentPayload.domain;

  return dirty;
}
