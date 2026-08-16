import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem, CampaignResultStatus } from '../../types/campaign.api.types';
import {
  formatResultDateTime,
  formatResultScore,
  getResultFlagCount,
  hasResultOverride,
} from '../../utils/campaignResultsActions';

export function ResultStatusBadge({ result }: { result: CampaignResultStatus }) {
  const { t } = useLanguage();
  if (result === 'Pass') {
    return (
      <Badge className="border-transparent bg-success/15 text-success">
        {t('employer.campaigns.results.pass')}
      </Badge>
    );
  }
  if (result === 'Fail') {
    return (
      <Badge variant="destructive">{t('employer.campaigns.results.fail')}</Badge>
    );
  }
  return (
    <Badge variant="outline">{t('employer.campaigns.results.undetermined')}</Badge>
  );
}

export function ResultOverrideBadge({ item }: { item: CampaignResultItem }) {
  const { t, language } = useLanguage();
  if (!hasResultOverride(item)) {
    return (
      <span className="text-xs text-muted-foreground">
        {t('employer.campaigns.results.override.none')}
      </span>
    );
  }
  const title = item.overriddenAt
    ? t('employer.campaigns.results.override.at').replace(
        '{{time}}',
        formatResultDateTime(item.overriddenAt, language),
      )
    : undefined;
  return (
    <Badge
      variant="secondary"
      title={title}
      className="border-transparent bg-info/15 text-info"
    >
      {t('employer.campaigns.results.override.badge')}
    </Badge>
  );
}

export function ResultFlagsCell({ item }: { item: CampaignResultItem }) {
  const { t } = useLanguage();
  const flagCount = getResultFlagCount(item.flags);
  if (flagCount === 0) {
    return <span className="text-xs text-muted-foreground">{t('employer.campaigns.results.flags.none')}</span>;
  }
  const summary = item.flags.map((flag) => `${flag.type}: ${flag.count}`).join('\n');
  const notes = item.flags
    .filter((flag) => flag.note?.trim())
    .map((flag) => `${flag.type}: ${flag.note}`)
    .join('\n');
  return (
    <span
      className="text-xs text-warning"
      title={[summary, notes].filter(Boolean).join('\n\n')}
    >
      {t('employer.campaigns.results.flags.count').replace(
        '{{count}}',
        String(flagCount),
      )}
    </span>
  );
}

export function ResultScoreCells({ item }: { item: CampaignResultItem }) {
  const { t } = useLanguage();
  const adjusted = item.totalScore !== item.aiScore || hasResultOverride(item);
  return (
    <>
      <span className="text-base font-semibold tabular-nums text-foreground">
        {formatResultScore(item.totalScore)}
      </span>
      <div className="space-y-0.5 text-xs text-muted-foreground">
        <p>
          {t('employer.campaigns.results.aiScore')}: {formatResultScore(item.aiScore)}
        </p>
        {adjusted ? (
          <p className="text-info">{t('employer.campaigns.results.override.badge')}</p>
        ) : null}
      </div>
    </>
  );
}

export function candidateDisplayName(
  item: Pick<CampaignResultItem, 'fullName' | 'email'>,
  t: (key: string) => string,
) {
  return (
    item.fullName?.trim() ||
    item.email?.trim() ||
    t('employer.campaigns.results.noName')
  );
}

export function candidateDisplayEmail(
  item: Pick<CampaignResultItem, 'email'>,
  t: (key: string) => string,
) {
  return item.email?.trim() || t('employer.campaigns.results.noEmail');
}
