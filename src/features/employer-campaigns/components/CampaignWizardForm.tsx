import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { DEFAULT_RUBRIC } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignDraftInput,
  CampaignQuestion,
  EmployerCampaign,
  EmployerCampaignMode,
  RubricCriterion,
} from '../types/campaignManagement.types';

interface CampaignWizardFormProps {
  campaign?: EmployerCampaign | null;
  questions: CampaignQuestion[];
  onSave: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
}

type WizardValues = Omit<CampaignDraftInput, 'rubric' | 'questions'>;

const steps = [
  'employer.campaigns.wizard.stepJob',
  'employer.campaigns.wizard.stepRubric',
  'employer.campaigns.wizard.stepQuestions',
  'employer.campaigns.wizard.stepSettings',
];

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-error">{message}</p> : null;
}

export function CampaignWizardForm({ campaign, questions, onSave }: CampaignWizardFormProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [rubric, setRubric] = useState<RubricCriterion[]>(campaign?.rubric ?? DEFAULT_RUBRIC);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(campaign?.questions.map((item) => item.id) ?? []);
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

  const form = useForm<WizardValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    },
  });

  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);
  const chosenQuestions = questions.filter((question) => selectedQuestions.includes(question.id));

  const save = form.handleSubmit(async (values) => {
    setSaved(false);
    await onSave({ ...values, rubric, questions: chosenQuestions });
    setSaved(true);
  });

  const renderInput = (name: keyof WizardValues, label: string, type = 'text') => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        aria-invalid={!!form.formState.errors[name]}
        {...form.register(name, type === 'number' ? { valueAsNumber: true } : undefined)}
      />
      <FieldError message={form.formState.errors[name]?.message} />
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      {saved ? (
        <Alert variant="success"><AlertDescription>{t('employer.campaigns.wizard.saved')}</AlertDescription></Alert>
      ) : null}

      <ol className="grid gap-2 sm:grid-cols-4">
        {steps.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                'w-full rounded-lg border border-subtle px-3 py-2 text-left text-sm transition',
                step === index ? 'bg-surface-elevated text-foreground' : 'bg-surface-overlay text-muted-foreground',
              )}
            >
              {index + 1}. {t(label)}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {renderInput('title', t('employer.campaigns.form.title'))}
          {renderInput('company', t('employer.campaigns.form.company'))}
          {renderInput('location', t('employer.campaigns.form.location'))}
          <label className="grid gap-2 text-sm font-medium text-foreground">
            {t('employer.campaigns.form.mode')}
            <select className="h-8 rounded-lg border border-input bg-surface-overlay px-2 text-sm" {...form.register('mode')}>
              {(['remote', 'hybrid', 'onsite'] as EmployerCampaignMode[]).map((mode) => (
                <option key={mode} value={mode}>{t(`employer.campaigns.mode.${mode}`)}</option>
              ))}
            </select>
          </label>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="summary">{t('employer.campaigns.form.summary')}</Label>
            <textarea id="summary" rows={3} className="w-full rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm" {...form.register('summary')} />
            <FieldError message={form.formState.errors.summary?.message} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="jobDescription">{t('employer.campaigns.form.jobDescription')}</Label>
            <textarea id="jobDescription" rows={7} className="w-full rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm" {...form.register('jobDescription')} />
            <FieldError message={form.formState.errors.jobDescription?.message} />
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          <div className="rounded-xl border border-subtle bg-surface-overlay p-4">
            <p className={cn('text-sm font-semibold', totalWeight === 100 ? 'text-success' : 'text-error')}>
              {t('employer.campaigns.form.weightTotal')}: {totalWeight}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t('employer.campaigns.form.weightHelp')}</p>
          </div>
          {rubric.map((criterion, index) => (
            <div key={criterion.id} className="grid gap-3 rounded-xl border border-subtle bg-surface-overlay p-4 md:grid-cols-[1fr_120px]">
              <div>
                <p className="font-medium text-foreground">{criterion.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{criterion.description}</p>
              </div>
              <Input
                type="number"
                value={criterion.weight}
                onChange={(event) => setRubric((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, weight: Number(event.target.value) } : item))}
              />
            </div>
          ))}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{t('employer.campaigns.form.selectQuestions')}</h2>
          {questions.map((question) => (
            <label key={question.id} className="flex gap-3 rounded-xl border border-subtle bg-surface-overlay p-4">
              <input
                type="checkbox"
                checked={selectedQuestions.includes(question.id)}
                onChange={(event) => setSelectedQuestions((items) => event.target.checked ? [...items, question.id] : items.filter((id) => id !== question.id))}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">{question.prompt}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {question.skill} · {t(`employer.campaigns.questionDifficulty.${question.difficulty}`)}
                </span>
              </span>
            </label>
          ))}
        </section>
      ) : null}

      {step === 3 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {renderInput('capacity', t('employer.campaigns.form.capacity'), 'number')}
          {renderInput('deadline', t('employer.campaigns.form.deadline'), 'date')}
          {renderInput('durationMinutes', t('employer.campaigns.form.duration'), 'number')}
          <label className="grid gap-2 text-sm font-medium text-foreground">
            {t('employer.campaigns.form.locale')}
            <select className="h-8 rounded-lg border border-input bg-surface-overlay px-2 text-sm" {...form.register('locale')}>
              <option value="en">{t('employer.campaigns.form.locale.en')}</option>
              <option value="vi">{t('employer.campaigns.form.locale.vi')}</option>
            </select>
          </label>
          {renderInput('welcomeMessage', t('employer.campaigns.form.welcome'))}
          {renderInput('completionMessage', t('employer.campaigns.form.completion'))}
        </section>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
          {t('employer.campaigns.wizard.previous')}
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={() => setStep((value) => Math.min(3, value + 1))}>{t('employer.campaigns.wizard.next')}</Button>
        ) : (
          <Button type="submit" loading={form.formState.isSubmitting}>{t('employer.campaigns.wizard.save')}</Button>
        )}
      </div>
    </form>
  );
}
