import { useState } from 'react';
import { ChevronDown, ChevronUp, History } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem, CampaignResultOverrideHistoryItem } from '../../../types/campaign.api.types';
import { formatResultDateTime, formatResultScore, hasResultOverride } from '../../../utils/campaignResultsActions';
import { ClearOverrideDialog } from '../ClearOverrideDialog';
import { OverrideResultModal } from '../OverrideResultModal';

type Props = {
  campaignId: string;
  item: CampaignResultItem;
  history: CampaignResultOverrideHistoryItem[];
  isLoading: boolean;
  isError: boolean;
};

function useResultLabel() {
  const { t } = useLanguage();
  return (result: 'Pass' | 'Fail' | null) =>
    result === 'Pass'
      ? t('employer.campaigns.results.pass')
      : result === 'Fail'
        ? t('employer.campaigns.results.fail')
        : t('employer.campaigns.results.override.unchanged');
}

// Ai đã sửa: email snapshot lúc ghi; null (dòng dựng lại từ audit) → nói thẳng "không rõ", KHÔNG để trống.
function actorLabel(entry: CampaignResultOverrideHistoryItem, unknown: string): string {
  return entry.actorEmail?.trim() || unknown;
}

/**
 * "Điều chỉnh của HR" — trạng thái hiện tại thu gọn 1 dòng + timeline lịch sử (mới-nhất-trước) + nút
 * Điều chỉnh / Xóa tái dùng nguyên modal/dialog của bảng xếp hạng. Điểm AI gốc không đổi qua mọi lần.
 */
export function ResultOverrideHistory({ campaignId, item, history, isLoading, isError }: Props) {
  const { t, language } = useLanguage();
  const resultLabel = useResultLabel();
  const [expanded, setExpanded] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const latest = history[0];

  if (isLoading) {
    return (
      <div className="frame-satin flex items-center gap-2 rounded-xl bg-surface-raised p-4">
        <Spinner className="size-4" />
        {t('employer.campaigns.results.override.historyLoading')}
      </div>
    );
  }
  if (isError) {
    return (
      <Alert variant="error">
        <AlertDescription>{t('employer.campaigns.results.override.historyError')}</AlertDescription>
      </Alert>
    );
  }

  const unknownActor = t('employer.campaigns.results.override.unknownActor');
  const summary =
    latest?.kind === 'Set'
      ? [
          formatResultScore(latest.score),
          resultLabel(latest.result),
          actorLabel(latest, unknownActor),
          formatResultDateTime(latest.at, language),
          `${history.length} ${t('employer.campaigns.results.override.changes')}`,
        ].join(' · ')
      : null;

  return (
    <section className="frame-satin rounded-xl bg-surface-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <History className="size-4" aria-hidden />
            {t('employer.campaigns.results.override.historyTitle')}
          </h2>
          {summary ? (
            <p className="mt-2 truncate text-sm text-muted-foreground">{summary}</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('employer.campaigns.results.override.noHistory').replace('{{score}}', formatResultScore(item.aiScore))}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {history.length ? (
            <Button size="sm" variant="outline" onClick={() => setExpanded((value) => !value)}>
              {expanded ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
              {t('employer.campaigns.results.override.viewHistory')}
            </Button>
          ) : null}
          <Button size="sm" onClick={() => setOverrideOpen(true)}>
            {t('employer.campaigns.results.actions.override')}
          </Button>
          {hasResultOverride(item) ? (
            <Button size="sm" variant="outline" onClick={() => setClearOpen(true)}>
              {t('employer.campaigns.results.actions.clearOverride')}
            </Button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <ol className="mt-4 space-y-3 border-l border-satin pl-4">
          {history.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} aiScore={item.aiScore} />
          ))}
        </ol>
      ) : null}

      <OverrideResultModal open={overrideOpen} campaignId={campaignId} item={item} onClose={() => setOverrideOpen(false)} />
      <ClearOverrideDialog open={clearOpen} campaignId={campaignId} item={item} onClose={() => setClearOpen(false)} />
    </section>
  );
}

function HistoryEntry({ entry, aiScore }: { entry: CampaignResultOverrideHistoryItem; aiScore: number }) {
  const { t, language } = useLanguage();
  const resultLabel = useResultLabel();
  const isSet = entry.kind === 'Set';
  return (
    <li className="relative space-y-1">
      <span
        className={`absolute -left-[21px] top-1 size-2 rounded-full ${isSet ? 'bg-info' : 'bg-muted-foreground'}`}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isSet ? 'default' : 'outline'}>
          {isSet ? t('employer.campaigns.results.override.adjusted') : t('employer.campaigns.results.override.cleared')}
        </Badge>
        <span className="text-sm font-medium text-foreground">
          {isSet
            ? `${formatResultScore(entry.score)} · ${resultLabel(entry.result)}`
            : t('employer.campaigns.results.override.toScore').replace('{{score}}', formatResultScore(aiScore))}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {actorLabel(entry, t('employer.campaigns.results.override.unknownActor'))} · {formatResultDateTime(entry.at, language)}
        {entry.source === 'AuditBackfill' ? ` · ${t('employer.campaigns.results.override.auditBackfill')}` : ''}
      </p>
      <p className="text-sm text-foreground">{entry.note || t('employer.campaigns.results.override.unchanged')}</p>
    </li>
  );
}
