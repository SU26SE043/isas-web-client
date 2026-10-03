import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { CampaignUnscoredFlaggedResult } from '../../types/campaign.api.types';
import { formatResultTime } from '../../utils/campaignResultsActions';
import { flagNoteText } from '../../utils/flagNoteText';
import { flagTypeLabelKey, getReviewPriority, REVIEW_PRIORITY_CLASS } from '../../utils/proctoringFlagPriority';
import { getUnscoredFlaggedStatusKeys } from '../../utils/unscoredFlaggedStatus';
import { candidateDisplayEmail, candidateDisplayName } from './ResultBadges';
import { ResultFlagSourceLabel } from './ResultFlagSourceLabel';

export function UnscoredFlaggedSection({
  items,
}: {
  items: CampaignUnscoredFlaggedResult[];
}) {
  const { t, language } = useLanguage();
  const list = items ?? [];

  return (
    <section className="space-y-3" aria-labelledby="unscoerror-flagged-heading">
      <div>
        <h3 id="unscoerror-flagged-heading" className="text-lg font-semibold text-foreground">
          {t('employer.campaigns.results.unscoredFlagged.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('employer.campaigns.results.unscoredFlagged.description')}
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          variant="no-data"
          title={t('employer.campaigns.results.unscoredFlagged.emptyTitle')}
          description={t('employer.campaigns.results.unscoredFlagged.emptyDescription')}
        />
      ) : (
        <div className="hidden overflow-x-auto rounded-xl border border-satin bg-surface-raised md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employer.campaigns.results.columns.candidate')}</TableHead>
                <TableHead>{t('employer.campaigns.results.unscoredFlagged.interviewStatus')}</TableHead>
                <TableHead>{t('employer.campaigns.results.columns.flags')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((item) => (
                <TableRow key={`${item.candidateId}-${item.sessionId}`}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {candidateDisplayName(item, t)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {candidateDisplayEmail(item, t)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell title={item.sessionId}>
                    <UnscoredStatus item={item} language={language} t={t} />
                  </TableCell>
                  <TableCell>
                    {item.flags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {t('employer.campaigns.results.flags.none')}
                      </span>
                    ) : (
                      <ul className="space-y-1 text-xs">
                        {item.flags.map((flag) => (
                          <li key={`${flag.type}-${flag.count}-${flag.note ?? ''}`} className={`rounded-lg border px-3 py-2 ${REVIEW_PRIORITY_CLASS[getReviewPriority(flag.type)]}`}>
                            <p className="font-medium">
                              {flagTypeLabelKey(flag.type) ? t(flagTypeLabelKey(flag.type) as string) : flag.type}: {flag.count}
                            </p>
                            <ResultFlagSourceLabel flag={flag} />
                            {flag.note?.trim() ? (
                              <p className="mt-0.5 text-current/80">
                                {flagNoteText(flag.note, t)}
                              </p>
                            ) : null}
                            {formatResultTime(flag.firstAt, language) || formatResultTime(flag.lastAt, language) ? (
                              <p className="mt-0.5 text-current/80">
                                {formatResultTime(flag.firstAt, language) ? `${t('employer.campaigns.results.proctoring.firstAt')} ${formatResultTime(flag.firstAt, language)}` : null}
                                {formatResultTime(flag.firstAt, language) && formatResultTime(flag.lastAt, language) ? ' · ' : null}
                                {formatResultTime(flag.lastAt, language) ? `${t('employer.campaigns.results.proctoring.lastAt')} ${formatResultTime(flag.lastAt, language)}` : null}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {list.length > 0 ? (
        <ul className="space-y-3 md:hidden">
          {list.map((item) => (
            <li key={`mobile-${item.candidateId}-${item.sessionId}`} className="frame-satin rounded-xl bg-surface-raised p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{candidateDisplayName(item, t)}</p>
                  <p className="text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
                </div>
                <div title={item.sessionId} className="max-w-[60%] text-right">
                  <UnscoredStatus item={item} language={language} t={t} />
                </div>
              </div>
              <div className="mt-3 border-t border-satin pt-3">
                {item.flags.length === 0 ? (
                  <span className="text-xs text-muted-foreground">{t('employer.campaigns.results.flags.none')}</span>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {item.flags.map((flag) => (
                      <li key={`${flag.type}-${flag.count}-${flag.note ?? ''}`} className={`rounded-lg border px-3 py-2 ${REVIEW_PRIORITY_CLASS[getReviewPriority(flag.type)]}`}>
                        <p className="font-medium">
                          {flagTypeLabelKey(flag.type) ? t(flagTypeLabelKey(flag.type) as string) : flag.type}: {flag.count}
                          <ResultFlagSourceLabel flag={flag} />
                        </p>
                        {flag.note?.trim() ? <p className="mt-0.5 text-current/80">{flagNoteText(flag.note, t)}</p> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function UnscoredStatus({
  item,
  language,
  t,
}: {
  item: CampaignUnscoredFlaggedResult;
  language: string;
  t: (key: string) => string;
}) {
  const status = getUnscoredFlaggedStatusKeys(item);
  return (
    <div className="space-y-1">
      <Badge variant={item.interviewStatus === 'Abandoned' && item.abandonReason === 'generation_failed' ? 'destructive' : 'outline'}>
        {t(status.label)}
      </Badge>
      {status.detail ? <p className="text-xs text-muted-foreground">{t(status.detail)}</p> : null}
      {item.interviewStartedAt ? (
        <p className="text-xs text-muted-foreground">
          {t('employer.campaigns.results.unscoredFlagged.startedAt')} {formatStartedAt(item.interviewStartedAt, language)}
        </p>
      ) : null}
    </div>
  );
}

function formatStartedAt(value: string, language: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const locale = language === 'en' ? 'en-GB' : 'vi-VN';
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
  const dayMonth = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit' }).format(date);
  return `${time} ${dayMonth}`;
}

