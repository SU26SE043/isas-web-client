import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLanguage } from '@/shared/languages';
import { DEFAULT_PROCTORING, DEFAULT_RUBRIC } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignDraftInput,
  CampaignProctoringConfig,
  CampaignQuestion,
  EmployerCampaign,
  RubricCriterion,
} from '../types/campaignManagement.types';
import {
  CAMPAIGN_WIZARD_BASIC_FIELDS,
  CAMPAIGN_WIZARD_JD_FIELDS,
  CAMPAIGN_WIZARD_SETTINGS_FIELDS,
  CAMPAIGN_WIZARD_STEP_COUNT,
} from '../components/wizard/campaignWizard.steps';

/** Form-registered fields only; rubric/questions/proctoring live in React state. */
export type CampaignWizardValues = Omit<CampaignDraftInput, 'rubric' | 'questions' | 'proctoring'>;

function buildDefaultValues(campaign?: EmployerCampaign | null): CampaignWizardValues {
  return {
    title: campaign?.title ?? '',
    company: campaign?.company ?? 'NovaWorks AI',
    location: campaign?.location ?? '',
    mode: campaign?.mode ?? 'remote',
    summary: campaign?.summary ?? '',
    jobDescription: campaign?.jobDescription ?? '',
    capacity: campaign?.capacity ?? 50,
    deadline: campaign?.deadline ?? '2026-08-31',
    durationMinutes: campaign?.durationMinutes ?? 45,
    locale: campaign?.locale ?? 'en',
    welcomeMessage: campaign?.welcomeMessage ?? 'Welcome to the AI assessment.',
    completionMessage: campaign?.completionMessage ?? 'Thank you for completing the interview.',
  };
}

interface UseCampaignWizardArgs {
  campaign?: EmployerCampaign | null;
  questions: CampaignQuestion[];
  onSaveDraft: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
  onPublish: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
}

export function useCampaignWizard({
  campaign,
  questions,
  onSaveDraft,
  onPublish,
}: UseCampaignWizardArgs) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | undefined>();
  const [rubric, setRubric] = useState<RubricCriterion[]>(campaign?.rubric ?? DEFAULT_RUBRIC);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(
    campaign?.questions.map((item) => item.id) ?? [],
  );
  const [proctoring, setProctoring] = useState<CampaignProctoringConfig>(
    campaign?.proctoring ?? DEFAULT_PROCTORING,
  );

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t('employer.campaigns.form.required')),
        company: z.string().min(1, t('employer.campaigns.form.required')),
        location: z.string().min(1, t('employer.campaigns.form.required')),
        mode: z.enum(['remote', 'hybrid', 'onsite']),
        summary: z.string().min(1, t('employer.campaigns.form.required')),
        jobDescription: z.string().min(1, t('employer.campaigns.form.required')),
        capacity: z.number().min(1, t('employer.campaigns.form.required')),
        deadline: z.string().min(1, t('employer.campaigns.form.required')),
        durationMinutes: z.number().min(15, t('employer.campaigns.form.required')),
        locale: z.enum(['vi', 'en']),
        welcomeMessage: z.string().min(1, t('employer.campaigns.form.required')),
        completionMessage: z.string().min(1, t('employer.campaigns.form.required')),
      }),
    [t],
  );

  const form = useForm<CampaignWizardValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(campaign),
    shouldUnregister: false,
  });

  const chosenQuestions = questions.filter((question) => selectedQuestions.includes(question.id));
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);

  const buildInput = (values: CampaignWizardValues): CampaignDraftInput => ({
    ...values,
    rubric,
    questions: chosenQuestions,
    proctoring,
  });

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaved(false);
    setPublishError(null);
    try {
      await onSaveDraft(buildInput(form.getValues()));
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  const goNext = async () => {
    setQuestionError(undefined);
    if (step === 0) {
      if (!(await form.trigger([...CAMPAIGN_WIZARD_BASIC_FIELDS]))) return;
    } else if (step === 1) {
      if (!(await form.trigger([...CAMPAIGN_WIZARD_JD_FIELDS]))) return;
    } else if (step === 2) {
      if (!(await form.trigger(['durationMinutes']))) return;
      if (selectedQuestions.length === 0) {
        setQuestionError(t('employer.campaigns.form.noQuestions'));
        return;
      }
    } else if (step === 3) {
      if (totalWeight !== 100) return;
    } else if (step === 4) {
      if (!(await form.trigger([...CAMPAIGN_WIZARD_SETTINGS_FIELDS]))) return;
    }
    setStep((value) => Math.min(CAMPAIGN_WIZARD_STEP_COUNT - 1, value + 1));
  };

  const goBack = () => setStep((value) => Math.max(0, value - 1));

  const handlePublish = async () => {
    setPublishError(null);
    if (!(await form.trigger()) || totalWeight !== 100 || selectedQuestions.length === 0) {
      setPublishError(
        selectedQuestions.length === 0
          ? t('employer.campaigns.form.noQuestions')
          : totalWeight !== 100
            ? t('employer.campaigns.form.weightHelp')
            : t('employer.campaigns.wizard.publishValidation'),
      );
      return;
    }

    setIsPublishing(true);
    try {
      await onPublish(buildInput(form.getValues()));
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : t('employer.campaigns.wizard.publishFailed'),
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleQuestion = (id: string, checked: boolean) => {
    setSelectedQuestions((items) =>
      checked ? [...items, id] : items.filter((item) => item !== id),
    );
  };

  const changeWeight = (index: number, weight: number) => {
    setRubric((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, weight } : item)),
    );
  };

  return {
    step,
    saved,
    isSaving,
    isPublishing,
    publishError,
    questionError,
    rubric,
    selectedQuestions,
    proctoring,
    setProctoring,
    form,
    chosenQuestions,
    watched: form.watch(),
    goNext,
    goBack,
    handleSaveDraft,
    handlePublish,
    toggleQuestion,
    changeWeight,
  };
}
