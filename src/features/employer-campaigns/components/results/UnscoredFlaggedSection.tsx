import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import type { CampaignUnscoredFlaggedResult } from '../../types/campaign.api.types';
import { formatResultTime } from '../../utils/campaignResultsActions';
import { getReviewPriority, REVIEW_PRIORITY_CLASS } from '../../utils/proctoringFlagPriority';
import { candidateDisplayEmail, candidateDisplayName } from './ResultBadges';

export function UnscoredFlaggedSection({
  items,
}: {
  items: CampaignUnscoredFlaggedResult[];
}) {
  const { t, language } = useLanguage();
  const list = items ?? [];

  return (
    <section className="space-y-3" aria-labelledby="unscored-flagged-heading">
      <div>
        <h3 id="unscored-flagged-heading" className="text-lg font-semibold text-foreground">
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
        <div className="overflow-x-auto rounded-xl border border-satin bg-surface-raised">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employer.campaigns.results.columns.candidate')}</TableHead>
                <TableHead>{t('employer.campaigns.results.unscoredFlagged.session')}</TableHead>
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
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sessionId}
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
                              {flag.type}: {flag.count}
                            </p>
                            {flag.note?.trim() ? (
                              <p className="mt-0.5 text-current/80">
                                {flag.note.trim()}
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
    </section>
  );
}
