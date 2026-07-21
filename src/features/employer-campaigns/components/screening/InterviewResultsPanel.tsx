import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { useCampaignResults } from '../../hooks/useCampaignCandidates';
import type { CampaignResultItem } from '../../types/campaign.api.types';

interface InterviewResultsPanelProps {
  campaignId: string;
  enabled: boolean;
  passScorePct?: number | null;
}

export function InterviewResultsPanel({
  campaignId,
  enabled,
  passScorePct,
}: InterviewResultsPanelProps) {
  const { t } = useLanguage();
  const { data, isLoading, isError, refetch } = useCampaignResults(campaignId, { enabled });

  const effectivePassScore = data?.passScorePct ?? passScorePct ?? null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8" label={t('employer.campaigns.screening.interview.title')} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <Alert variant="error">
          <AlertDescription>{t('employer.campaigns.screening.errors.loadResultsFailed')}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          {t('employer.campaigns.screening.errors.retry')}
        </Button>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <EmptyState
        variant="no-data"
        title={t('employer.campaigns.screening.interview.title')}
        description={t('employer.campaigns.screening.interview.empty')}
      />
    );
  }

  const passCount = data.results.filter((item) => item.result === 'Pass').length;
  const failCount = data.results.filter((item) => item.result === 'Fail').length;
  const pendingCount = data.results.filter((item) => !item.result).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          {t('employer.campaigns.screening.interview.title')}
        </h3>
        {effectivePassScore != null ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('employer.campaigns.screening.interview.passScore')}: {effectivePassScore}%
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('employer.campaigns.screening.interview.total')} value={data.totalCandidates} />
        <StatCard label={t('employer.campaigns.screening.interview.pass')} value={passCount} />
        <StatCard label={t('employer.campaigns.screening.interview.fail')} value={failCount} />
        <StatCard label={t('employer.campaigns.screening.interview.pending')} value={pendingCount} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-satin">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-satin bg-surface-overlay text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.rank')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.candidate')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.interview.effectiveScore')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.interview.aiScore')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.interview.overrideScore')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.ranking.status')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.interview.flags')}</th>
              <th className="px-3 py-2">{t('employer.campaigns.screening.interview.scoredAt')}</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((item) => (
              <ResultRow key={`${item.candidateId}-${item.sessionId}`} item={item} t={t} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-satin bg-surface-overlay px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ResultRow({
  item,
  t,
}: {
  item: CampaignResultItem;
  t: (key: string) => string;
}) {
  const effectiveScore = item.overrideScore ?? item.totalScore;
  const resultLabel =
    item.result === 'Pass'
      ? t('employer.campaigns.screening.interview.pass')
      : item.result === 'Fail'
        ? t('employer.campaigns.screening.interview.fail')
        : t('employer.campaigns.screening.interview.pending');

  return (
    <tr className="border-b border-satin last:border-0">
      <td className="px-3 py-2 text-muted-foreground">{item.rank}</td>
      <td className="px-3 py-2">
        <p className="font-medium text-foreground">{item.fullName ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{item.email ?? '—'}</p>
      </td>
      <td className="px-3 py-2 text-foreground">{effectiveScore}</td>
      <td className="px-3 py-2 text-muted-foreground">{item.aiScore}</td>
      <td className="px-3 py-2 text-muted-foreground">
        {item.overrideScore != null ? (
          <>
            {item.overrideScore}
            {item.overriddenAt ? (
              <span className="mt-0.5 block text-xs">
                {t('employer.campaigns.screening.interview.overridden')}
              </span>
            ) : null}
          </>
        ) : (
          '—'
        )}
      </td>
      <td className="px-3 py-2 text-foreground">{resultLabel}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {item.flags.length
          ? item.flags.map((flag) => `${flag.type} (${flag.count})`).join(', ')
          : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{item.scoredAt}</td>
    </tr>
  );
}
