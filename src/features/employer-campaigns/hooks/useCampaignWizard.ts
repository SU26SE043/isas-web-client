import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { DEFAULT_RUBRIC, QUESTION_BANK } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignQuestion,
  EmployerCampaign,
  RubricCriterion,
} from '../types/campaignManagement.types';
import type { CampaignCreateRequest, CampaignUpdateRequest } from '../types/campaign.api.types';
import type { CampaignCreateQuestionRequest } from '../types/campaign.api.types';
import {
  buildCampaignCreateRequest,
  buildCampaignUpdateRequest,
  mapQuestionsToApiRequest,
  resolveDomainOption,
} from '../utils/buildCampaignCreateRequest';
import {
  validateAllCampaignWizardSteps,
  validateCampaignWizardStep,
} from '../utils/validateCampaignWizard';
import {
  createEmptyCriteriaFileState,
  createEmptyJdState,
  decimalWeightsToPercent,
} from '../types/campaignWizard.types';
import type {
  CampaignInfoState,
  CampaignWizardPersistedState,
  CriteriaFileState,
  JobDescriptionState,
  QuestionSource,
  RubricSource,
} from '../types/campaignWizard.types';import { CAMPAIGN_WIZARD_STEP_COUNT } from '../components/wizard/campaignWizard.steps';

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

  return {
    title: campaign?.title ?? '',
    domain: resolveDomainOption(campaign?.domain ?? campaign?.company),
    targetLevel: '',
    maxCandidates: campaign?.capacity && campaign.capacity > 0 ? campaign.capacity : null,
    timeLimitMinutes: campaign?.durationMinutes || 60,
    passScorePct: campaign?.passScorePct ?? null,
    antiCheatEnabled: campaign?.antiCheatEnabled ?? true,
    startsAt: toDatetimeLocalValue(start),
    expiresAt: toDatetimeLocalValue(end),
    timezone: 'Asia/Ho_Chi_Minh',
  };
}

function buildInitialState(
  campaign?: EmployerCampaign | null,
  mode: CampaignFormMode = 'create',
): CampaignWizardPersistedState {
  const hasJdText = Boolean(campaign?.jobDescription?.trim());
  const initialRubric = decimalWeightsToPercent(
    campaign?.rubric?.length ? campaign.rubric : DEFAULT_RUBRIC,
  );
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
    criteria: createEmptyCriteriaFileState(),
    rubricSource: campaign?.rubric?.length ? 'manual' : 'ai',
    rubric: initialRubric,
    rubricSavedAt: campaign?.rubric?.length ? new Date().toISOString() : null,
    questionSource: campaign?.questions?.length ? 'ai' : null,
    questionCount: 5,
    questions: campaign?.questions?.length ? campaign.questions : [],
    currentStep: 0,
    completedSteps: mode === 'edit' ? [0, 1, 2, 3] : [],
    errorSteps: [],
    draftId: campaign?.id,
    autosaveStatus: 'idle',
    lastSavedAt: campaign?.updatedAt,
  };
}

function markCompleted(completed: number[], step: number) {
  return Array.from(new Set([...completed, step])).sort((a, b) => a - b);
}

function clearError(errorSteps: number[], step: number) {
  return errorSteps.filter((item) => item !== step);
}

