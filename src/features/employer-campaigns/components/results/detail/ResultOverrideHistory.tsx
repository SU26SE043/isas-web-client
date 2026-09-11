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

export function ResultOverrideHistory({ campaignId, item, history, isLoading, isError }: { campaignId: string; item: CampaignResultItem; history: CampaignResultOverrideHistoryItem[]; isLoading: boolean; isError: boolean }) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const latest = history[0];
  if (isLoading) return <div className="frame-satin flex items-center gap-2 rounded-xl bg-surface-raised p-4"><Spinner className="size-4" />{t('employer.campaigns.results.override.historyLoading')}</div>;
  if (isError) return <Alert variant="error"><AlertDescription>{t('employer.campaigns.results.override.historyError')}</AlertDescription></Alert>;
  const summary = latest?.kind === 'Set' ? `${formatResultScore(latest.score)} · ${latest.result === 'Pass' ? t('employer.campaigns.results.pass') : latest.result === 'Fail' ? t('employer.campaigns.results.fail') : t('employer.campaigns.results.override.unchanged')} · ${latest.actorEmail?.trim() || t('employer.campaigns.results.override.unknownActor')} · ${formatResultDateTime(latest.at, language)} · ${history.length} ${t('employer.campaigns.results.override.changes')}` : null;
  return <section className="frame-satin rounded-xl bg-surface-raised p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h2 className="flex items-center gap-2 font-semibold text-foreground"><History className="size-4" aria-hidden />{t('employer.campaigns.results.override.historyTitle')}</h2>{summary ? <p className="mt-2 truncate text-sm text-muted-foreground">{summary}</p> : <p className="mt-2 text-sm text-muted-foreground">{t('employer.campaigns.results.override.noHistory').replace('{{score}}', formatResultScore(item.aiScore))}</p>}</div><div className="flex flex-wrap gap-2">{history.length ? <Button size="sm" variant="outline" onClick={() => setExpanded((value) => !value)}>{expanded ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}{t('employer.campaigns.results.override.viewHistory')}</Button> : null}<Button size="sm" onClick={() => setOverrideOpen(true)}>{t('employer.campaigns.results.actions.override')}</Button>{hasResultOverride(item) ? <Button size="sm" variant="outline" onClick={() => setClearOpen(true)}>{t('employer.campaigns.results.actions.clearOverride')}</Button> : null}</div></div>{expanded ? <div className="mt-4 space-y-3 border-l border-satin pl-4">{history.map((entry) => <HistoryEntry key={entry.id} entry={entry} aiScore={item.aiScore} />)}</div> : null}<OverrideResultModal open={overrideOpen} campaignId={campaignId} item={item} onClose={() => setOverrideOpen(false)} /><ClearOverrideDialog open={clearOpen} campaignId={campaignId} item={item} onClose={() => setClearOpen(false)} /></section>;
}

function HistoryEntry({ entry, aiScore }: { entry: CampaignResultOverrideHistoryItem; aiScore: number }) {
  const { t, language } = useLanguage();
  const isSet = entry.kind === 'Set';
  return <article className="relative space-y-1"><span className={`absolute -left-[21px] top-1 size-2 rounded-full ${isSet ? 'bg-info' : 'bg-muted-foreground'}`} aria-hidden /><div className="flex flex-wrap items-center gap-2"><Badge variant={isSet ? 'default' : 'outline'}>{isSet ? t('employer.campaigns.results.override.adjusted') : t('employer.campaigns.results.override.cleared')}</Badge><span className="text-sm text-muted-foreground">{t('employer.campaigns.results.override.toScore').replace('{{score}}', formatResultScore(isSet ? entry.score : aiScore))}</span></div><p className="text-sm text-foreground">{formatResultScore(entry.score)} · {entry.result === 'Pass' ? t('employer.campaigns.results.pass') : entry.result === 'Fail' ? t('employer.campaigns.results.fail') : t('employer.campaigns.results.override.unchanged')} · {entry.actorEmail?.trim() || t('employer.campaigns.results.override.unknownActor')}</p><p className="text-xs text-muted-foreground">{formatResultDateTime(entry.at, language)} · {entry.note || t('employer.campaigns.results.override.unchanged')}{entry.source === 'AuditBackfill' ? ` · ${t('employer.campaigns.results.override.auditBackfill')}` : ''}</p></article>;
}
