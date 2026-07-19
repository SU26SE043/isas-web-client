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
import type {
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignUpdateRequest,
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
  createEmptyJdState,
  decimalWeightsToPercent,
} from '../types/campaignWizard.types';
import type {
  CampaignInfoState,
  CampaignSettingsState,
  CampaignWizardPersistedState,
  JobDescriptionState,
} from '../types/campaignWizard.types';
import { validateCampaignJdPdf } from '../components/wizard/jd/JobDescriptionFilePanel';
import { CAMPAIGN_WIZARD_STEP_COUNT } from '../components/wizard/campaignWizard.steps';

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
    maxCandidates: campaign?.capacity && campaign.capacity > 0 ? campaign.capacity : null,
    timeLimitMinutes: campaign?.durationMinutes || 60,
    passScorePct: campaign?.passScorePct ?? null,
    startsAt: toDatetimeLocalValue(start),
    expiresAt: toDatetimeLocalValue(end),
    timezone: 'Asia/Ho_Chi_Minh',
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
    rubric: initialRubric,
    questions: campaign?.questions?.length ? campaign.questions : [],
    questionCount: 5,
    settings: defaultSettings(campaign),
    currentStep: 0,
    completedSteps: mode === 'edit' ? [0, 1, 2, 3, 4, 5] : [],
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
    rubric: state.rubric,
    questions: state.questions,
    settings: state.settings,
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

  const campaignId = state.draftId ?? campaign?.id ?? null;
  const campaignStatus = campaign?.status ?? null;
  const isDraftEditable = mode === 'create' || campaignStatus === 'draft';

  const patchInfo = useCallback((patch: Partial<CampaignInfoState>) => {
    setState((prev) => ({ ...prev, info: { ...prev.info, ...patch }, autosaveStatus: 'dirty' }));
  }, []);

  const patchJd = useCallback((patch: Partial<JobDescriptionState>) => {
    setState((prev) => ({ ...prev, jd: { ...prev.jd, ...patch }, autosaveStatus: 'dirty' }));
  }, []);

  const patchSettings = useCallback((patch: Partial<CampaignSettingsState>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 4),
    }));
  }, []);

  const mapFileUploadError = useCallback((error: unknown): string => {
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
  }, []);

  /** Edit mode only — create mode keeps the JD file local until final submit. */
  const uploadJdFileNow = useCallback(
    async (file: File) => {
      if (requestLockRef.current || !campaignId) return;
      requestLockRef.current = true;
      setIsSavingStep(true);
      patchJd({ fileStatus: 'uploading', fileError: null, uploadProgress: 10 });
      try {
        const replace = Boolean(state.jd.serverUploaded);
        await onUploadFiles(campaignId, { jdFile: file }, { replace });
        patchJd({
          fileStatus: 'uploaded',
          fileError: null,
          uploadProgress: 100,
          serverUploaded: true,
        });
        setStepError(null);
      } catch (error) {
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
    [campaignId, mapFileUploadError, onUploadFiles, patchJd, state.jd.serverUploaded],
  );

  const selectJdFile = useCallback(
    (file: File | null) => {
      if (!file) {
        patchJd({
          jdFile: null,
          fileName: null,
          fileSize: null,
          fileStatus: 'idle',
          fileError: null,
          uploadProgress: null,
          serverUploaded: false,
        });
        return;
      }
      const code = validateCampaignJdPdf(file);
      if (code) {
        patchJd({
          jdFile: null,
          fileName: file.name,
          fileSize: file.size,
          fileStatus: 'failed',
          fileError: code,
          uploadProgress: null,
        });
        return;
      }
      patchJd({
        jdFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileStatus: 'selected',
        fileError: null,
        uploadProgress: null,
        inputMethod: 'file',
      });
      // Local-only on create; edit mode uploads immediately via the existing files API.
      if (mode === 'edit' && campaignId) {
        void uploadJdFileNow(file);
      }
    },
    [campaignId, mode, patchJd, uploadJdFileNow],
  );

  const retryJdUpload = useCallback(() => {
    const file = state.jd.jdFile;
    if (file && mode === 'edit') void uploadJdFileNow(file);
  }, [mode, state.jd.jdFile, uploadJdFileNow]);

  const setRubric = useCallback((rubric: RubricCriterion[]) => {
    setState((prev) => ({ ...prev, rubric, autosaveStatus: 'dirty' }));
  }, []);

  const resetRubric = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rubric: decimalWeightsToPercent(DEFAULT_RUBRIC),
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 2),
    }));
  }, []);

  const setQuestionCount = useCallback((questionCount: number) => {
    setState((prev) => ({ ...prev, questionCount }));
  }, []);

  const setQuestions = useCallback((questions: CampaignQuestion[]) => {
    setState((prev) => ({
      ...prev,
      questions,
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 3),
    }));
  }, []);

  const generateQuestionsWithAi = useCallback(() => {
    const count = Math.max(1, Math.min(state.questionCount, QUESTION_BANK.length));
    const generated = QUESTION_BANK.slice(0, count).map((item, index) => ({
      ...item,
      id: `ai-q-${index}-${Date.now().toString(36)}`,
      source: 'ai' as const,
      isRequired: true,
    }));
    setState((prev) => ({
      ...prev,
      questions: generated,
      autosaveStatus: 'dirty',
      errorSteps: clearError(prev.errorSteps, 3),
    }));
  }, [state.questionCount]);

  const addManualQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `manual-${Date.now().toString(36)}-${prev.questions.length}`,
          prompt: '',
          skill: '',
          difficulty: 'middle' as const,
          source: 'manual' as const,
          isRequired: true,
        },
      ],
      autosaveStatus: 'dirty',
    }));
  }, []);

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

  const snapshot = useCallback(() => toSnapshot(state), [state]);

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

  /** Only entry point that calls POST /api/v1/campaign — final step of the wizard. */
  const handleCreateCampaign = useCallback(async () => {
    if (requestLockRef.current || isSubmitting || mode !== 'create') return;

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
      if (jdFile) {
        await onUploadFiles(created.id, { jdFile }, { replace: false });
      }

      setState((prev) => ({
        ...prev,
        draftId: created.id,
        autosaveStatus: 'saved',
        lastSavedAt: new Date().toISOString(),
        completedSteps: markCompleted(prev.completedSteps, 5),
        jd:
          jdFile != null
            ? { ...prev.jd, fileStatus: 'uploaded', serverUploaded: true, uploadProgress: 100 }
            : prev.jd,
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
  }, [isSubmitting, mode, onAfterSubmit, onCreateCampaign, onUploadFiles, snapshot, state, t]);

  /** Edit mode save — PUT dirty metadata fields, then PUT the full question list. */
  const handleUpdateDraft = useCallback(async () => {
    if (requestLockRef.current || isSubmitting || mode !== 'edit') return;
    if (!campaignId) {
      setActionError(t('employer.campaigns.wizard.campaignNotFound'));
      return;
    }
    if (!isDraftEditable) {
      setActionError(t('employer.campaigns.wizard.notDraftEditable'));
      return;
    }

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
        completedSteps: markCompleted(prev.completedSteps, 5),
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
    if (mode === 'create') {
      void handleCreateCampaign();
      return;
    }
    void handleUpdateDraft();
  }, [handleCreateCampaign, handleUpdateDraft, mode]);

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
    patchSettings,
    selectJdFile,
    retryJdUpload,
    setRubric,
    resetRubric,
    setQuestionCount,
    setQuestions,
    generateQuestionsWithAi,
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
