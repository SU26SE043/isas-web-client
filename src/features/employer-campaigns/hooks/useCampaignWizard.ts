import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type {
  CampaignQuestion,
  EmployerCampaign,
  RubricCriterion,
} from '../types/campaignManagement.types';
import type {
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignUpdateRequest,
  GenerateCampaignQuestionsParams,
} from '../types/campaign.api.types';
import {
  buildCampaignCreateRequest,
  buildCampaignUpdateRequest,
  buildDirtyUpdateRequest,
  mapQuestionsToApiRequest,
  resolveDomainOption,
  type CampaignWizardSubmitSnapshot,
} from '../utils/buildCampaignCreateRequest';
import {
  validateAllCampaignWizardSteps,
  validateCampaignWizardStep,
} from '../utils/validateCampaignWizard';
import {
  createDefaultSettingsState,
  createEmptyCriteriaFileState,
  createEmptyHardFiltersState,
  createEmptyJdState,
  decimalWeightsToPercent,
} from '../types/campaignWizard.types';
import type {
  CampaignInfoState,
  CampaignSettingsState,
  CampaignWizardPersistedState,
  CampaignHardFiltersState,
  CriteriaFileState,
  JobDescriptionState,
} from '../types/campaignWizard.types';
import { CAMPAIGN_WIZARD_STEP_COUNT } from '../components/wizard/campaignWizard.steps';
import { useCampaignFileActions } from './useCampaignFileActions';
import type { BlobDownloadResult, CampaignFileType } from '../utils/campaignFiles';
import {
  getGenerateQuestionsErrorKey,
  getGenerateQuestionsErrorMessage,
} from '../utils/generateQuestionsError';
import {
  defaultGenerateCount,
  effectiveMaxQuestions,
  hasWizardJd,
  validateGenerateCount,
} from '../utils/campaignQuestionLimits';

export type CampaignFormMode = 'create' | 'edit';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Format a Date for `<input type="datetime-local">` in the browser's local timezone. */
function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function parseCampaignDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function defaultInfo(campaign?: EmployerCampaign | null): CampaignInfoState {
  const start = parseCampaignDate(campaign?.startsAt) ?? (() => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + 60);
    return next;
  })();
  const end =
    parseCampaignDate(campaign?.deadline) ??
    (() => {
      const next = new Date(start);
      next.setDate(next.getDate() + 30);
      return next;
    })();

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return {
    title: campaign?.title ?? '',
    domain: resolveDomainOption(campaign?.domain ?? campaign?.company),
    location: campaign?.location === '—' ? '' : campaign?.location ?? '',
    locationCoordinates: null,
    maxCandidates: campaign?.capacity && campaign.capacity > 0 ? campaign.capacity : null,
    timeLimitMinutes: campaign?.durationMinutes || 60,
    passScorePct: campaign?.passScorePct ?? null,
    startsAt: toDatetimeLocalValue(start),
    expiresAt: toDatetimeLocalValue(end),
    timezone,
  };
}

function defaultSettings(campaign?: EmployerCampaign | null): CampaignSettingsState {
  const base = createDefaultSettingsState();
  if (!campaign) return base;
  return {
    antiCheatEnabled: campaign.antiCheatEnabled ?? base.antiCheatEnabled,
    faceVerifyEnabled: campaign.faceVerifyEnabled ?? base.faceVerifyEnabled,
    adaptiveEnabled: campaign.adaptiveEnabled ?? base.adaptiveEnabled,
    maxFollowUps: campaign.maxFollowUps ?? base.maxFollowUps,
    maxQuestions: campaign.maxQuestions ?? base.maxQuestions,
    maxDeepPerQuestion: campaign.maxDeepPerQuestion ?? base.maxDeepPerQuestion,
  };
}

