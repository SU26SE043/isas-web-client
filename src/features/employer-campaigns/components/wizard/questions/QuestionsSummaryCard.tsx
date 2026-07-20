import { useLanguage } from '@/shared/languages';
import { CampaignManagementStatusBadge } from '../../CampaignManagementStatusBadge';
import { effectiveMaxQuestions } from '../../../utils/campaignQuestionLimits';

interface QuestionsSummaryCardProps {
  campaignTitle: string;
  domainLabel: string;
  isDraft: boolean;
  hasJd: boolean;
  questionCount: number;
  maxQuestions: number | null;
}

export function QuestionsSummaryCard({
  campaignTitle,
  domainLabel,
  isDraft,
  hasJd,
  questionCount,
  maxQuestions,
}: QuestionsSummaryCardProps) {
  const { t } = useLanguage();
  const max = maxQuestions == null ? null : effectiveMaxQuestions(maxQuestions);
  const remaining = max == null ? null : Math.max(max - questionCount, 0);

  return (
    <section className="rounded-lg border border-satin bg-surface-overlay p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {t('employer.campaigns.campaignQuestions.summary.title')}
        </h3>
        <CampaignManagementStatusBadge status={isDraft ? 'draft' : 'active'} />
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.campaign')}
          value={campaignTitle || '—'}
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.domain')}
          value={domainLabel || '—'}
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.jdStatus')}
          value={
            hasJd
              ? t('employer.campaigns.campaignQuestions.summary.jdAvailable')
              : t('employer.campaigns.campaignQuestions.summary.jdMissing')
          }
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.currentQuestions')}
          value={String(questionCount)}
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.maximumQuestions')}
          value={
            max == null
              ? t('employer.campaigns.campaignQuestions.summary.defaultLimit')
              : String(max)
          }
        />
        {remaining != null ? (
          <SummaryRow
            label={t('employer.campaigns.campaignQuestions.summary.remainingQuestions')}
            value={String(remaining)}
          />
        ) : null}
      </dl>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}
