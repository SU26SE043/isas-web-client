import { useLanguage } from '@/shared/languages';
import { Input } from '@/components/ui/input';
import type {
  ResultsOutcomeFilter,
  ResultsReviewFilter,
  ResultsSort,
} from '../../utils/campaignResultsActions';

interface ResultsToolbarProps {
  search: string;
  outcome: ResultsOutcomeFilter;
  review: ResultsReviewFilter;
  sort: ResultsSort;
  onSearchChange: (value: string) => void;
  onOutcomeChange: (value: ResultsOutcomeFilter) => void;
  onReviewChange: (value: ResultsReviewFilter) => void;
  onSortChange: (value: ResultsSort) => void;
}

const selectClass =
  'h-9 rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function ResultsToolbar({
  search,
  outcome,
  review,
  sort,
  onSearchChange,
  onOutcomeChange,
  onReviewChange,
  onSortChange,
}: ResultsToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('employer.campaigns.results.searchPlaceholder')}
        aria-label={t('employer.campaigns.results.searchPlaceholder')}
      />
      <select
        className={`${selectClass} max-md:min-w-[12rem]`}
        value={outcome}
        onChange={(event) => onOutcomeChange(event.target.value as ResultsOutcomeFilter)}
        aria-label={t('employer.campaigns.results.filters.outcome')}
      >
        <option value="all">{t('employer.campaigns.results.filters.outcomeAll')}</option>
        <option value="pass">{t('employer.campaigns.results.pass')}</option>
        <option value="fail">{t('employer.campaigns.results.fail')}</option>
        <option value="undetermined">{t('employer.campaigns.results.undetermined')}</option>
      </select>
      <select
        className={`${selectClass} max-md:min-w-[12rem]`}
        value={review}
        onChange={(event) => onReviewChange(event.target.value as ResultsReviewFilter)}
        aria-label={t('employer.campaigns.results.filters.review')}
      >
        <option value="all">{t('employer.campaigns.results.filters.reviewAll')}</option>
        <option value="overridden">{t('employer.campaigns.results.filters.overridden')}</option>
        <option value="notOverridden">{t('employer.campaigns.results.filters.notOverridden')}</option>
        <option value="flagged">{t('employer.campaigns.results.filters.flagged')}</option>
        <option value="notFlagged">{t('employer.campaigns.results.filters.notFlagged')}</option>
      </select>
      <select
        className={`${selectClass} max-md:min-w-[12rem]`}
        value={sort}
        onChange={(event) => onSortChange(event.target.value as ResultsSort)}
        aria-label={t('employer.campaigns.results.filters.sort')}
      >
        <option value="rankAsc">{t('employer.campaigns.results.sort.rankAsc')}</option>
        <option value="rankDesc">{t('employer.campaigns.results.sort.rankDesc')}</option>
        <option value="scoreDesc">{t('employer.campaigns.results.sort.scoreDesc')}</option>
        <option value="scoreAsc">{t('employer.campaigns.results.sort.scoreAsc')}</option>
        <option value="scoredDesc">{t('employer.campaigns.results.sort.scoredDesc')}</option>
        <option value="scoredAsc">{t('employer.campaigns.results.sort.scoredAsc')}</option>
      </select>
    </div>
  );
}
