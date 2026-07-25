import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import { useCampaignResultTranscript } from '../../hooks/useCampaignResults';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import {
  formatResultDateTime,
  formatResultScore,
  getTranscriptErrorKey,
  hasResultOverride,
} from '../../utils/campaignResultsActions';
import {
  ResultStatusBadge,
  candidateDisplayEmail,
  candidateDisplayName,
} from './ResultBadges';

interface ResultTranscriptDrawerProps {
  open: boolean;
  campaignId: string;
  item: CampaignResultItem | null;
  onClose: () => void;
  onOverride: () => void;
}

export function ResultTranscriptDrawer({
  open,
  campaignId,
  item,
  onClose,
  onOverride,
}: ResultTranscriptDrawerProps) {
  const { t, language } = useLanguage();
  const transcriptQuery = useCampaignResultTranscript(campaignId, item?.sessionId ?? null, {
    enabled: open && Boolean(item?.sessionId),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-full flex-col sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.results.transcript.title')}</DialogTitle>
          {item ? (
            <div className="space-y-1 text-left">
              <p className="text-sm font-medium text-foreground">{candidateDisplayName(item, t)}</p>
              <p className="text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
            </div>
          ) : null}
        </DialogHeader>

        {item ? (
          <div className="grid gap-2 rounded-xl border border-satin bg-surface-overlay px-3 py-3 text-sm sm:grid-cols-3">
            <Info
              label={t('employer.campaigns.results.columns.totalScore')}
              value={formatResultScore(item.totalScore)}
            />
            <Info
              label={t('employer.campaigns.results.aiScore')}
              value={formatResultScore(item.aiScore)}
            />
            <div>
              <p className="text-xs text-muted-foreground">
                {t('employer.campaigns.results.columns.result')}
              </p>
              <div className="mt-1">
                <ResultStatusBadge result={item.result} />
              </div>
            </div>
          </div>
        ) : null}

        {item && hasResultOverride(item) ? (
          <div className="rounded-xl border border-info/30 bg-info/10 px-3 py-3 text-sm">
            <p className="font-medium text-foreground">
              {t('employer.campaigns.results.override.historyTitle')}
            </p>
            <p className="mt-1 text-muted-foreground">
              {t('employer.campaigns.results.override.score')}:{' '}
              {item.overrideScore != null
                ? formatResultScore(item.overrideScore)
                : t('employer.campaigns.results.override.unchanged')}
            </p>
            <p className="text-muted-foreground">
              {t('employer.campaigns.results.override.result')}:{' '}
              {item.overrideResult ?? t('employer.campaigns.results.override.unchanged')}
            </p>
            {item.overriddenAt ? (
              <p className="text-muted-foreground">
                {formatResultDateTime(item.overriddenAt, language)}
              </p>
            ) : null}
            {item.overrideNote ? (
              <p className="mt-2 text-foreground">{item.overrideNote}</p>
            ) : null}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {transcriptQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-8" label={t('employer.campaigns.results.transcript.loading')} />
            </div>
          ) : null}

          {transcriptQuery.isError ? (
            <Alert variant="error">
              <AlertDescription>{t(getTranscriptErrorKey(transcriptQuery.error))}</AlertDescription>
            </Alert>
          ) : null}

          {transcriptQuery.data?.questions.map((question) => (
            <article
              key={question.questionId}
              className="rounded-xl border border-satin bg-surface-overlay p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('employer.campaigns.results.transcript.question').replace(
                    '{{n}}',
                    String(question.orderNo),
                  )}
                </h3>
                {question.needsReview ? (
                  <Badge className="border-transparent bg-warning/15 text-warning">
                    {t('employer.campaigns.results.transcript.needsReview')}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-foreground">{question.content}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('employer.campaigns.results.transcript.answer')}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {question.transcript?.trim() ||
                  t('employer.campaigns.results.transcript.emptyAnswer')}
              </p>
              <div className="mt-3 space-y-2">
                {question.scores.map((score) => (
                  <div
                    key={score.criterionId}
                    className="rounded-lg border border-subtle px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        {score.criterionName?.trim() ||
                          t('employer.campaigns.results.transcript.criterion')}
                      </p>
                      <p className="text-sm tabular-nums text-foreground">
                        {score.maxScore != null
                          ? `${score.score} / ${score.maxScore}`
                          : t('employer.campaigns.results.transcript.scoreOnly').replace(
                              '{{score}}',
                              String(score.score),
                            )}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {score.reasoning?.trim() ||
                        t('employer.campaigns.results.transcript.noReasoning')}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('employer.campaigns.results.transcript.close')}
          </Button>
          <div className="flex flex-wrap gap-2">
            {transcriptQuery.isError ? (
              <Button type="button" variant="outline" onClick={() => void transcriptQuery.refetch()}>
                {t('employer.campaigns.results.errors.retry')}
              </Button>
            ) : null}
            <Button type="button" onClick={onOverride}>
              {t('employer.campaigns.results.actions.override')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
