import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { CampaignResultItem, TranscriptQuestion } from '../../../types/campaign.api.types';
import { candidateDisplayEmail, candidateDisplayName, ResultStatusBadge } from '../ResultBadges';

export function ResultDetailHeader({ campaignName, item, total, questions, previous, next, onClose, onNavigate }: {
  campaignName: string; item: CampaignResultItem; total: number; questions: TranscriptQuestion[]; previous: CampaignResultItem | null; next: CampaignResultItem | null;
  onClose: () => void; onNavigate: (sessionId: string) => void;
}) {
  const { t } = useLanguage();
  const reviewCount = questions.filter((question) => question.needsReview).length;
  return <header className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{campaignName}</p>
        <h1 className="heading-primary mt-2 text-2xl">{candidateDisplayName(item, t)}</h1>
        <p className="text-sm text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
      </div>
      <Button variant="ghost" size="icon" aria-label={t('employer.campaigns.results.detail.close')} onClick={onClose}><X aria-hidden /></Button>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline">{t('employer.campaigns.results.detail.rank').replace('{{rank}}', String(item.rank)).replace('{{total}}', String(total))}</Badge>
      <ResultStatusBadge result={item.result} />
      <Badge variant="outline" className={reviewCount ? 'border-warning/30 bg-warning/10 text-warning' : ''}>{t('employer.campaigns.results.detail.needsReview').replace('{{count}}', String(reviewCount))}</Badge>
    </div>
    <nav className="flex flex-wrap gap-2" aria-label={t('employer.campaigns.results.detail.candidateNavigation')}>
      <Button variant="outline" size="sm" disabled={!previous} onClick={() => previous && onNavigate(previous.sessionId)}><ArrowLeft aria-hidden />{t('employer.campaigns.results.detail.previous')}</Button>
      <Button variant="outline" size="sm" disabled={!next} onClick={() => next && onNavigate(next.sessionId)}>{t('employer.campaigns.results.detail.next')}<ArrowRight aria-hidden /></Button>
    </nav>
  </header>;
}