function buildInitialState(
  campaign?: EmployerCampaign | null,
  mode: CampaignFormMode = 'create',
): CampaignWizardPersistedState {
  const hasJdText = Boolean(campaign?.jobDescription?.trim());
  const initialRubric = decimalWeightsToPercent(campaign?.rubric?.length ? campaign.rubric : []);
  return {
    info: defaultInfo(campaign),
    jd: {
      ...createEmptyJdState(),
      ...(hasJdText
        ? {
            inputMethod: 'text' as const,
            jdText: campaign?.jobDescription ?? '',
            fileStatus: 'uploaded' as const,
          }
        : {}),
    },
    hardFilters: {
      ...createEmptyHardFiltersState(),
      requiredSkills: campaign?.requiredSkills ?? [],
      keywordsAny: campaign?.keywordsAny ?? [],
      minYearsExperience: campaign?.minYearsExperience ?? null,
    },
    criteria: createEmptyCriteriaFileState(),
    rubric: initialRubric,
    questions: campaign?.questions?.length ? campaign.questions : [],
    questionCount: 5,
    questionsPerSession: campaign?.questionsPerSession ?? null,
    settings: defaultSettings(campaign),
    currentStep: 0,
    completedSteps: mode === 'edit' ? [0, 1, 2, 3, 4, 5, 6] : [],
    errorSteps: [],
    draftId: campaign?.id,
    autosaveStatus: 'idle',
    lastSavedAt: campaign?.updatedAt,
  };
}

function toSnapshot(state: CampaignWizardPersistedState): CampaignWizardSubmitSnapshot {
  return {
    info: state.info,
    jd: state.jd,
    hardFilters: state.hardFilters,
    rubric: state.rubric,
    questions: state.questions,
    questionsPerSession: state.questionsPerSession,
    settings: state.settings,
  };
}

function markCompleted(completed: number[], step: number) {
  return Array.from(new Set([...completed, step])).sort((a, b) => a - b);
}

function clearError(errorSteps: number[], step: number) {
  return errorSteps.filter((item) => item !== step);
}

export function resolveCampaignErrorStep(
  message: string,
  kind: 'create' | 'update' | 'questions',
): number | null {
  const lower = message.toLowerCase();
  if (lower.includes('maxquestions') || lower.includes('maxfollowups')) return 4;
  if (lower.includes('question') || lower.includes('câu hỏi') || kind === 'questions') return 3;
  if (
    lower.includes('criteria') ||
    lower.includes('weight') ||
    lower.includes('maxscore') ||
    lower.includes('tiêu chí')
  ) {
    return 2;
  }
  if (lower.includes('jd') || lower.includes('job description')) return 1;
  if (
    lower.includes('date') ||
    lower.includes('start') ||
    lower.includes('expir') ||
    lower.includes('past') ||
    lower.includes('title') ||
    lower.includes('domain') ||
    lower.includes('location') ||
    lower.includes('passscore')
  ) {
    return 0;
  }
  return null;
}

function mapSubmitError(
  error: unknown,
  t: (key: string) => string,
  kind: 'create' | 'update' | 'questions',
): { message: string; step: number | null } {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error, '');

  // Prefer the backend plain-text / message body when present.
  const preferApiMessage = Boolean(message.trim());

  if (status === 401) return { message: t('employer.campaigns.wizard.sessionExpired'), step: null };
  if (status === 403) {
    if (message && /(max.?candidates?|quota|package|plan|limit|cap)/i.test(message)) {
      return { message, step: 0 };
    }
    return {
      message:
        kind === 'create'
          ? t('employer.campaigns.wizard.forbidden')
          : t('employer.campaigns.wizard.updateForbidden'),
      step: null,
    };
  }
  if (status === 404) {
    return { message: t('employer.campaigns.wizard.campaignNotFound'), step: null };
  }
  if (status === 409) {
    return { message: t('employer.campaigns.wizard.notDraftEditable'), step: null };
  }
  if (status === 400) {
    if (/ADAPTIVE_BUDGET_TOO_SMALL/i.test(message)) {
      const need = message.match(/(?:need|required|cần)\D*(\d+)/i)?.[1] ?? '?';
      const have = message.match(/(?:have|available|hiện có)\D*(\d+)/i)?.[1] ?? '?';
      return { message: t('employer.campaigns.wizard.adaptiveBudgetTooSmall').replace('{need}', need).replace('{have}', have), step: 3 };
    }
    const step = resolveCampaignErrorStep(message, kind);
    if (step !== null) {
      const fallbackKey =
        step === 3
          ? 'employer.campaigns.wizard.questionsRequired'
          : step === 2
            ? 'employer.campaigns.wizard.criteriaInvalid'
            : step === 1
              ? 'employer.campaigns.wizard.jdTextRequired'
              : 'employer.campaigns.wizard.dateRangeInvalid';
      return { message: preferApiMessage ? message : t(fallbackKey), step };
    }
  }
  if (status === 500 || status === 502 || status === 503) {
    return { message: t('employer.campaigns.wizard.saveFailedRetry'), step: null };
  }
  if (preferApiMessage) return { message, step: null };
  return {
    message:
      kind === 'create'
        ? t('employer.campaigns.wizard.createFailed')
        : t('employer.campaigns.wizard.saveFailedRetry'),
    step: null,
  };
}

