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
import { candidateDisplayEmail, candidateDisplayName } from './ResultBadges';
import { UnscoredFlagList, UnscoredStatus } from './UnscoredFlagList';

export function UnscoredFlaggedSection({
  items,
}: {
  items: CampaignUnscoredFlaggedResult[];
}) {
  const { t } = useLanguage();
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
        <>
          {/* Desktop: bảng. Mobile: thẻ. Cả hai cùng có trong DOM, CSS ẩn một bên (display:none
              cũng ẩn khỏi cây trợ năng) — test nên khoanh vùng theo data-layout. */}
          <div
            data-layout="table"
            className="hidden overflow-x-auto rounded-xl border border-satin bg-surface-raised md:block"
          >
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
                        <p className="font-medium text-foreground">{candidateDisplayName(item, t)}</p>
                        <p className="text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
                      </div>
                    </TableCell>
                    <TableCell title={item.sessionId} className="max-w-64 whitespace-normal">
                      <UnscoredStatus item={item} />
                    </TableCell>
                    <TableCell>
                      <UnscoredFlagList flags={item.flags} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul data-layout="cards" className="space-y-3 md:hidden">
            {list.map((item) => (
              <li
                key={`mobile-${item.candidateId}-${item.sessionId}`}
                className="frame-satin rounded-xl bg-surface-raised p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{candidateDisplayName(item, t)}</p>
                    <p className="text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
                  </div>
                  <div title={item.sessionId} className="max-w-[60%] text-right">
                    <UnscoredStatus item={item} />
                  </div>
                </div>
                <div className="mt-3 border-t border-satin pt-3">
                  <UnscoredFlagList flags={item.flags} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
