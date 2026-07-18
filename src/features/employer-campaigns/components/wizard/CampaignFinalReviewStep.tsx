import { ClipboardCheck, Pencil } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';
import type {
  CampaignInfoState,
  InvitationEmailState,
  JdAnalysisState,
  MagicLinkState,
} from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';

interface CampaignFinalReviewStepProps {
  info: CampaignInfoState;
  jd: JdAnalysisState;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  invitedCount: number;
  magicLink: MagicLinkState;
  email: InvitationEmailState;
  publishError?: string | null;
  onEditStep: (step: number) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

function ReviewCard({
  title,
  onEdit,
  editLabel,
  children,
}: {
  title: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-satin bg-surface-overlay p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button type="button" className="btn-ghost inline-flex items-center gap-1.5 text-xs" onClick={onEdit}>
          <Pencil className="size-3.5" aria-hidden />
          {editLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-satin py-1.5 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function CampaignFinalReviewStep({
  info,
  jd,
  rubric,
  questions,
  invitedCount,
  magicLink,
  email,
  publishError,
  onEditStep,
  onBack,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
}: CampaignFinalReviewStepProps) {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);
  const editLabel = t('employer.campaigns.wizard.editStep');

  const checks = [
    { ok: Boolean(info.name.trim()), label: t('employer.campaigns.wizard.check.info') },
    { ok: jd.status === 'ready' || Boolean(jd.summary.trim()), label: t('employer.campaigns.wizard.check.jd') },
    { ok: totalWeight === 100, label: t('employer.campaigns.wizard.check.criteria') },
    { ok: questions.length > 0, label: t('employer.campaigns.wizard.check.questions') },
    { ok: invitedCount > 0, label: t('employer.campaigns.wizard.check.candidates') },
    { ok: magicLink.status === 'ready', label: t('employer.campaigns.wizard.check.magicLink') },
    { ok: Boolean(email.subject.trim() && email.body.trim()), label: t('employer.campaigns.wizard.check.email') },
  ];

  return (
    <SectionPanel
      icon={<ClipboardCheck className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.review')}
      description={t('employer.campaigns.wizard.steps.reviewDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onPublish={onPublish}
          showPublish
          isSaving={isSaving}
          isPublishing={isPublishing}
        />
      }
    >
      <div className="space-y-5">
        {publishError ? (
          <p className="rounded-lg border border-error/40 bg-error-bg px-3 py-2 text-sm text-error" role="alert">
            {publishError}
          </p>
        ) : null}

        <ul className="grid gap-2 sm:grid-cols-2">
          {checks.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
            >
              <span className={item.ok ? 'text-success' : 'text-error'} aria-hidden>
                {item.ok ? '[OK]' : '[ ]'}
              </span>
              <span className="text-foreground">{item.label}</span>
            </li>
          ))}
        </ul>

        <ReviewCard title={t('employer.campaigns.wizard.steps.info')} onEdit={() => onEditStep(0)} editLabel={editLabel}>
          <dl>
            <Row label={t('employer.campaigns.form.name')} value={info.name || '—'} />
            <Row label={t('employer.campaigns.form.jobTitle')} value={info.jobTitle || '—'} />
            <Row label={t('employer.campaigns.form.targetLevel')} value={info.targetLevel || '—'} />
            <Row label={t('employer.campaigns.form.hireCount')} value={String(info.hireCount)} />
          </dl>
        </ReviewCard>

        <ReviewCard title={t('employer.campaigns.wizard.steps.jd')} onEdit={() => onEditStep(1)} editLabel={editLabel}>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {jd.summary || t('employer.campaigns.wizard.emptyJd')}
          </p>
        </ReviewCard>

        <ReviewCard title={t('employer.campaigns.wizard.steps.criteria')} onEdit={() => onEditStep(2)} editLabel={editLabel}>
          <Row label={t('employer.campaigns.form.weightTotal')} value={`${totalWeight}%`} />
          <p className="mt-2 text-sm text-muted-foreground">
            {rubric.map((c) => c.name).join(' · ') || '—'}
          </p>
        </ReviewCard>

        <ReviewCard title={t('employer.campaigns.wizard.steps.questions')} onEdit={() => onEditStep(3)} editLabel={editLabel}>
          <p className="text-sm text-foreground">{questions.length} {t('employer.campaigns.form.questionsUnit')}</p>
        </ReviewCard>

        <ReviewCard title={t('employer.campaigns.wizard.steps.candidates')} onEdit={() => onEditStep(4)} editLabel={editLabel}>
          <Row label={t('employer.campaigns.form.candidateCount')} value={String(invitedCount)} />
        </ReviewCard>

        <ReviewCard title={t('employer.campaigns.wizard.steps.magicLink')} onEdit={() => onEditStep(5)} editLabel={editLabel}>
          <p className="break-all text-sm text-muted-foreground">{magicLink.url || '—'}</p>
        </ReviewCard>

        <ReviewCard title={t('employer.campaigns.wizard.steps.email')} onEdit={() => onEditStep(6)} editLabel={editLabel}>
          <Row label={t('employer.campaigns.form.emailSubject')} value={email.subject || '—'} />
        </ReviewCard>
      </div>
    </SectionPanel>
  );
}
