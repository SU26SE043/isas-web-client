import { Link, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import { useCampaignResultTranscript, useCampaignResults } from '../hooks/useCampaignResults';
import {
  formatResultScore,
  getTranscriptErrorKey,
} from '../utils/campaignResultsActions';
import { candidateDisplayEmail, candidateDisplayName, ResultStatusBadge } from '../components/results/ResultBadges';
import { ProctoringAnalysis } from '../components/results/ProctoringAnalysis';

export function CampaignResultDetailPage() {
  const { id: campaignId = '', sessionId = '' } = useParams();
  const { t } = useLanguage();
  const resultsQuery = useCampaignResults(campaignId);
  const item = resultsQuery.data?.results.find((result) => result.sessionId === sessionId) ?? null;
  const transcriptQuery = useCampaignResultTranscript(campaignId, item?.sessionId ?? null, {
    enabled: Boolean(item),
  });
  const backToResults = `/employer/campaigns/${campaignId}/overview?tab=results`;

  if (resultsQuery.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Spinner className="size-8" /></div>;
  }

  if (!item) {
    return (
      <div className="page-container page-section">
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.results.transcript.title')}
          description={t('employer.campaigns.results.errors.transcriptNotFound')}
          action={<Button render={<Link to={backToResults} />} nativeButton={false} variant="outline">{t('employer.campaigns.results.transcript.close')}</Button>}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <main className="page-container page-section mx-auto max-w-5xl space-y-5">
        <Link to={backToResults} className="btn-secondary inline-flex">{t('employer.campaigns.results.transcript.close')}</Link>
        <header>
          <h1 className="heading-primary text-2xl">{t('employer.campaigns.results.transcript.title')}</h1>
          <p className="mt-2 font-medium text-foreground">{candidateDisplayName(item, t)}</p>
          <p className="text-sm text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
        </header>
        <div className="grid gap-3 rounded-xl border border-satin bg-surface-overlay p-4 text-sm sm:grid-cols-3">
          <Metric label={t('employer.campaigns.results.columns.totalScore')} value={formatResultScore(item.totalScore)} />
          <Metric label={t('employer.campaigns.results.columns.aiScore')} value={formatResultScore(item.aiScore)} />
          <div><p className="text-xs text-muted-foreground">{t('employer.campaigns.results.columns.result')}</p><div className="mt-1"><ResultStatusBadge result={item.result} /></div></div>
        </div>
        <ProctoringAnalysis flags={item.flags} />
        {transcriptQuery.isLoading ? <div className="flex justify-center py-10"><Spinner className="size-8" /></div> : null}
        {transcriptQuery.isError ? <Alert variant="error"><AlertDescription>{t(getTranscriptErrorKey(transcriptQuery.error))}</AlertDescription></Alert> : null}
        <section className="space-y-3">
          {transcriptQuery.data?.questions.map((question) => (
            <article key={question.questionId} className="rounded-xl border border-satin bg-surface-overlay p-4">
              <h2 className="text-sm font-semibold text-foreground">{t('employer.campaigns.results.transcript.question').replace('{{n}}', String(question.orderNo))}</h2>
              <p className="mt-2 text-sm text-foreground">{question.content}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('employer.campaigns.results.transcript.answer')}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{question.transcript?.trim() || t('employer.campaigns.results.transcript.emptyAnswer')}</p>
              {question.scores.map((score) => <div key={score.criterionId} className="mt-3 rounded-lg border border-subtle p-3"><div className="flex justify-between gap-3"><p className="font-medium text-foreground">{score.criterionName || t('employer.campaigns.results.transcript.criterion')}</p><p className="tabular-nums">{score.maxScore != null ? `${score.score} / ${score.maxScore}` : String(score.score)}</p></div><p className="mt-1 text-xs text-muted-foreground">{score.reasoning || t('employer.campaigns.results.transcript.noReasoning')}</p></div>)}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold tabular-nums text-foreground">{value}</p></div>;
}
