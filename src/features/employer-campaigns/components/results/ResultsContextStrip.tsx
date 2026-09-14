import { Info, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip } from '@/components/ui/tooltip';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import type { RubricCriterion } from '../../types/campaignManagement.types';

interface ResultsContextStripProps {
  items: CampaignResultItem[];
  passScorePct?: number | null;
  rubric?: RubricCriterion[];
  questionsPerSession?: number | null;
  questionBankTotal?: number;
  currentRubricVersion?: number | null;
}

export function ResultsContextStrip({
  items,
  passScorePct,
  rubric = [],
  questionsPerSession,
  questionBankTotal,
  currentRubricVersion,
}: ResultsContextStripProps) {
  const { t } = useLanguage();
  const source = items.find((item) => item.skipPenalty != null);
  const cutoffItems = rubric.filter((criterion) => criterion.minPct != null);
  const policy = items.find((item) => item.policyName != null);
  const parts = [
    source?.skipPenalty === true
      ? t('employer.campaigns.results.context.skipPenalty')
      : source?.skipPenalty === false
        ? t('employer.campaigns.results.context.legacySkipPenalty')
        : null,
    passScorePct != null
      ? t('employer.campaigns.results.context.passScore').replace('{{score}}', `${passScorePct}%`)
      : t('employer.campaigns.results.context.hrDecision'),
    cutoffItems.length > 0
      ? t('employer.campaigns.results.context.cutoff').replace('{{count}}', String(cutoffItems.length))
      : null,
    questionsPerSession != null && questionBankTotal != null && questionsPerSession < questionBankTotal
      ? t('employer.campaigns.results.context.questionSet')
          .replace('{{k}}', String(questionsPerSession))
          .replace('{{total}}', String(questionBankTotal))
      : null,
    currentRubricVersion != null
      ? t('employer.campaigns.results.context.rubricVersion').replace('{{version}}', String(currentRubricVersion))
      : null,
    policy?.policyName
      ? t('employer.campaigns.results.context.policy')
          .replace('{{name}}', policy.policyName)
          .replace('{{version}}', String(policy.policyVersion ?? '—'))
      : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-xs text-muted-foreground">
      <Info className="size-3.5 shrink-0 text-info" aria-hidden />
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 ? <span className="mr-2 text-muted-foreground/50">·</span> : null}
          {part}
        </span>
      ))}
    </div>
  ) : null;
}

export function ResultsFallbackAlert({ items }: { items: CampaignResultItem[] }) {
  const { t } = useLanguage();
  const count = items.filter((item) => item.scoreFallback === true).length;
  return count > 0 ? (
    <Alert variant="warning">
      <AlertDescription className="flex items-center gap-2">
        <TriangleAlert className="size-4 shrink-0" aria-hidden />
        {t('employer.campaigns.results.context.fallbackAlert').replace('{{count}}', String(count))}
      </AlertDescription>
    </Alert>
  ) : null;
}

export function ResultsCriterionCutoff({ item }: { item: CampaignResultItem }) {
  const { t } = useLanguage();
  const cutoff = item.belowCutoff ?? [];
  return cutoff.length > 0 ? (
    <Tooltip content={cutoff.map((entry) => `${entry.name}: ${entry.pct}% < ${entry.minPct}%${entry.matchedBy === 'name' ? ` ${t('employer.campaigns.results.context.matchedByName')}` : ''}`).join('\n')}>
      <span className="inline-flex cursor-help items-center rounded-full border border-warning/30 bg-warning-bg px-2 py-0.5 text-xs text-warning">
        {t('employer.campaigns.results.context.belowCutoff').replace('{{name}}', cutoff[0].name)}
      </span>
    </Tooltip>
  ) : null;
}