interface UseCampaignWizardArgs {
  campaign?: EmployerCampaign | null;
  mode: CampaignFormMode;
  onCreateCampaign: (input: CampaignCreateRequest) => Promise<EmployerCampaign>;
  onUpdateCampaign: (campaignId: string, payload: CampaignUpdateRequest) => Promise<EmployerCampaign>;
  onUpdateQuestions: (
    campaignId: string,
    questions: CampaignCreateQuestionRequest[],
  ) => Promise<EmployerCampaign>;
  onGenerateQuestions: (params: GenerateCampaignQuestionsParams) => Promise<EmployerCampaign>;
  onUploadFiles: (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ) => Promise<EmployerCampaign>;
  onReplaceFiles: (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ) => Promise<EmployerCampaign>;
  onDownloadFile: (
    campaignId: string,
    fileType: CampaignFileType,
  ) => Promise<BlobDownloadResult>;
  onAfterSubmit: (campaign: EmployerCampaign) => void;
}

export function useCampaignWizard({
  campaign,
  mode,
  onCreateCampaign,
  onUpdateCampaign,
  onUpdateQuestions,
  onGenerateQuestions,
  onUploadFiles,
  onReplaceFiles,
  onDownloadFile,
  onAfterSubmit,
}: UseCampaignWizardArgs) {
  const { t } = useLanguage();
  const [state, setState] = useState<CampaignWizardPersistedState>(() =>
    buildInitialState(campaign, mode),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [isEnsuringDraft, setIsEnsuringDraft] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [metadataSaved, setMetadataSaved] = useState(false);
  const [questionsSaved, setQuestionsSaved] = useState(false);
  const requestLockRef = useRef(false);
  const generateLockRef = useRef(false);
  const hydratedIdRef = useRef<string | null>(campaign?.id ?? null);
  const baselineSnapshotRef = useRef<CampaignWizardSubmitSnapshot | null>(
    mode === 'edit' ? toSnapshot(state) : null,
  );

  useEffect(() => {
    if (mode !== 'edit' || !campaign?.id) return;
    if (hydratedIdRef.current === campaign.id) return;
    hydratedIdRef.current = campaign.id;
    const next = buildInitialState(campaign, 'edit');
    setState(next);
    baselineSnapshotRef.current = toSnapshot(next);
    setMetadataSaved(false);
    setQuestionsSaved(false);
  }, [campaign, mode]);

  const totalWeight = useMemo(
    () => state.rubric.reduce((sum, item) => sum + Number(item.weight), 0),
    [state.rubric],
  );

  const domainLabel = useMemo(() => {
    if (!state.info.domain) return '';
    return t(`employer.campaigns.form.domain.${state.info.domain}`);
  }, [state.info.domain, t]);

  const jobCategory = useMemo(() => {
    if (state.info.domain === 'backend') return 'BE';
    if (state.info.domain === 'frontend') return 'FE';
    if (state.info.domain === 'business-analyst') return 'BA';
    return null;
  }, [state.info.domain]);

  const campaignId = state.draftId ?? campaign?.id ?? null;
  const campaignStatus = campaign?.status ?? null;
  const isDraftEditable = mode === 'create' || campaignStatus === 'draft';

  const patchInfo = useCallback((patch: Partial<CampaignInfoState>) => {
    setState((prev) => ({ ...prev, info: { ...prev.info, ...patch }, autosaveStatus: 'dirty' }));
  }, []);

  const patchJd = useCallback((patch: Partial<JobDescriptionState>) => {
    setState((prev) => ({ ...prev, jd: { ...prev.jd, ...patch }, autosaveStatus: 'dirty' }));
  }, []);

  const patchHardFilters = useCallback((patch: Partial<CampaignHardFiltersState>) => {
    setState((prev) => ({
      ...prev,
      hardFilters: { ...prev.hardFilters, ...patch },
      autosaveStatus: 'dirty',
    }));
  }, []);

  const patchCriteria = useCallback((patch: Partial<CriteriaFileState>) => {
    setState((prev) => ({
      ...prev,
      criteria: { ...prev.criteria, ...patch },
      autosaveStatus: 'dirty',
    }));
  }, []);

  const patchSettings = useCallback((patch: Partial<CampaignSettingsState>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 4),
    }));
  }, []);

  const snapshot = useCallback(() => toSnapshot(state), [state]);

  const fileActions = useCampaignFileActions({
    state,
    campaign,
    isDraftEditable,
    t,
    setState,
    patchJd,
    patchCriteria,
    setStepError,
    onCreateCampaign,
    onUploadFiles,
    onReplaceFiles,
    onDownloadFile,
    snapshot,
  });

  const setRubric = useCallback((rubric: RubricCriterion[]) => {
    setState((prev) => ({ ...prev, rubric, autosaveStatus: 'dirty' }));
  }, []);

  const resetRubric = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rubric: [],
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 2),
    }));
  }, []);

  const setQuestionCount = useCallback((questionCount: number) => {
    setState((prev) => ({ ...prev, questionCount }));
  }, []);

  const setQuestionsPerSession = useCallback((value: number | null) => {
    setState((prev) => ({ ...prev, questionsPerSession: value, autosaveStatus: 'dirty' }));
  }, []);

  const setQuestions = useCallback((questions: CampaignQuestion[]) => {
    setState((prev) => ({
      ...prev,
      questions,
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 3),
    }));
  }, []);

  const generateQuestionsWithAi = useCallback(
    async (options?: { useDefaultCount?: boolean }) => {
      if (generateLockRef.current || isGeneratingQuestions) return;
      if (!isDraftEditable) {
        setStepError(t('employer.campaigns.campaignQuestions.errors.draftOnly'));
        return;
      }
      if (!hasWizardJd(state.jd) && !(campaign?.jobDescription?.trim())) {
        setStepError(t('employer.campaigns.campaignQuestions.errors.jdRequired'));
        return;
      }

      const useDefaultCount = Boolean(options?.useDefaultCount);
      let count: number | undefined;
      if (!useDefaultCount) {
        const validated = validateGenerateCount(
          state.questionCount,
          state.settings.maxQuestions > 0 ? state.settings.maxQuestions : null,
        );
        if (!validated.ok) {
          const key =
            validated.code === 'countCampaignMax'
              ? 'employer.campaigns.campaignQuestions.validation.countCampaignMax'
              : validated.code === 'countMaximum'
                ? 'employer.campaigns.campaignQuestions.validation.countMaximum'
                : validated.code === 'countPositive'
                  ? 'employer.campaigns.campaignQuestions.validation.countPositive'
                  : validated.code === 'countInteger'
                    ? 'employer.campaigns.campaignQuestions.validation.countInteger'
                    : 'employer.campaigns.campaignQuestions.validation.countRequired';
          setStepError(
            t(key)
              .replace('{{max}}', String(validated.max ?? effectiveMaxQuestions(null)))
              .replace(
                '{{maxQuestions}}',
                String(validated.max ?? effectiveMaxQuestions(null)),
              ),
          );
          return;
        }
        count = validated.count;
      } else {
        // Keep the system-default path inside the campaign limit as well.
        // The API's omitted-count default can otherwise return more questions
        // than the wizard allows, which leaves both Save and Continue disabled.
        count = defaultGenerateCount(
          state.settings.maxQuestions > 0 ? state.settings.maxQuestions : null,
        );
      }

      generateLockRef.current = true;
      setIsGeneratingQuestions(true);
      setStepError(null);
      try {
        const id = await fileActions.ensureDraftId();
        const updated = await onGenerateQuestions({
          campaignId: id,
          count,
        });
        setState((prev) => ({
          ...prev,
          draftId: updated.id,
          questions: updated.questions,
          lastSavedAt: updated.updatedAt,
          autosaveStatus: 'saved',
          errorSteps: clearError(prev.errorSteps, 3),
          settings: {
            ...prev.settings,
            maxQuestions:
              updated.maxQuestions != null && updated.maxQuestions > 0
                ? updated.maxQuestions
                : prev.settings.maxQuestions,
          },
        }));
        setQuestionsSaved(true);
        const received = updated.questions.length;
        if (received < count) {
          toast(
            t('employer.campaigns.campaignQuestions.success.generatedLimited')
              .replace('{{requested}}', String(count))
              .replace('{{received}}', String(received)),
          );
        } else {
          toast.success(
            t('employer.campaigns.campaignQuestions.success.generatedExact').replace(
              '{{count}}',
              String(received),
            ),
          );
        }
      } catch (error) {
        const key = getGenerateQuestionsErrorKey(error);
        setStepError(getGenerateQuestionsErrorMessage(error, t(key)));
      } finally {
        setIsGeneratingQuestions(false);
        generateLockRef.current = false;
      }
    },
    [
      campaign?.jobDescription,
      fileActions,
      isDraftEditable,
      isGeneratingQuestions,
      onGenerateQuestions,
      state.jd,
      state.questionCount,
      state.settings.maxQuestions,
      t,
    ],
  );

  const saveQuestionsNow = useCallback(async () => {
    if (!isDraftEditable || isSavingQuestions || isGeneratingQuestions) return;
    if (state.questions.length === 0) {
      setStepError(t('employer.campaigns.campaignQuestions.validation.listRequired'));
      return;
    }
    if (state.questions.some((item) => !item.prompt.trim())) {
      setStepError(t('employer.campaigns.campaignQuestions.validation.questionRequired'));
      return;
    }
    const max = effectiveMaxQuestions(
      state.settings.maxQuestions > 0 ? state.settings.maxQuestions : null,
    );
    if (state.questions.length > max) {
      setStepError(
        t('employer.campaigns.campaignQuestions.validation.questionLimit').replace(
          '{{max}}',
          String(max),
        ),
      );
      return;
    }

    setIsSavingQuestions(true);
    setStepError(null);
    try {
      const id = await fileActions.ensureDraftId();
      const updated = await onUpdateQuestions(id, mapQuestionsToApiRequest(state.questions));
      setState((prev) => ({
        ...prev,
        draftId: updated.id,
        questions: updated.questions,
        lastSavedAt: updated.updatedAt,
        autosaveStatus: 'saved',
      }));
      setQuestionsSaved(true);
      toast.success(t('employer.campaigns.campaignQuestions.success.saved'));
    } catch (error) {
      setStepError(
        getGenerateQuestionsErrorMessage(
          error,
          t('employer.campaigns.campaignQuestions.errors.saveFailed'),
        ),
      );
    } finally {
      setIsSavingQuestions(false);
    }
  }, [
    fileActions,
    isDraftEditable,
    isGeneratingQuestions,
    isSavingQuestions,
    onUpdateQuestions,
    state.questions,
    state.settings.maxQuestions,
    t,
  ]);

  const addManualQuestion = useCallback(() => {
    setState((prev) => {
      const max = effectiveMaxQuestions(
        prev.settings.maxQuestions > 0 ? prev.settings.maxQuestions : null,
      );
      if (prev.questions.length >= max) {
        setStepError(
          t('employer.campaigns.campaignQuestions.validation.questionLimit').replace(
            '{{max}}',
            String(max),
          ),
        );
        return prev;
      }
      return {
        ...prev,
        questions: [
          ...prev.questions,
          {
            id: `client-${crypto.randomUUID()}`,
            prompt: '',
            skill: '',
            difficulty: 'middle' as const,
            source: 'manual' as const,
            isRequired: true,
          },
        ],
        autosaveStatus: 'dirty',
      };
    });
  }, [t]);

  const updateQuestion = useCallback((id: string, patch: Partial<CampaignQuestion>) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 3),
    }));
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.filter((question) => question.id !== id),
      autosaveStatus: 'dirty',
    }));
  }, []);

  const moveQuestion = useCallback((id: string, direction: 'up' | 'down') => {
    setState((prev) => {
      const index = prev.questions.findIndex((question) => question.id === id);
      if (index === -1) return prev;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.questions.length) return prev;
      const next = [...prev.questions];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, questions: next, autosaveStatus: 'dirty' };
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, step)),
    }));
    setStepError(null);
  }, []);

  const goNext = useCallback(async () => {
    if (requestLockRef.current || isSubmitting || isGeneratingQuestions || isSavingQuestions || isEnsuringDraft) return;
    const step = state.currentStep;
    const errorKey = validateCampaignWizardStep(state, step, { mode });
    if (errorKey) {
      setStepError(t(errorKey));
      setState((prev) => ({
        ...prev,
        errorSteps: Array.from(new Set([...prev.errorSteps, prev.currentStep])),
      }));
      return;
    }

    if (step === 4 && !campaignId) {
      setIsEnsuringDraft(true);
      setActionError(null);
      try {
        await fileActions.ensureDraftId();
      } catch (error) {
        const mapped = mapSubmitError(error, t, 'create');
        setActionError(mapped.message);
        if (mapped.step != null) {
          setState((prev) => ({
            ...prev,
            currentStep: mapped.step!,
            errorSteps: Array.from(new Set([...prev.errorSteps, mapped.step!])),
          }));
        }
        return;
      } finally {
        setIsEnsuringDraft(false);
      }
    }

    setStepError(null);
    setActionError(null);
    setState((prev) => ({
      ...prev,
      completedSteps: markCompleted(prev.completedSteps, prev.currentStep),
      errorSteps: clearError(prev.errorSteps, prev.currentStep),
      currentStep: Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, prev.currentStep + 1),
      autosaveStatus: 'dirty',
    }));
  }, [campaignId, fileActions, isEnsuringDraft, isGeneratingQuestions, isSavingQuestions, isSubmitting, mode, state, t]);

  const goBack = useCallback(() => {
    if (
      requestLockRef.current ||
      isSubmitting ||
      isGeneratingQuestions ||
      isSavingQuestions ||
      fileActions.isJdBusy ||
      fileActions.isCriteriaBusy
    ) {
      return;
    }
    setStepError(null);
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, [
    fileActions.isCriteriaBusy,
    fileActions.isJdBusy,
    isGeneratingQuestions,
    isSavingQuestions,
    isSubmitting,
  ]);

  /** POST create only when no Draft exists yet (file upload may have created one already). */
  const handleCreateCampaign = useCallback(async () => {
    if (requestLockRef.current || isSubmitting || mode !== 'create' || state.draftId) return;

    const validation = validateAllCampaignWizardSteps(state, { mode: 'create' });
    if (!validation.isValid) {
      const first = validation.errors[0];
      setStepError(t(first.messageKey));
      setState((prev) => ({
        ...prev,
        currentStep: first.step,
        errorSteps: Array.from(new Set([...prev.errorSteps, ...validation.errors.map((e) => e.step)])),
      }));
      return;
    }

    requestLockRef.current = true;
    setIsSubmitting(true);
    setActionError(null);
    setStepError(null);

    try {
      const request = buildCampaignCreateRequest(snapshot());
      const created = await onCreateCampaign(request);

      setState((prev) => ({
        ...prev,
        draftId: created.id,
        autosaveStatus: 'saved',
        lastSavedAt: new Date().toISOString(),
        completedSteps: markCompleted(prev.completedSteps, 6),
      }));
      toast.success(t('employer.campaigns.wizard.createSuccess'));
      onAfterSubmit(created);
    } catch (error) {
      const mapped = mapSubmitError(error, t, 'create');
      setActionError(mapped.message);
      if (mapped.step != null) {
        setState((prev) => ({
          ...prev,
          currentStep: mapped.step!,
          errorSteps: Array.from(new Set([...prev.errorSteps, mapped.step!])),
        }));
      }
    } finally {
      requestLockRef.current = false;
      setIsSubmitting(false);
    }
  }, [isSubmitting, mode, onAfterSubmit, onCreateCampaign, snapshot, state, t]);

  /** Save Draft metadata + questions — used for edit mode and create-after-ensureDraft. */
  const handleUpdateDraft = useCallback(async () => {
    if (requestLockRef.current || isSubmitting) return;
    if (mode === 'create' && !state.draftId) return;
    if (!campaignId) {
      setActionError(t('employer.campaigns.wizard.campaignNotFound'));
      return;
    }
    if (!isDraftEditable) {
      setActionError(t('employer.campaigns.wizard.notDraftEditable'));
      return;
    }

    const validation = validateAllCampaignWizardSteps(state, {
      mode: mode === 'create' && state.draftId ? 'edit' : mode,
    });
    if (!validation.isValid) {
      const first = validation.errors[0];
      setStepError(t(first.messageKey));
      setState((prev) => ({
        ...prev,
        currentStep: first.step,
        errorSteps: Array.from(new Set([...prev.errorSteps, ...validation.errors.map((e) => e.step)])),
      }));
      return;
    }

    requestLockRef.current = true;
    setIsSubmitting(true);
    setActionError(null);
    setStepError(null);

    const questionPayload = mapQuestionsToApiRequest(state.questions);
    if (questionPayload.length === 0) {
      requestLockRef.current = false;
      setIsSubmitting(false);
      setStepError(t('employer.campaigns.wizard.questionsRequired'));
      setState((prev) => ({
        ...prev,
        currentStep: 3,
        errorSteps: Array.from(new Set([...prev.errorSteps, 3])),
      }));
      return;
    }

    let metadataOk = metadataSaved;
    const currentSnapshot = snapshot();

    try {
      if (!metadataOk) {
        const dirtyPayload = baselineSnapshotRef.current
          ? buildDirtyUpdateRequest(baselineSnapshotRef.current, currentSnapshot)
          : buildCampaignUpdateRequest(currentSnapshot);
        if (Object.keys(dirtyPayload).length > 0) {
          await onUpdateCampaign(campaignId, dirtyPayload);
        }
        metadataOk = true;
        setMetadataSaved(true);
        baselineSnapshotRef.current = currentSnapshot;
      }

      const updated = await onUpdateQuestions(campaignId, questionPayload);
      setQuestionsSaved(true);
      setMetadataSaved(false);
      setQuestionsSaved(false);
      setState((prev) => ({
        ...prev,
        autosaveStatus: 'saved',
        lastSavedAt: new Date().toISOString(),
        completedSteps: markCompleted(prev.completedSteps, 6),
      }));
      toast.success(
        mode === 'create'
          ? t('employer.campaigns.wizard.createSuccess')
          : t('employer.campaigns.wizard.updateSuccess'),
      );
      onAfterSubmit(updated);
    } catch (error) {
      if (metadataOk && !questionsSaved) {
        setMetadataSaved(true);
        setQuestionsSaved(false);
        setActionError(t('employer.campaigns.wizard.partialUpdateQuestionsFailed'));
        const mapped = mapSubmitError(error, t, 'questions');
        if (mapped.step != null) {
          setState((prev) => ({
            ...prev,
            currentStep: mapped.step!,
            errorSteps: Array.from(new Set([...prev.errorSteps, mapped.step!])),
          }));
        }
      } else {
        const mapped = mapSubmitError(error, t, 'update');
        setActionError(mapped.message);
        if (mapped.step != null) {
          setState((prev) => ({
            ...prev,
            currentStep: mapped.step!,
            errorSteps: Array.from(new Set([...prev.errorSteps, mapped.step!])),
          }));
        }
      }
    } finally {
      requestLockRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    campaignId,
    isDraftEditable,
    isSubmitting,
    metadataSaved,
    mode,
    onAfterSubmit,
    onUpdateCampaign,
    onUpdateQuestions,
    questionsSaved,
    snapshot,
    state,
    t,
  ]);

  const retryQuestionsUpdate = useCallback(async () => {
    if (requestLockRef.current || isSubmitting || !campaignId || !metadataSaved) return;
    requestLockRef.current = true;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const questionPayload = mapQuestionsToApiRequest(state.questions);
      const updated = await onUpdateQuestions(campaignId, questionPayload);
      setMetadataSaved(false);
      setQuestionsSaved(false);
      toast.success(t('employer.campaigns.wizard.updateSuccess'));
      onAfterSubmit(updated);
    } catch (error) {
      setActionError(t('employer.campaigns.wizard.partialUpdateQuestionsFailed'));
      const mapped = mapSubmitError(error, t, 'questions');
      if (mapped.step != null) {
        setState((prev) => ({
          ...prev,
          currentStep: mapped.step!,
          errorSteps: Array.from(new Set([...prev.errorSteps, mapped.step!])),
        }));
      }
    } finally {
      requestLockRef.current = false;
      setIsSubmitting(false);
    }
  }, [campaignId, isSubmitting, metadataSaved, onAfterSubmit, onUpdateQuestions, state.questions, t]);

  const handleFinalSubmit = useCallback(() => {
    if (mode === 'create' && !state.draftId) {
      void handleCreateCampaign();
      return;
    }
    void handleUpdateDraft();
  }, [handleCreateCampaign, handleUpdateDraft, mode, state.draftId]);

  return {
    state,
    mode,
    step: state.currentStep,
    errorSteps: state.errorSteps,
    completedSteps: state.completedSteps,
    stepError,
    actionError,
    isSavingStep:
      fileActions.isJdBusy ||
      fileActions.isCriteriaBusy ||
      isGeneratingQuestions ||
      isSavingQuestions ||
      isEnsuringDraft,
    isGeneratingQuestions,
    isSavingQuestions,
    isEnsuringDraft,
    isSubmitting,
    metadataSaved,
    questionsSaved,
    isDraftEditable,
    totalWeight,
    domainLabel,
    jobCategory,
    patchInfo,
    patchJd,
    patchHardFilters,
    patchCriteria,
    patchSettings,
    selectJdFile: fileActions.selectJdFile,
    selectCriteriaFile: fileActions.selectCriteriaFile,
    retryJdUpload: fileActions.retryJdUpload,
    retryCriteriaUpload: fileActions.retryCriteriaUpload,
    downloadJdFile: fileActions.downloadJdFile,
    downloadCriteriaFile: fileActions.downloadCriteriaFile,
    canReplaceFiles: fileActions.canReplaceFiles,
    setRubric,
    resetRubric,
    setQuestionCount,
    setQuestionsPerSession,
    setQuestions,
    generateQuestionsWithAi,
    saveQuestionsNow,
    addManualQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    goNext,
    goBack,
    goToStep,
    handleFinalSubmit,
    retryQuestionsUpdate,
  };
}

export type CampaignWizardController = ReturnType<typeof useCampaignWizard>;
