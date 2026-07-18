import { useCallback, useMemo, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { DEFAULT_PROCTORING, DEFAULT_RUBRIC, QUESTION_BANK } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignDraftInput,
  CampaignLocale,
  EmployerCampaign,
  EmployerCampaignMode,
  RubricCriterion,
} from '../types/campaignManagement.types';
import type {
  CampaignInfoState,
  CampaignWizardPersistedState,
  CandidateInviteMethod,
  InvitationEmailState,
  JdAnalysisState,
  QuestionSource,
  RankedCandidate,
  RubricSource,
} from '../types/campaignWizard.types';
import {
  createDefaultInvitationEmail,
  createEmptyJdState,
  decimalWeightsToPercent,
  percentWeightsToDecimal,
} from '../types/campaignWizard.types';
import { CAMPAIGN_WIZARD_STEP_COUNT } from '../components/wizard/campaignWizard.steps';

function defaultInfo(campaign?: EmployerCampaign | null): CampaignInfoState {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 30);
  return {
    title: campaign?.title ?? '',
    domain: '',
    customDomain: '',
    targetLevel: '',
    jobTitle: '',
    maxCandidates: campaign?.capacity ?? null,
    timeLimitMinutes: campaign?.durationMinutes ?? 60,
    antiCheatEnabled: true,
    startsAt: today.toISOString().slice(0, 16),
    expiresAt: (campaign?.deadline
      ? new Date(campaign.deadline)
      : end
    )
      .toISOString()
      .slice(0, 16),
    timezone: 'Asia/Ho_Chi_Minh',
    description: '',
  };
}

function buildInitialState(campaign?: EmployerCampaign | null): CampaignWizardPersistedState {
  const info = defaultInfo(campaign);
  const rubric = decimalWeightsToPercent(
    campaign?.rubric?.length ? campaign.rubric : DEFAULT_RUBRIC,
  );
  return {
    info,
    jd: {
      ...createEmptyJdState(),
      summary: campaign?.jobDescription ?? '',
      jdText: campaign?.jobDescription ?? '',
      status: campaign?.jobDescription ? 'ready' : 'idle',
      source: campaign?.jobDescription ? 'paste' : null,
    },
    rubricSource: campaign?.rubric?.length ? 'ai' : null,
    rubric,
    rubricSavedAt: null,
    questionSource: campaign?.questions?.length ? 'ai' : null,
    questionCount: 5,
    questions: campaign?.questions?.length ? campaign.questions : [],
    candidateMethod: null,
    candidateEmails: campaign?.invitedEmails ?? [],
    rankedCandidates: [],
    matchThreshold: 70,
    magicLink: {
      url: '',
      campaignCode: '',
      expiresAt: '',
      status: 'idle',
      candidateCount: 0,
    },
    invitationEmail: createDefaultInvitationEmail(info.title),
    currentStep: 0,
    completedSteps: [],
    errorSteps: [],
    draftId: campaign?.id,
    autosaveStatus: 'idle',
    publishConfirmed: false,
  };
}

function markCompleted(completed: number[], step: number) {
  return Array.from(new Set([...completed, step])).sort((a, b) => a - b);
}

function clearError(errorSteps: number[], step: number) {
  return errorSteps.filter((item) => item !== step);
}

interface UseCampaignWizardArgs {
  campaign?: EmployerCampaign | null;
  onSaveDraft: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
  onPublish: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
}

