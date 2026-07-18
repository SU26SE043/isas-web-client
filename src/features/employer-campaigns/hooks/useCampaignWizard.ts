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
  MagicLinkState,
  QuestionSource,
  RankedCandidate,
  RubricSource,
} from '../types/campaignWizard.types';
import {
  createDefaultInvitationEmail,
  createEmptyJdState,
} from '../types/campaignWizard.types';
import {
  CAMPAIGN_WIZARD_STEP_COUNT,
} from '../components/wizard/campaignWizard.steps';

function defaultInfo(campaign?: EmployerCampaign | null): CampaignInfoState {
  return {
    name: campaign?.title ?? '',
    domain: '',
    customDomain: '',
    targetLevel: '',
    jobTitle: campaign?.title ?? '',
    hireCount: Math.max(1, campaign?.capacity ? Math.min(campaign.capacity, 10) : 1),
    startDate: new Date().toISOString().slice(0, 10),
    endDate: campaign?.deadline?.slice(0, 10) || '',
    joinDeadline: campaign?.deadline?.slice(0, 10) || '',
    timezone: 'Asia/Ho_Chi_Minh',
    description: campaign?.summary ?? '',
  };
}

function buildInitialState(campaign?: EmployerCampaign | null): CampaignWizardPersistedState {
  const info = defaultInfo(campaign);
  return {
    info,
    jd: {
      ...createEmptyJdState(),
      summary: campaign?.jobDescription ?? '',
      status: campaign?.jobDescription ? 'ready' : 'idle',
    },
    rubricSource: campaign?.rubric?.length ? 'ai' : null,
    rubric: campaign?.rubric?.length ? campaign.rubric : DEFAULT_RUBRIC,
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
    invitationEmail: createDefaultInvitationEmail(info.name),
    currentStep: 0,
    completedSteps: [],
    errorSteps: [],
    draftId: campaign?.id,
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

  const totalWeight = useMemo(
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
    setState((prev) => ({ ...prev, info: { ...prev.info, ...patch } }));
  }, []);

  const patchJd = useCallback((patch: Partial<JdAnalysisState>) => {
    setState((prev) => ({ ...prev, jd: { ...prev.jd, ...patch } }));
  }, []);

  const setRubricSource = useCallback((rubricSource: RubricSource) => {
    setState((prev) => ({ ...prev, rubricSource }));
  }, []);

  const setRubric = useCallback((rubric: RubricCriterion[]) => {
    setState((prev) => ({ ...prev, rubric }));
  }, []);

  const saveRubric = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rubricSavedAt: new Date().toISOString(),
    }));
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

  const setMagicLink = useCallback((magicLink: MagicLinkState) => {
    setState((prev) => ({ ...prev, magicLink }));
  }, []);

  const setInvitationEmail = useCallback((invitationEmail: InvitationEmailState) => {
    setState((prev) => ({ ...prev, invitationEmail }));
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
      const { info, jd, questions, candidateMethod, magicLink, invitationEmail } = state;
      if (step === 0) {
        if (!info.name.trim()) return t('employer.campaigns.form.required');
        if (!info.domain) return t('employer.campaigns.form.required');
        if (info.domain === 'other' && !info.customDomain.trim()) {
          return t('employer.campaigns.form.required');
        }
        if (!info.targetLevel) return t('employer.campaigns.form.required');
        if (!info.jobTitle.trim()) return t('employer.campaigns.form.required');
        if (!info.startDate || !info.endDate) return t('employer.campaigns.form.required');
        if (info.endDate < info.startDate) return t('employer.campaigns.wizard.dateRangeInvalid');
        return null;
      }
      if (step === 1) {
        if (jd.status !== 'ready' && !jd.summary.trim()) {
          return t('employer.campaigns.wizard.jdRequired');
        }
        return null;
      }
      if (step === 2) {
        if (totalWeight !== 100) return t('employer.campaigns.form.weightHelp');
        if (!state.rubricSavedAt) return t('employer.campaigns.wizard.rubricSaveRequired');
        return null;
      }
      if (step === 3) {
        if (questions.length === 0) return t('employer.campaigns.form.noQuestions');
        return null;
      }
      if (step === 4) {
        if (!candidateMethod) return t('employer.campaigns.wizard.candidateMethodRequired');
        if (invitedEmails.length === 0) return t('employer.campaigns.wizard.candidatesRequired');
        return null;
      }
      if (step === 5) {
        if (magicLink.status !== 'ready') return t('employer.campaigns.wizard.magicLinkRequired');
        return null;
      }
      if (step === 6) {
        if (!invitationEmail.subject.trim() || !invitationEmail.body.trim()) {
          return t('employer.campaigns.form.required');
        }
        return null;
      }
      return null;
    },
    [invitedEmails.length, state, t, totalWeight],
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
    setState((prev) => ({
      ...prev,
      completedSteps: markCompleted(prev.completedSteps, prev.currentStep),
      errorSteps: clearError(prev.errorSteps, prev.currentStep),
      currentStep: Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, prev.currentStep + 1),
    }));
  }, [state.currentStep, validateStep]);

  const goBack = useCallback(() => {
    setStepError(null);
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const buildDraftInput = useCallback((): CampaignDraftInput => {
    const domainLabel =
      state.info.domain === 'other'
        ? state.info.customDomain
        : state.info.domain || state.info.jobTitle;
    return {
      title: state.info.name,
      company: domainLabel || 'Organization',
      location: state.info.timezone,
      mode: 'remote',
      summary: state.info.description,
      jobDescription: state.jd.summary || state.jd.responsibilities || state.info.description,
      capacity: Math.max(state.info.hireCount, invitedEmails.length || 1),
      deadline: state.info.joinDeadline || state.info.endDate,
      durationMinutes: Math.max(15, state.questions.length * 5),
      locale: 'vi',
      rubric: state.rubric,
      questions: state.questions,
      proctoring: DEFAULT_PROCTORING,
      welcomeMessage: state.invitationEmail.body.slice(0, 280),
      completionMessage: 'Thank you for completing the interview.',
    };
  }, [invitedEmails.length, state]);

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    setSaved(false);
    setPublishError(null);
    try {
      const savedCampaign = await onSaveDraft(buildDraftInput());
      setState((prev) => ({
        ...prev,
        draftId: savedCampaign.id,
        lastSavedAt: new Date().toISOString(),
      }));
      setSaved(true);
    } catch {
      setState((prev) => ({
        ...prev,
        errorSteps: Array.from(new Set([...prev.errorSteps, prev.currentStep])),
      }));
      setStepError(t('employer.campaigns.wizard.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [buildDraftInput, onSaveDraft, t]);

  const handlePublish = useCallback(async () => {
    setPublishError(null);
    for (let step = 0; step < CAMPAIGN_WIZARD_STEP_COUNT - 1; step += 1) {
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
        errorSteps: Array.from(new Set([...prev.errorSteps, 7])),
      }));
    } finally {
      setIsPublishing(false);
    }
  }, [buildDraftInput, onPublish, t, validateStep]);

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
      rubric: DEFAULT_RUBRIC,
      errorSteps: clearError(prev.errorSteps, 2),
    }));
  }, []);

  const simulateJdUpload = useCallback((file: File) => {
    setState((prev) => ({
      ...prev,
      jd: {
        ...prev.jd,
        fileName: file.name,
        fileSize: file.size,
        status: 'uploading',
        errorKey: undefined,
      },
    }));
    window.setTimeout(() => {
      setState((prev) => ({
        ...prev,
        jd: {
          ...prev.jd,
          status: 'analyzing',
        },
      }));
    }, 400);
    window.setTimeout(() => {
      setState((prev) => ({
        ...prev,
        jd: {
          ...prev.jd,
          status: 'ready',
          jobTitle: prev.info.jobTitle || 'Software Engineer',
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
            'Own React surfaces, async state, accessibility, and API integration for hiring workflows.',
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
        expiresAt: prev.info.endDate || prev.info.joinDeadline,
        status: 'ready',
        candidateCount: invitedEmails.length,
      },
      errorSteps: clearError(prev.errorSteps, 5),
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
    totalWeight,
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
    setMagicLink,
    setInvitationEmail,
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
