import { Rocket, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';
import type { CampaignInfoState, CampaignSettingsState, JobDescriptionState } from '../../types/campaignWizard.types';
import { useCampaignSlots } from '../../hooks/useCampaignSlots';
import { calculateAdaptiveQuestionBudget, CAMPAIGN_ADAPTIVE_QUESTION_LIMIT } from '../../utils/campaignAdaptiveBudget';
import { campaignSlotCapacity } from '../../utils/campaignSlots';
import { CampaignWizardNav } from './CampaignWizardNav';

interface CampaignReviewStepProps {
  info: CampaignInfoState; jd: JobDescriptionState; rubric: RubricCriterion[]; questions: CampaignQuestion[];
  questionsPerSession?: number | null; settings: CampaignSettingsState; campaignId?: string; domainLabel: string;
  inviteEmails?: string[]; questionBankWarnings?: string[]; error?: string | null; onGoToStep: (step: number) => void;
  onBack: () => void; onSubmit: () => void; submitLabel: string; submittingLabel: string;
  isSubmitting?: boolean; submitDisabled?: boolean; disableForBlockingIssues?: boolean;
  hasPartialDeploy?: boolean; onRetryInvitations?: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function CampaignReviewStep({
  info, jd, rubric, questions, questionsPerSession, settings, campaignId, domainLabel,
  inviteEmails = [], questionBankWarnings = [], error, onGoToStep, onBack, onSubmit,
  submitLabel, submittingLabel, isSubmitting = false, submitDisabled = false, disableForBlockingIssues = false,
  hasPartialDeploy = false, onRetryInvitations,
}: CampaignReviewStepProps) {
  const { t } = useLanguage();
  const slotsQuery = useCampaignSlots(campaignId, Boolean(campaignId));
  const slots = slotsQuery.data ?? [];
  const capacity = campaignSlotCapacity(slots).total;
  const adaptiveBudget = calculateAdaptiveQuestionBudget(
    questionsPerSession ?? questions.length,
    settings.maxDeepPerQuestion,
    settings.adaptiveEnabled,
  );
  const blocking = [
    !jd.jdText.trim() && !jd.fileName && !jd.serverUploaded ? { label: t('employer.campaigns.wizard.jdTextRequired'), step: 1 } : null,
    rubric.length === 0 ? { label: t('employer.campaigns.wizard.criteriaRequired'), step: 2 } : null,
    questions.length === 0 ? { label: t('employer.campaigns.wizard.questionsRequired'), step: 3 } : null,
  ].filter((item): item is { label: string; step: number } => Boolean(item));
  const deployDisabled = submitDisabled || isSubmitting || (!hasPartialDeploy && ((disableForBlockingIssues && blocking.length > 0) || adaptiveBudget.exceedsLimit));

  return (
    <SectionPanel icon={<Rocket className="size-4" aria-hidden />} title={t('employer.campaigns.wizard.deploy.title')} description={t('employer.campaigns.wizard.deploy.description')} footer={<CampaignWizardNav onBack={onBack} onNext={onSubmit} nextLabel={isSubmitting ? submittingLabel : submitLabel} nextDisabled={deployDisabled} isSaving={isSubmitting} backDisabled={isSubmitting} />}>
      <div className="space-y-5">
        {error ? <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert> : null}
        {hasPartialDeploy ? <Alert variant="warning"><AlertDescription className="flex flex-wrap items-center justify-between gap-3"><span>{t('employer.campaigns.wizard.deploy.invitationFailed')}</span>{onRetryInvitations ? <Button type="button" variant="outline" disabled={isSubmitting} loading={isSubmitting} onClick={onRetryInvitations}>{t('employer.campaigns.wizard.deploy.retryInvitations')}</Button> : null}</AlertDescription></Alert> : null}
        {blocking.length ? <section className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-foreground"><h3 className="mb-1 font-medium leading-none">{t('employer.campaigns.wizard.deploy.blockingTitle')}</h3><ul className="list-inside list-disc space-y-1 text-muted-foreground">{blocking.map((item) => <li key={item.step}><button type="button" className="underline" onClick={() => onGoToStep(item.step)}>{item.label}</button></li>)}</ul></section> : null}
        {questionBankWarnings.length ? <Alert variant="warning"><AlertTitle>{t('employer.campaigns.wizard.deploy.warningTitle')}</AlertTitle><AlertDescription><ul className="list-inside list-disc">{questionBankWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></AlertDescription></Alert> : null}
        {settings.adaptiveEnabled ? <section className="frame-satin space-y-2 rounded-xl bg-surface-overlay p-4" aria-label={t('employer.campaigns.wizard.review.adaptiveBudget')}>
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-foreground">{t('employer.campaigns.wizard.review.adaptiveBudget')}: {adaptiveBudget.requestedTotal}</h3><span className="text-sm text-muted-foreground">{adaptiveBudget.requestedTotal} / {CAMPAIGN_ADAPTIVE_QUESTION_LIMIT}</span></div>
          {adaptiveBudget.maxDeepPerQuestion > 0 ? <p className="text-sm text-muted-foreground">maxDeepPerQuestion: {adaptiveBudget.maxDeepPerQuestion}</p> : null}
          {adaptiveBudget.maxDeepPerQuestion > 0 ? <p className="text-sm text-muted-foreground">{t('employer.campaigns.wizard.review.adaptiveBudgetFormula').replace('{{base}}', String(adaptiveBudget.baseQuestionCount)).replace('{{depth}}', String(adaptiveBudget.maxDeepPerQuestion)).replace('{{total}}', String(adaptiveBudget.requestedTotal))}</p> : null}
          <p className="text-sm text-muted-foreground">{t('employer.campaigns.wizard.review.adaptiveBudgetSummary').replace('{{base}}', String(adaptiveBudget.baseQuestionCount)).replace('{{depth}}', String(adaptiveBudget.maxDeepPerQuestion)).replace('{{requested}}', String(adaptiveBudget.requestedTotal)).replace('{{limit}}', String(CAMPAIGN_ADAPTIVE_QUESTION_LIMIT)).replace('{{status}}', t(adaptiveBudget.exceedsLimit ? 'employer.campaigns.wizard.review.adaptiveBudgetStatus.exceeded' : 'employer.campaigns.wizard.review.adaptiveBudgetStatus.ok'))}</p>
          {adaptiveBudget.exceedsLimit ? <Alert variant="error"><AlertDescription>{t('employer.campaigns.wizard.review.adaptiveBudgetExceeded').replace('{{requested}}', String(adaptiveBudget.requestedTotal)).replace('{{limit}}', String(CAMPAIGN_ADAPTIVE_QUESTION_LIMIT))}</AlertDescription></Alert> : null}
        </section> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryCampaign')} value={info.title || '—'} onEdit={() => onGoToStep(0)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryJob')} value={`${domainLabel} · ${jd.fileName || (jd.jdText.trim() ? t('employer.campaigns.wizard.deploy.ready') : '—')}`} onEdit={() => onGoToStep(1)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryCriteria')} value={`${rubric.length} · ${Math.round(rubric.reduce((sum, item) => sum + Number(item.weight), 0))}%`} onEdit={() => onGoToStep(2)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryQuestions')} value={`${questions.length} · ${questionsPerSession ?? t('employer.campaigns.wizard.deploy.allQuestions')}`} onEdit={() => onGoToStep(3)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryInvites')} value={`${inviteEmails.length} ${t('employer.campaigns.wizard.deploy.candidates')}`} onEdit={() => onGoToStep(6)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summarySchedule')} value={`${formatDate(info.startsAt)} · ${slots.length} · ${capacity}`} onEdit={() => onGoToStep(5)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
        </div>
        <section className="rounded-xl border border-info/30 bg-info/5 p-4">
          <div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 size-4 shrink-0 text-info" aria-hidden /><div className="space-y-2 text-sm"><h3 className="font-semibold text-foreground">{t('employer.campaigns.wizard.deploy.whenPressedTitle')}</h3><p className="text-muted-foreground">{t('employer.campaigns.wizard.deploy.whenPressedDescription').replace('{{count}}', String(inviteEmails.length)).replace('{{expires}}', formatDate(info.expiresAt))}</p><p className="text-muted-foreground">{t('employer.campaigns.wizard.deploy.lockingDescription')}</p></div></div>
          <Button type="button" className="mt-4" disabled={deployDisabled} loading={isSubmitting} onClick={onSubmit}>{isSubmitting ? submittingLabel : submitLabel}</Button>
        </section>
      </div>
    </SectionPanel>
  );
}

function SummaryCard({ label, value, onEdit, editLabel }: { label: string; value: string; onEdit: () => void; editLabel: string }) {
  return <div className="frame-satin rounded-xl bg-surface-overlay p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">{value}</p></div><Button type="button" variant="ghost" size="sm" onClick={onEdit}>{editLabel}</Button></div></div>;
}