export function useCampaignWizard({ campaign, onSaveDraft, onPublish }: UseCampaignWizardArgs) {
  const { t } = useLanguage();
  const [state, setState] = useState<CampaignWizardPersistedState>(() => buildInitialState(campaign));
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const totalWeightPercent = useMemo(
    () => state.rubric.reduce((sum, item) => sum + Number(item.weight), 0),
    [state.rubric],
  );

  const selectedCandidates = useMemo(
    () => state.rankedCandidates.filter((item) => item.selected),
    [state.rankedCandidates],
  );

  const invitedEmails = useMemo(() => {
    if (state.candidateMethod === 'cv-ranking') {
      return selectedCandidates.map((item) => item.email);
    }
    return state.candidateEmails;
  }, [selectedCandidates, state.candidateEmails, state.candidateMethod]);

  const patchInfo = useCallback((patch: Partial<CampaignInfoState>) => {
    setState((prev) => ({ ...prev, info: { ...prev.info, ...patch }, autosaveStatus: 'idle' }));
  }, []);

  const patchJd = useCallback((patch: Partial<JdAnalysisState>) => {
    setState((prev) => ({ ...prev, jd: { ...prev.jd, ...patch }, autosaveStatus: 'idle' }));
  }, []);

  const setRubricSource = useCallback((rubricSource: RubricSource) => {
    setState((prev) => ({ ...prev, rubricSource }));
  }, []);

  const setRubric = useCallback((rubric: RubricCriterion[]) => {
    setState((prev) => ({ ...prev, rubric }));
  }, []);

  const saveRubric = useCallback(() => {
    setState((prev) => ({ ...prev, rubricSavedAt: new Date().toISOString() }));
  }, []);

  const setQuestionSource = useCallback((questionSource: QuestionSource) => {
    setState((prev) => ({ ...prev, questionSource }));
  }, []);

  const setQuestionCount = useCallback((questionCount: number) => {
    setState((prev) => ({ ...prev, questionCount }));
  }, []);

  const setQuestions = useCallback((questions: CampaignWizardPersistedState['questions']) => {
    setState((prev) => ({ ...prev, questions }));
  }, []);

  const setCandidateMethod = useCallback((candidateMethod: CandidateInviteMethod) => {
    setState((prev) => ({ ...prev, candidateMethod }));
  }, []);

  const setCandidateEmails = useCallback((candidateEmails: string[]) => {
    setState((prev) => ({ ...prev, candidateEmails }));
  }, []);

  const setRankedCandidates = useCallback((rankedCandidates: RankedCandidate[]) => {
    setState((prev) => ({ ...prev, rankedCandidates }));
  }, []);

  const setMatchThreshold = useCallback((matchThreshold: number) => {
    setState((prev) => ({ ...prev, matchThreshold }));
  }, []);

  const setInvitationEmail = useCallback((invitationEmail: InvitationEmailState) => {
    setState((prev) => ({ ...prev, invitationEmail }));
  }, []);

  const setPublishConfirmed = useCallback((publishConfirmed: boolean) => {
    setState((prev) => ({ ...prev, publishConfirmed }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, step)),
    }));
    setStepError(null);
  }, []);

  const validateStep = useCallback(
    (step: number): string | null => {
      const { info, jd, questions, candidateMethod, magicLink, invitationEmail, publishConfirmed } =
        state;
      if (step === 0) {
        if (!info.title.trim()) return t('employer.campaigns.form.required');
        if (!info.domain) return t('employer.campaigns.form.required');
        if (!info.targetLevel) return t('employer.campaigns.form.required');
        if (!info.timeLimitMinutes || info.timeLimitMinutes < 1) {
          return t('employer.campaigns.form.required');
        }
        if (!info.startsAt || !info.expiresAt) return t('employer.campaigns.form.required');
        if (info.expiresAt <= info.startsAt) return t('employer.campaigns.wizard.dateRangeInvalid');
        return null;
      }
      if (step === 1) {
        const hasContent =
          jd.status === 'ready' || jd.summary.trim() || jd.jdText.trim() || jd.responsibilities.trim();
        if (!hasContent) return t('employer.campaigns.wizard.jdRequired');
        return null;
      }
      if (step === 2) {
        if (state.rubric.length === 0) return t('employer.campaigns.wizard.criteriaRequired');
        if (Math.round(totalWeightPercent) !== 100) return t('employer.campaigns.form.weightHelp');
        if (!state.rubricSavedAt) return t('employer.campaigns.wizard.rubricSaveRequired');
        return null;
      }
      if (step === 3) {
        if (questions.length === 0) return t('employer.campaigns.form.noQuestions');
        if (questions.some((q) => !q.prompt.trim())) return t('employer.campaigns.form.required');
        return null;
      }
      if (step === 4) {
        if (!candidateMethod) return t('employer.campaigns.wizard.candidateMethodRequired');
        if (candidateMethod === 'emails' && state.candidateEmails.length === 0) {
          return t('employer.campaigns.wizard.candidatesRequired');
        }
        return null;
      }
      if (step === 5) {
        if (candidateMethod === 'cv-ranking' && selectedCandidates.length === 0) {
          return t('employer.campaigns.wizard.candidatesRequired');
        }
        return null;
      }
      if (step === 6) {
        if (magicLink.status !== 'ready') return t('employer.campaigns.wizard.magicLinkRequired');
        return null;
      }
      if (step === 7) {
        if (!invitationEmail.subject.trim() || !invitationEmail.body.trim()) {
          return t('employer.campaigns.form.required');
        }
        return null;
      }
      if (step === 9 && !publishConfirmed) {
        return t('employer.campaigns.wizard.publishConfirmRequired');
      }
      return null;
    },
    [selectedCandidates.length, state, t, totalWeightPercent],
  );

  const goNext = useCallback(() => {
    const error = validateStep(state.currentStep);
    if (error) {
      setStepError(error);
      setState((prev) => ({
        ...prev,
        errorSteps: Array.from(new Set([...prev.errorSteps, prev.currentStep])),
      }));
      return;
    }
    setStepError(null);
    setState((prev) => {
      let next = Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, prev.currentStep + 1);
      // Email-list path skips CV ranking screen.
      if (prev.currentStep === 4 && prev.candidateMethod === 'emails') next = 6;
      return {
        ...prev,
        completedSteps: markCompleted(prev.completedSteps, prev.currentStep),
        errorSteps: clearError(prev.errorSteps, prev.currentStep),
        currentStep: next,
      };
    });
  }, [state.currentStep, validateStep]);

  const goBack = useCallback(() => {
    setStepError(null);
    setState((prev) => {
      let next = Math.max(0, prev.currentStep - 1);
      if (prev.currentStep === 6 && prev.candidateMethod === 'emails') next = 4;
      return { ...prev, currentStep: next };
    });
  }, []);

  const buildDraftInput = useCallback((): CampaignDraftInput => {
    const domainLabel = state.info.domain || 'Organization';
    const capacity =
      state.info.maxCandidates && state.info.maxCandidates > 0
        ? state.info.maxCandidates
        : Math.max(invitedEmails.length || 1, 1);
    return {
      title: state.info.title,
      company: domainLabel,
      location: state.info.timezone,
      mode: 'remote',
      summary: state.jd.summary || state.info.title,
      jobDescription:
        state.jd.jdText || state.jd.summary || state.jd.responsibilities || state.info.title,
      capacity,
      deadline: state.info.expiresAt,
      durationMinutes: state.info.timeLimitMinutes,
      locale: 'vi',
      rubric: percentWeightsToDecimal(state.rubric),
      questions: state.questions,
      proctoring: {
        ...DEFAULT_PROCTORING,
        maxViolations: state.info.antiCheatEnabled ? DEFAULT_PROCTORING.maxViolations : 0,
      },
      welcomeMessage: state.invitationEmail.body.slice(0, 280),
      completionMessage: 'Thank you for completing the interview.',
    };
  }, [invitedEmails.length, state]);

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    setSaved(false);
    setPublishError(null);
    setState((prev) => ({ ...prev, autosaveStatus: 'saving' }));
    try {
      const savedCampaign = await onSaveDraft(buildDraftInput());
      const savedAt = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        draftId: savedCampaign.id,
        lastSavedAt: savedAt,
        autosaveStatus: 'saved',
      }));
      setSaved(true);
    } catch {
      setState((prev) => ({
        ...prev,
        autosaveStatus: 'failed',
        errorSteps: Array.from(new Set([...prev.errorSteps, prev.currentStep])),
      }));
      setStepError(t('employer.campaigns.wizard.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [buildDraftInput, onSaveDraft, t]);

  const handlePublish = useCallback(async () => {
    setPublishError(null);
    const confirmError = validateStep(9);
    if (confirmError) {
      setPublishError(confirmError);
      return;
    }
    for (let step = 0; step < 9; step += 1) {
      if (step === 5 && state.candidateMethod === 'emails') continue;
      const error = validateStep(step);
      if (error) {
        setPublishError(error);
        setState((prev) => ({
          ...prev,
          currentStep: step,
          errorSteps: Array.from(new Set([...prev.errorSteps, step])),
        }));
        return;
      }
    }
    setIsPublishing(true);
    try {
      await onPublish(buildDraftInput());
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : t('employer.campaigns.wizard.publishFailed'),
      );
      setState((prev) => ({
        ...prev,
        errorSteps: Array.from(new Set([...prev.errorSteps, 9])),
      }));
    } finally {
      setIsPublishing(false);
    }
  }, [buildDraftInput, onPublish, state.candidateMethod, t, validateStep]);

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
      errorSteps: clearError(prev.errorSteps, 3),
    }));
  }, [state.questionCount]);

  const generateRubricWithAi = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rubricSource: 'ai',
      rubric: decimalWeightsToPercent(DEFAULT_RUBRIC),
      errorSteps: clearError(prev.errorSteps, 2),
    }));
  }, []);

  const simulateJdUpload = useCallback((file: File) => {
    setState((prev) => ({
      ...prev,
      jd: {
        ...prev.jd,
        source: 'file',
        fileName: file.name,
        fileSize: file.size,
        status: 'uploading',
        errorKey: undefined,
      },
    }));
    window.setTimeout(() => {
      setState((prev) => ({ ...prev, jd: { ...prev.jd, status: 'analyzing' } }));
    }, 400);
    window.setTimeout(() => {
      setState((prev) => ({
        ...prev,
        jd: {
          ...prev.jd,
          status: 'ready',
          jobTitle: prev.info.title || 'Software Engineer',
          domain: prev.info.domain || 'frontend',
          targetLevel: prev.info.targetLevel || 'Junior',
          yearsExperience: '1-3',
          technicalSkills: ['TypeScript', 'React', 'REST'],
          frameworks: ['React', 'Vite'],
          tools: ['Git', 'Figma'],
          softSkills: ['Communication', 'Ownership'],
          responsibilities: 'Build and maintain product UI surfaces.',
          requiredQualifications: 'Solid TypeScript and React experience.',
          preferredQualifications: 'Experience with design systems.',
          keywords: ['React', 'TypeScript', 'Accessibility'],
          summary:
            prev.jd.summary ||
            prev.jd.jdText ||
            'Own React surfaces, async state, accessibility, and API integration.',
          jdText:
            prev.jd.jdText ||
            prev.jd.summary ||
            'Own React surfaces, async state, accessibility, and API integration.',
        },
        errorSteps: clearError(prev.errorSteps, 1),
      }));
    }, 1100);
  }, []);

  const generateMagicLink = useCallback(() => {
    const code = `CMP-${Date.now().toString(36).toUpperCase()}`;
    setState((prev) => ({
      ...prev,
      magicLink: {
        url: `${window.location.origin}/invite/${code.toLowerCase()}`,
        campaignCode: code,
        expiresAt: prev.info.expiresAt,
        status: 'ready',
        candidateCount: invitedEmails.length,
      },
      errorSteps: clearError(prev.errorSteps, 6),
    }));
  }, [invitedEmails.length]);

  const simulateCvRanking = useCallback(() => {
    const samples: RankedCandidate[] = [
      {
        id: 'cv-1',
        name: 'Mai Nguyen',
        email: 'mai.nguyen@example.com',
        overallMatch: 88,
        technicalMatch: 90,
        experienceMatch: 82,
        skillsMatch: 91,
        selected: true,
      },
      {
        id: 'cv-2',
        name: 'An Tran',
        email: 'an.tran@example.com',
        overallMatch: 74,
        technicalMatch: 70,
        experienceMatch: 76,
        skillsMatch: 78,
        selected: false,
      },
      {
        id: 'cv-3',
        name: 'Lan Pham',
        email: 'lan.pham@example.com',
        overallMatch: 61,
        technicalMatch: 58,
        experienceMatch: 64,
        skillsMatch: 60,
        selected: false,
      },
    ];
    setState((prev) => ({
      ...prev,
      candidateMethod: 'cv-ranking',
      rankedCandidates: samples,
      errorSteps: clearError(prev.errorSteps, 4),
    }));
  }, []);

  return {
    state,
    step: state.currentStep,
    errorSteps: state.errorSteps,
    completedSteps: state.completedSteps,
    stepError,
    saved,
    isSaving,
    isPublishing,
    publishError,
    totalWeight: totalWeightPercent,
    invitedEmails,
    selectedCandidates,
    patchInfo,
    patchJd,
    setRubricSource,
    setRubric,
    saveRubric,
    setQuestionSource,
    setQuestionCount,
    setQuestions,
    setCandidateMethod,
    setCandidateEmails,
    setRankedCandidates,
    setMatchThreshold,
    setInvitationEmail,
    setPublishConfirmed,
    goNext,
    goBack,
    goToStep,
    handleSaveDraft,
    handlePublish,
    generateQuestionsWithAi,
    generateRubricWithAi,
    simulateJdUpload,
    generateMagicLink,
    simulateCvRanking,
  };
}

export type CampaignWizardController = ReturnType<typeof useCampaignWizard>;

/** @deprecated Legacy RHF shape kept for older step files during migration. */
export type CampaignWizardValues = {
  title: string;
  company: string;
  location: string;
  mode: EmployerCampaignMode;
  summary: string;
  jobDescription: string;
  capacity: number;
  deadline: string;
  durationMinutes: number;
  locale: CampaignLocale;
  welcomeMessage: string;
  completionMessage: string;
};
