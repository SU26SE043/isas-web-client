import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import {
  formatResultDateTime,
  formatResultScore,
} from '../../utils/campaignResultsActions';
import {
  ResultFlagsCell,
  ResultOverrideBadge,
  ResultStatusBadge,
  candidateDisplayEmail,
  candidateDisplayName,
} from './ResultBadges';
import { ResultsActionsMenu } from './ResultsActionsMenu';

interface ResultsRankingTableProps {
  items: CampaignResultItem[];
  onViewDetails: (item: CampaignResultItem) => void;
  onOverride: (item: CampaignResultItem) => void;
  onClearOverride: (item: CampaignResultItem) => void;
}

export function ResultsRankingTable({
  items,
  onViewDetails,
  onOverride,
  onClearOverride,
}: ResultsRankingTableProps) {
  const { t, language } = useLanguage();

  return (
    <>
      <div className="hidden md:block">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('employer.campaigns.results.columns.rank')}</TableHead>
              <TableHead>{t('employer.campaigns.results.columns.candidate')}</TableHead>
              <TableHead>{t('employer.campaigns.results.columns.totalScore')}</TableHead>
              <TableHead className="hidden lg:table-cell">
                {t('employer.campaigns.results.columns.aiScore')}
              </TableHead>
              <TableHead>{t('employer.campaigns.results.columns.result')}</TableHead>
              <TableHead className="hidden xl:table-cell">
                {t('employer.campaigns.results.columns.override')}
              </TableHead>
              <TableHead>{t('employer.campaigns.results.columns.flags')}</TableHead>
              <TableHead className="hidden lg:table-cell">
                {t('employer.campaigns.results.columns.scoredAt')}
              </TableHead>
              <TableHead>{t('employer.campaigns.results.columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={`${item.candidateId}-${item.sessionId}`}>
                <TableCell className="font-semibold tabular-nums text-foreground">
                  #{item.rank}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{candidateDisplayName(item, t)}</p>
                  <p className="text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
                </TableCell>
                <TableCell className="text-base font-semibold tabular-nums text-foreground">
                  {formatResultScore(item.totalScore)}
                </TableCell>
                <TableCell className="hidden tabular-nums text-muted-foreground lg:table-cell">
                  {formatResultScore(item.aiScore)}
                </TableCell>
                <TableCell>
                  <ResultStatusBadge result={item.result} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <ResultOverrideBadge item={item} />
                </TableCell>
                <TableCell>
                  <ResultFlagsCell item={item} />
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  {formatResultDateTime(item.scoredAt, language)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => onViewDetails(item)}>
                      {t('employer.campaigns.results.actions.viewDetails')}
                    </Button>
                    <ResultsActionsMenu
                      item={item}
                      onViewDetails={() => onViewDetails(item)}
                      onOverride={() => onOverride(item)}
                      onClearOverride={() => onClearOverride(item)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article
            key={`${item.candidateId}-${item.sessionId}`}
            className="rounded-xl border border-satin bg-surface-overlay p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">
                  #{item.rank} {candidateDisplayName(item, t)}
                </p>
                <p className="text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
              </div>
              <ResultsActionsMenu
                item={item}
                onViewDetails={() => onViewDetails(item)}
                onOverride={() => onOverride(item)}
                onClearOverride={() => onClearOverride(item)}
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('employer.campaigns.results.columns.totalScore')}
                </dt>
                <dd className="font-semibold tabular-nums">{formatResultScore(item.totalScore)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('employer.campaigns.results.columns.aiScore')}
                </dt>
                <dd className="tabular-nums text-muted-foreground">
                  {formatResultScore(item.aiScore)}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ResultStatusBadge result={item.result} />
              <ResultOverrideBadge item={item} />
              <ResultFlagsCell item={item} />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => onViewDetails(item)}
            >
              {t('employer.campaigns.results.actions.viewDetails')}
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