function mapSubmitError(
  error: unknown,
  t: (key: string) => string,
  kind: 'create' | 'update' | 'questions',
): { message: string; step: number | null } {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error, '');
  const lower = message.toLowerCase();

  // Prefer the backend plain-text / message body when present.
  const preferApiMessage = Boolean(message.trim());

  if (status === 401) return { message: t('employer.campaigns.wizard.sessionExpired'), step: null };
  if (status === 403) {
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
  if (
    status === 400 &&
    (lower.includes('question') || lower.includes('câu hỏi') || kind === 'questions')
  ) {
    return {
      message: preferApiMessage ? message : t('employer.campaigns.wizard.questionsRequired'),
      step: 3,
    };
  }
  if (
    status === 400 &&
    (lower.includes('date') ||
      lower.includes('start') ||
      lower.includes('expir') ||
      lower.includes('past'))
  ) {
    return {
      message: preferApiMessage ? message : t('employer.campaigns.wizard.dateRangeInvalid'),
      step: 0,
    };
  }
  if (
    status === 400 &&
    (lower.includes('criteria') ||
      lower.includes('weight') ||
      lower.includes('maxscore') ||
      lower.includes('tiêu chí'))
  ) {
    return {
      message: preferApiMessage ? message : t('employer.campaigns.wizard.criteriaInvalid'),
      step: 2,
    };
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
  onUploadFiles: (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
    options?: { replace?: boolean },
  ) => Promise<EmployerCampaign>;
  onAfterSubmit: (campaign: EmployerCampaign) => void;
}

export function useCampaignWizard({
  campaign,
  mode,
  onCreateCampaign,
  onUpdateCampaign,
  onUpdateQuestions,
  onUploadFiles,
  onAfterSubmit,
}: UseCampaignWizardArgs) {
  const { t } = useLanguage();
  const [state, setState] = useState<CampaignWizardPersistedState>(() =>
    buildInitialState(campaign, mode),
  );
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [metadataSaved, setMetadataSaved] = useState(false);
  const [questionsSaved, setQuestionsSaved] = useState(false);
  const requestLockRef = useRef(false);
  const hydratedIdRef = useRef<string | null>(campaign?.id ?? null);

  useEffect(() => {
    if (mode !== 'edit' || !campaign?.id) return;
    if (hydratedIdRef.current === campaign.id) return;
    hydratedIdRef.current = campaign.id;
    setState(buildInitialState(campaign, 'edit'));
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

  const campaignId = state.draftId ?? campaign?.id ?? null;
  const campaignStatus = campaign?.status ?? null;
  const isDraftEditable = mode === 'create' || campaignStatus === 'draft';

  const patchInfo = useCallback((patch: Partial<CampaignInfoState>) => {
    setState((prev) => ({ ...prev, info: { ...prev.info, ...patch }, autosaveStatus: 'dirty' }));
  }, []);

  const patchJd = useCallback((patch: Partial<JobDescriptionState>) => {
    setState((prev) => ({ ...prev, jd: { ...prev.jd, ...patch }, autosaveStatus: 'dirty' }));
  }, []);

  const patchCriteria = useCallback((patch: Partial<CriteriaFileState>) => {
    setState((prev) => ({
      ...prev,
      criteria: { ...prev.criteria, ...patch },
      autosaveStatus: 'dirty',
    }));
  }, []);

  const ensureDraftId = useCallback(async (): Promise<string> => {
    const existing = state.draftId ?? campaign?.id;
    if (existing) return existing;

    const infoError = validateCampaignWizardStep(state, 0, { mode: 'create' });
    if (infoError) {
      throw new Error(infoError);
    }

    const request = buildCampaignCreateRequest({
      info: state.info,
      jd: state.jd,
      rubric: state.rubric,
      questions:
        state.questions.length > 0
          ? state.questions
          : [
              {
                id: 'placeholder',
                prompt: 'Temporary question — replace before publish',
                skill: '',
                difficulty: 'middle',
              },
            ],
      questionSource: state.questionSource ?? 'manual',
      criteriaText: null,
    });
    const created = await onCreateCampaign(request);
    setState((prev) => ({
      ...prev,
      draftId: created.id,
      lastSavedAt: created.updatedAt,
      autosaveStatus: 'saved',
    }));
    return created.id;
  }, [campaign?.id, onCreateCampaign, state]);

  const mapFileUploadError = useCallback(
    (error: unknown): string => {
      const status = getApiStatusCode(error);
      if (status === 404) return 'notFound';
      if (status === 409) return 'notDraft';
      if (status === 400) {
        const message = getApiErrorMessage(error, '').toLowerCase();
        if (message.includes('10') || message.includes('size') || message.includes('large')) {
          return 'tooLarge';
        }
        if (message.includes('pdf')) return 'notPdf';
        return 'server';
      }
      return 'server';
    },
    [],
  );

  const uploadJdFile = useCallback(
    async (file: File) => {
      if (requestLockRef.current) return;
      requestLockRef.current = true;
      setIsSavingStep(true);
      patchJd({
        jdFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileStatus: 'uploading',
        fileError: null,
        uploadProgress: 10,
        inputMethod: 'file',
      });
      try {
        const id = await ensureDraftId();
        const replace = Boolean(state.jd.serverUploaded);
        await onUploadFiles(id, { jdFile: file }, { replace });
        patchJd({
          jdFile: file,
          fileName: file.name,
          fileSize: file.size,
          fileStatus: 'uploaded',
          fileError: null,
          uploadProgress: 100,
          serverUploaded: true,
        });
        setStepError(null);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('employer.campaigns.')) {
          setStepError(t(error.message));
          setState((prev) => ({
            ...prev,
            currentStep: 0,
            errorSteps: Array.from(new Set([...prev.errorSteps, 0])),
          }));
        }
        patchJd({
          fileStatus: 'failed',
          fileError: mapFileUploadError(error),
          uploadProgress: null,
        });
      } finally {
        requestLockRef.current = false;
        setIsSavingStep(false);
      }
    },
    [ensureDraftId, mapFileUploadError, onUploadFiles, patchJd, state.jd.serverUploaded, t],
  );

  const uploadCriteriaFile = useCallback(
    async (file: File) => {
      if (requestLockRef.current) return;
      requestLockRef.current = true;
      setIsSavingStep(true);
      patchCriteria({
        criteriaFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileStatus: 'uploading',
        fileError: null,
        uploadProgress: 10,
        inputMethod: 'file',
      });
      try {
        const id = await ensureDraftId();
        const replace = Boolean(state.criteria.serverUploaded);
        await onUploadFiles(id, { criteriaFile: file }, { replace });
        patchCriteria({
          criteriaFile: file,
          fileName: file.name,
          fileSize: file.size,
          fileStatus: 'uploaded',
          fileError: null,
          uploadProgress: 100,
          serverUploaded: true,
        });
        setStepError(null);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('employer.campaigns.')) {
          setStepError(t(error.message));
          setState((prev) => ({
            ...prev,
            currentStep: 0,
            errorSteps: Array.from(new Set([...prev.errorSteps, 0])),
          }));
        }
        patchCriteria({
          fileStatus: 'failed',
          fileError: mapFileUploadError(error),
          uploadProgress: null,
        });
      } finally {
        requestLockRef.current = false;
        setIsSavingStep(false);
      }
    },
    [
      ensureDraftId,
      mapFileUploadError,
      onUploadFiles,
      patchCriteria,
      state.criteria.serverUploaded,
      t,
    ],
  );

  const retryJdUpload = useCallback(() => {
    const file = state.jd.jdFile;
    if (file) void uploadJdFile(file);
  }, [state.jd.jdFile, uploadJdFile]);

  const retryCriteriaUpload = useCallback(() => {
    const file = state.criteria.criteriaFile;
    if (file) void uploadCriteriaFile(file);
  }, [state.criteria.criteriaFile, uploadCriteriaFile]);

  const setRubricSource = useCallback((rubricSource: RubricSource) => {
    setState((prev) => ({ ...prev, rubricSource, autosaveStatus: 'dirty' }));
  }, []);

  const setRubric = useCallback((rubric: RubricCriterion[]) => {
    setState((prev) => ({ ...prev, rubric, autosaveStatus: 'dirty' }));
  }, []);

  const saveRubric = useCallback(() => {
    setState((prev) => ({ ...prev, rubricSavedAt: new Date().toISOString() }));
  }, []);

  const setQuestionSource = useCallback((questionSource: QuestionSource) => {
    setState((prev) => ({ ...prev, questionSource, autosaveStatus: 'dirty' }));
  }, []);

  const setQuestionCount = useCallback((questionCount: number) => {
    setState((prev) => ({ ...prev, questionCount }));
  }, []);

  const setQuestions = useCallback((questions: CampaignWizardPersistedState['questions']) => {
    setState((prev) => ({ ...prev, questions, autosaveStatus: 'dirty' }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, step)),
    }));
    setStepError(null);
  }, []);

  const snapshot = useCallback(
    () => ({
      info: state.info,
      jd: state.jd,
      rubric: state.rubric,
      questions: state.questions,
      questionSource: state.questionSource,
      criteriaText: null as string | null,
    }),
    [state.info, state.jd, state.questionSource, state.questions, state.rubric],
  );

  const goNext = useCallback(() => {
    if (requestLockRef.current || isSubmitting) return;
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

    setStepError(null);
    setActionError(null);
    setState((prev) => ({
      ...prev,
      completedSteps: markCompleted(prev.completedSteps, prev.currentStep),
      errorSteps: clearError(prev.errorSteps, prev.currentStep),
      currentStep: Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, prev.currentStep + 1),
      autosaveStatus: 'dirty',
    }));
  }, [isSubmitting, mode, state, t]);

  const goBack = useCallback(() => {
    if (requestLockRef.current || isSubmitting || isSavingStep) return;
    setStepError(null);
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, [isSavingStep, isSubmitting]);

  const handleCreateCampaign = useCallback(async () => {
    if (requestLockRef.current || isSubmitting || mode !== 'create') return;
    if (state.draftId) return;

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

      const jdFile =
        state.jd.inputMethod === 'file' && state.jd.jdFile && !state.jd.serverUploaded
          ? state.jd.jdFile
          : null;
      const criteriaFile =
        state.criteria.inputMethod === 'file' &&
        state.criteria.criteriaFile &&
        !state.criteria.serverUploaded
          ? state.criteria.criteriaFile
          : null;
      if (jdFile || criteriaFile) {
        await onUploadFiles(created.id, { jdFile, criteriaFile }, { replace: false });
      }

      setState((prev) => ({
        ...prev,
        draftId: created.id,
        autosaveStatus: 'saved',
        lastSavedAt: new Date().toISOString(),
        completedSteps: markCompleted(prev.completedSteps, 3),
        jd:
          jdFile != null
            ? { ...prev.jd, fileStatus: 'uploaded', serverUploaded: true, uploadProgress: 100 }
            : prev.jd,
        criteria:
          criteriaFile != null
            ? {
                ...prev.criteria,
                fileStatus: 'uploaded',
                serverUploaded: true,
                uploadProgress: 100,
              }
            : prev.criteria,
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
  }, [
    isSubmitting,
    mode,
    onAfterSubmit,
    onCreateCampaign,
    onUploadFiles,
    snapshot,
    state,
    t,
  ]);

  const handleUpdateDraft = useCallback(async () => {
    if (requestLockRef.current || isSubmitting) return;
    if (!campaignId) {
      setActionError(t('employer.campaigns.wizard.campaignNotFound'));
      return;
    }
    if (mode === 'edit' && !isDraftEditable) {
      setActionError(t('employer.campaigns.wizard.notDraftEditable'));
      return;
    }
    if (mode === 'create' && !state.draftId) return;

    const validation = validateAllCampaignWizardSteps(state, { mode: 'edit' });
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

    const questionPayload = mapQuestionsToApiRequest(state.questions, state.questionSource);
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

    try {
      if (!metadataOk) {
        const metadataPayload = buildCampaignUpdateRequest(snapshot());
        await onUpdateCampaign(campaignId, metadataPayload);
        metadataOk = true;
        setMetadataSaved(true);
      }

      const updated = await onUpdateQuestions(campaignId, questionPayload);
      setQuestionsSaved(true);
      setMetadataSaved(false);
      setQuestionsSaved(false);
      setState((prev) => ({
        ...prev,
        autosaveStatus: 'saved',
        lastSavedAt: new Date().toISOString(),
        completedSteps: markCompleted(prev.completedSteps, 3),
      }));
      toast.success(t('employer.campaigns.wizard.updateSuccess'));
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
      const questionPayload = mapQuestionsToApiRequest(state.questions, state.questionSource);
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
  }, [
    campaignId,
    isSubmitting,
    metadataSaved,
    onAfterSubmit,
    onUpdateQuestions,
    state.questionSource,
    state.questions,
    t,
  ]);

  const handleFinalSubmit = useCallback(() => {
    if (mode === 'create' && !state.draftId) {
      void handleCreateCampaign();
      return;
    }
    void handleUpdateDraft();
  }, [handleCreateCampaign, handleUpdateDraft, mode, state.draftId]);

  const generateQuestionsWithAi = useCallback(() => {
    const count = Math.max(1, Math.min(state.questionCount, QUESTION_BANK.length));
    const generated = QUESTION_BANK.slice(0, count).map((item, index) => ({
      ...item,
      id: `ai-q-${index}-${Date.now().toString(36)}`,
    }));
    setState((prev) => ({
      ...prev,
      questionSource: 'ai',
      questions: generated,
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 3),
    }));
  }, [state.questionCount]);

  const generateRubricWithAi = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rubricSource: 'ai',
      rubric: decimalWeightsToPercent(DEFAULT_RUBRIC),
      rubricSavedAt: new Date().toISOString(),
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 2),
    }));
  }, []);

  const resetRubric = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rubricSource: 'ai',
      rubric: decimalWeightsToPercent(DEFAULT_RUBRIC),
      rubricSavedAt: null,
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 2),
    }));
  }, []);

  return {
    state,
    mode,
    step: state.currentStep,
    errorSteps: state.errorSteps,
    completedSteps: state.completedSteps,
    stepError,
    actionError,
    isSavingStep,
    isSubmitting,
    metadataSaved,
    questionsSaved,
    isDraftEditable,
    totalWeight,
    domainLabel,
    patchInfo,
    patchJd,
    patchCriteria,
    uploadJdFile,
    uploadCriteriaFile,
    retryJdUpload,
    retryCriteriaUpload,
    setRubricSource,
    setRubric,
    saveRubric,
    setQuestionSource,
    setQuestionCount,
    setQuestions,
    goNext,
    goBack,
    goToStep,
    handleFinalSubmit,
    retryQuestionsUpdate,
    generateQuestionsWithAi,
    generateRubricWithAi,
    resetRubric,
  };
}

export type CampaignWizardController = ReturnType<typeof useCampaignWizard>;
